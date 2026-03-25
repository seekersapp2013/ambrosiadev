/**
 * Phone number country detection service using libphonenumber-js
 */

import { parsePhoneNumber, getCountryCallingCode, CountryCode } from 'libphonenumber-js';
import { getCurrencyForCountry } from './currencyConfig';

export interface PhoneDetectionResult {
  country: string;
  currency: string;
  countryCode: string;
  isValid: boolean;
  formattedNumber?: string;
  nationalNumber?: string;
  error?: string;
}

/**
 * Phone number country detection service
 */
export class PhoneCountryDetectionService {
  /**
   * Detect country and currency from phone number
   */
  detectCountryFromPhone(phoneNumber: string): PhoneDetectionResult {
    try {
      // Clean the phone number (remove spaces, dashes, etc.)
      const cleanedNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
      
      if (!cleanedNumber) {
        return {
          country: '',
          currency: 'USD',
          countryCode: '',
          isValid: false,
          error: 'Phone number is required'
        };
      }

      // Parse the phone number
      const parsed = parsePhoneNumber(cleanedNumber);
      
      if (!parsed || !parsed.isValid()) {
        return {
          country: '',
          currency: 'USD',
          countryCode: '',
          isValid: false,
          error: 'Invalid phone number format'
        };
      }

      const country = parsed.country as string;
      const countryCode = `+${getCountryCallingCode(country as CountryCode)}`;
      const currency = getCurrencyForCountry(country);
      
      return {
        country,
        currency,
        countryCode,
        isValid: true,
        formattedNumber: parsed.formatInternational(),
        nationalNumber: parsed.formatNational()
      };

    } catch (error) {
      return {
        country: '',
        currency: 'USD',
        countryCode: '',
        isValid: false,
        error: `Phone parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): {
    isValid: boolean;
    error?: string;
    formatted?: string;
  } {
    try {
      const cleanedNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
      
      if (!cleanedNumber) {
        return { isValid: false, error: 'Phone number is required' };
      }

      const parsed = parsePhoneNumber(cleanedNumber);
      
      if (!parsed) {
        return { isValid: false, error: 'Unable to parse phone number' };
      }

      if (!parsed.isValid()) {
        return { isValid: false, error: 'Invalid phone number' };
      }

      return {
        isValid: true,
        formatted: parsed.formatInternational()
      };

    } catch (error) {
      return {
        isValid: false,
        error: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Format phone number for display
   */
  formatPhoneNumber(phoneNumber: string, format: 'international' | 'national' = 'international'): string {
    try {
      const cleanedNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
      const parsed = parsePhoneNumber(cleanedNumber);
      
      if (!parsed || !parsed.isValid()) {
        return phoneNumber; // Return original if can't parse
      }

      return format === 'international' 
        ? parsed.formatInternational()
        : parsed.formatNational();

    } catch (error) {
      return phoneNumber; // Return original if formatting fails
    }
  }

  /**
   * Get example phone number for a country
   */
  getExampleNumber(countryCode: CountryCode): string {
    try {
      // This is a simplified example - in a real app you might want to use
      // the getExampleNumber function from libphonenumber-js/examples
      const examples: Record<string, string> = {
        'US': '+1 201 555 0123',
        'CA': '+1 204 555 0123',
        'GB': '+44 20 7946 0958',
        'DE': '+49 30 12345678',
        'FR': '+33 1 23 45 67 89',
        'NG': '+234 802 123 4567',
        'GH': '+233 20 123 4567',
        'KE': '+254 20 123 4567',
        'GM': '+220 123 4567',
        'ZA': '+27 21 123 4567'
      };

      return examples[countryCode] || '+1 201 555 0123';
    } catch (error) {
      return '+1 201 555 0123';
    }
  }

  /**
   * Get supported countries for phone detection
   */
  getSupportedCountries(): Array<{ code: CountryCode; name: string; currency: string }> {
    const supportedCountries: Array<{ code: CountryCode; name: string; currency: string }> = [
      { code: 'US', name: 'United States', currency: 'USD' },
      { code: 'CA', name: 'Canada', currency: 'CAD' },
      { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
      { code: 'DE', name: 'Germany', currency: 'EUR' },
      { code: 'FR', name: 'France', currency: 'EUR' },
      { code: 'IT', name: 'Italy', currency: 'EUR' },
      { code: 'ES', name: 'Spain', currency: 'EUR' },
      { code: 'NL', name: 'Netherlands', currency: 'EUR' },
      { code: 'NG', name: 'Nigeria', currency: 'NGN' },
      { code: 'GH', name: 'Ghana', currency: 'GHS' },
      { code: 'KE', name: 'Kenya', currency: 'KES' },
      { code: 'GM', name: 'Gambia', currency: 'GMD' },
      { code: 'ZA', name: 'South Africa', currency: 'ZAR' }
    ];

    return supportedCountries;
  }
}

// Export singleton instance
export const phoneDetectionService = new PhoneCountryDetectionService();