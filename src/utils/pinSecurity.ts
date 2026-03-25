/**
 * PIN security service for wallet operations
 * Handles PIN hashing, verification, and validation
 * Uses Web Crypto API for browser compatibility
 */

export interface PINValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PINChangeResult {
  success: boolean;
  hashedPIN?: string;
  error?: string;
}

/**
 * PIN security service
 */
export class PINService {
  private readonly MIN_PIN_LENGTH = 4;
  private readonly MAX_PIN_LENGTH = 6;

  /**
   * Hash a PIN using Web Crypto API (browser-compatible)
   * Note: For production, PIN hashing should be done server-side
   */
  async hashPIN(pin: string): Promise<string> {
    const validation = this.validatePINFormat(pin);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid PIN format');
    }

    try {
      // Generate a random salt
      const salt = crypto.getRandomValues(new Uint8Array(16));
      
      // Convert PIN to bytes
      const encoder = new TextEncoder();
      const pinBytes = encoder.encode(pin);
      
      // Combine salt and PIN
      const combined = new Uint8Array(salt.length + pinBytes.length);
      combined.set(salt);
      combined.set(pinBytes, salt.length);
      
      // Hash using SHA-256
      const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
      const hashArray = new Uint8Array(hashBuffer);
      
      // Combine salt and hash for storage
      const result = new Uint8Array(salt.length + hashArray.length);
      result.set(salt);
      result.set(hashArray, salt.length);
      
      // Convert to base64 for storage
      return btoa(String.fromCharCode(...result));
    } catch (error) {
      throw new Error(`PIN hashing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify a PIN against its hash
   */
  async verifyPIN(pin: string, hashedPIN: string): Promise<boolean> {
    if (!pin || !hashedPIN) {
      return false;
    }

    try {
      // Decode the stored hash
      const stored = new Uint8Array(atob(hashedPIN).split('').map(c => c.charCodeAt(0)));
      
      // Extract salt (first 16 bytes)
      const salt = stored.slice(0, 16);
      const storedHash = stored.slice(16);
      
      // Hash the provided PIN with the same salt
      const encoder = new TextEncoder();
      const pinBytes = encoder.encode(pin);
      
      const combined = new Uint8Array(salt.length + pinBytes.length);
      combined.set(salt);
      combined.set(pinBytes, salt.length);
      
      const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
      const computedHash = new Uint8Array(hashBuffer);
      
      // Compare hashes
      if (computedHash.length !== storedHash.length) {
        return false;
      }
      
      for (let i = 0; i < computedHash.length; i++) {
        if (computedHash[i] !== storedHash[i]) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('PIN verification failed:', error);
      return false;
    }
  }

  /**
   * Change PIN (verify old PIN and hash new PIN)
   */
  async changePIN(oldPIN: string, newPIN: string, currentHash: string): Promise<PINChangeResult> {
    try {
      // Verify old PIN
      const isValidOldPIN = await this.verifyPIN(oldPIN, currentHash);
      if (!isValidOldPIN) {
        return {
          success: false,
          error: 'Current PIN is incorrect'
        };
      }

      // Validate new PIN format
      const validation = this.validatePINFormat(newPIN);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Check if new PIN is different from old PIN
      const isSamePIN = await this.verifyPIN(newPIN, currentHash);
      if (isSamePIN) {
        return {
          success: false,
          error: 'New PIN must be different from current PIN'
        };
      }

      // Hash new PIN
      const hashedPIN = await this.hashPIN(newPIN);
      
      return {
        success: true,
        hashedPIN
      };

    } catch (error) {
      return {
        success: false,
        error: `PIN change failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Validate PIN format (4-6 digits)
   */
  validatePINFormat(pin: string): PINValidationResult {
    if (!pin) {
      return { isValid: false, error: 'PIN is required' };
    }

    if (typeof pin !== 'string') {
      return { isValid: false, error: 'PIN must be a string' };
    }

    // Check if PIN contains only digits
    if (!/^\d+$/.test(pin)) {
      return { isValid: false, error: 'PIN must contain only digits' };
    }

    // Check length
    if (pin.length < this.MIN_PIN_LENGTH) {
      return { isValid: false, error: `PIN must be at least ${this.MIN_PIN_LENGTH} digits` };
    }

    if (pin.length > this.MAX_PIN_LENGTH) {
      return { isValid: false, error: `PIN must be no more than ${this.MAX_PIN_LENGTH} digits` };
    }

    // Check for weak PINs (all same digits, sequential, etc.)
    if (this.isWeakPIN(pin)) {
      return { isValid: false, error: 'PIN is too weak. Avoid repeated or sequential digits' };
    }

    return { isValid: true };
  }

  /**
   * Check if PIN is weak (common patterns)
   */
  private isWeakPIN(pin: string): boolean {
    // All same digits (1111, 2222, etc.)
    if (/^(\d)\1+$/.test(pin)) {
      return true;
    }

    // Sequential ascending (1234, 2345, etc.)
    let isAscending = true;
    for (let i = 1; i < pin.length; i++) {
      if (parseInt(pin[i]) !== parseInt(pin[i - 1]) + 1) {
        isAscending = false;
        break;
      }
    }
    if (isAscending) {
      return true;
    }

    // Sequential descending (4321, 5432, etc.)
    let isDescending = true;
    for (let i = 1; i < pin.length; i++) {
      if (parseInt(pin[i]) !== parseInt(pin[i - 1]) - 1) {
        isDescending = false;
        break;
      }
    }
    if (isDescending) {
      return true;
    }

    // Common weak PINs
    const weakPINs = ['0000', '1234', '4321', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999'];
    if (weakPINs.includes(pin)) {
      return true;
    }

    return false;
  }

  /**
   * Generate PIN strength score (0-100)
   */
  getPINStrength(pin: string): { score: number; feedback: string } {
    if (!pin) {
      return { score: 0, feedback: 'PIN is required' };
    }

    let score = 0;
    let feedback = '';

    // Length bonus
    if (pin.length >= 6) {
      score += 40;
    } else if (pin.length >= 5) {
      score += 30;
    } else if (pin.length >= 4) {
      score += 20;
    }

    // Digit variety bonus
    const uniqueDigits = new Set(pin).size;
    if (uniqueDigits >= 4) {
      score += 30;
    } else if (uniqueDigits >= 3) {
      score += 20;
    } else if (uniqueDigits >= 2) {
      score += 10;
    }

    // Pattern penalty
    if (this.isWeakPIN(pin)) {
      score = Math.max(0, score - 50);
      feedback = 'Avoid common patterns like 1234 or repeated digits';
    }

    // Final score adjustment
    score = Math.min(100, score);

    if (score >= 80) {
      feedback = feedback || 'Strong PIN';
    } else if (score >= 60) {
      feedback = feedback || 'Good PIN';
    } else if (score >= 40) {
      feedback = feedback || 'Fair PIN - consider using more varied digits';
    } else {
      feedback = feedback || 'Weak PIN - use longer PIN with varied digits';
    }

    return { score, feedback };
  }

  /**
   * Get PIN requirements for display
   */
  getPINRequirements(): string[] {
    return [
      `Must be ${this.MIN_PIN_LENGTH}-${this.MAX_PIN_LENGTH} digits long`,
      'Must contain only numbers (0-9)',
      'Avoid repeated digits (1111, 2222)',
      'Avoid sequential digits (1234, 4321)',
      'Avoid common PINs (0000, 1234)'
    ];
  }
}

// Export singleton instance
export const pinService = new PINService();