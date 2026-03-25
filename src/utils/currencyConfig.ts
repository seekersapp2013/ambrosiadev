/**
 * Currency configuration and utilities for multi-currency wallet system
 */

export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  decimals: number;
  deposits: boolean;
  withdrawals: boolean;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
    decimals: 2,
    deposits: true,
    withdrawals: false
  },
  NGN: {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    flag: '🇳🇬',
    decimals: 2,
    deposits: true,
    withdrawals: true // Only NGN withdrawals allowed
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    flag: '🇬🇧',
    decimals: 2,
    deposits: true,
    withdrawals: false
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    decimals: 2,
    deposits: true,
    withdrawals: false
  },
  CAD: {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    flag: '🇨🇦',
    decimals: 2,
    deposits: true,
    withdrawals: false
  },
  GHS: {
    code: 'GHS',
    name: 'Ghanaian Cedi',
    symbol: '₵',
    flag: '🇬🇭',
    decimals: 2,
    deposits: true,
    withdrawals: false
  },
  KES: {
    code: 'KES',
    name: 'Kenyan Shilling',
    symbol: 'KSh',
    flag: '🇰🇪',
    decimals: 2,
    deposits: true,
    withdrawals: false
  },
  GMD: {
    code: 'GMD',
    name: 'Gambian Dalasi',
    symbol: 'D',
    flag: '🇬🇲',
    decimals: 2,
    deposits: true,
    withdrawals: false
  },
  ZAR: {
    code: 'ZAR',
    name: 'South African Rand',
    symbol: 'R',
    flag: '🇿🇦',
    decimals: 2,
    deposits: true,
    withdrawals: false
  }
};

/**
 * Get all supported currencies as an array
 */
export function getSupportedCurrencies(): CurrencyConfig[] {
  return Object.values(SUPPORTED_CURRENCIES);
}

/**
 * Get currencies that support deposits
 */
export function getDepositCurrencies(): CurrencyConfig[] {
  return getSupportedCurrencies().filter(currency => currency.deposits);
}

/**
 * Get currencies that support withdrawals (only NGN)
 */
export function getWithdrawalCurrencies(): CurrencyConfig[] {
  return getSupportedCurrencies().filter(currency => currency.withdrawals);
}

/**
 * Validate if a currency code is supported
 */
export function isSupportedCurrency(code: string): boolean {
  return code in SUPPORTED_CURRENCIES;
}

/**
 * Validate if deposits are allowed for a currency
 */
export function isDepositAllowed(code: string): boolean {
  const currency = SUPPORTED_CURRENCIES[code];
  return currency ? currency.deposits : false;
}

/**
 * Validate if withdrawals are allowed for a currency
 */
export function isWithdrawalAllowed(code: string): boolean {
  const currency = SUPPORTED_CURRENCIES[code];
  return currency ? currency.withdrawals : false;
}

/**
 * Get currency configuration by code
 */
export function getCurrencyConfig(code: string): CurrencyConfig | null {
  return SUPPORTED_CURRENCIES[code] || null;
}

/**
 * Format currency amount with proper symbol and decimals
 */
export function formatCurrencyAmount(amount: number, currencyCode: string): string {
  const currency = getCurrencyConfig(currencyCode);
  if (!currency) {
    return `${amount.toFixed(2)} ${currencyCode}`;
  }

  const formattedAmount = amount.toFixed(currency.decimals);
  
  // Handle special symbol positioning
  switch (currencyCode) {
    case 'USD':
    case 'CAD':
      return `${currency.symbol}${formattedAmount}`;
    case 'EUR':
    case 'GBP':
      return `${currency.symbol}${formattedAmount}`;
    case 'NGN':
    case 'GHS':
    case 'ZAR':
      return `${currency.symbol}${formattedAmount}`;
    case 'KES':
    case 'GMD':
      return `${currency.symbol} ${formattedAmount}`;
    default:
      return `${formattedAmount} ${currencyCode}`;
  }
}

/**
 * Country to currency mapping for phone number detection
 */
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  // North America
  'US': 'USD',
  'CA': 'CAD',
  
  // Europe (Euro zone)
  'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR',
  'NL': 'EUR', 'BE': 'EUR', 'AT': 'EUR', 'PT': 'EUR',
  'IE': 'EUR', 'FI': 'EUR', 'GR': 'EUR', 'LU': 'EUR',
  'EE': 'EUR', 'LV': 'EUR', 'LT': 'EUR', 'SI': 'EUR',
  'SK': 'EUR', 'CY': 'EUR', 'MT': 'EUR',
  
  // Europe (Non-Euro)
  'GB': 'GBP',
  
  // Africa
  'NG': 'NGN',
  'GH': 'GHS',
  'KE': 'KES',
  'GM': 'GMD',
  'ZA': 'ZAR'
};

/**
 * Get currency for a country code
 */
export function getCurrencyForCountry(countryCode: string): string {
  return COUNTRY_TO_CURRENCY[countryCode] || 'USD'; // Default to USD
}

/**
 * Get country name for display
 */
export function getCountryName(countryCode: string): string {
  const countryNames: Record<string, string> = {
    'US': 'United States',
    'CA': 'Canada',
    'GB': 'United Kingdom',
    'DE': 'Germany',
    'FR': 'France',
    'IT': 'Italy',
    'ES': 'Spain',
    'NL': 'Netherlands',
    'BE': 'Belgium',
    'AT': 'Austria',
    'PT': 'Portugal',
    'IE': 'Ireland',
    'FI': 'Finland',
    'GR': 'Greece',
    'LU': 'Luxembourg',
    'NG': 'Nigeria',
    'GH': 'Ghana',
    'KE': 'Kenya',
    'GM': 'Gambia',
    'ZA': 'South Africa'
  };
  
  return countryNames[countryCode] || countryCode;
}

/**
 * Validate currency amount
 */
export function validateCurrencyAmount(amount: number, currencyCode: string): {
  isValid: boolean;
  error?: string;
} {
  const currency = getCurrencyConfig(currencyCode);
  
  if (!currency) {
    return { isValid: false, error: `Unsupported currency: ${currencyCode}` };
  }
  
  if (amount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }
  
  if (!Number.isFinite(amount)) {
    return { isValid: false, error: 'Amount must be a valid number' };
  }
  
  // Check decimal places
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  if (decimalPlaces > currency.decimals) {
    return { 
      isValid: false, 
      error: `Amount cannot have more than ${currency.decimals} decimal places for ${currencyCode}` 
    };
  }
  
  return { isValid: true };
}

/**
 * Initialize empty balance object for all currencies
 */
export function createEmptyBalances(): Record<string, number> {
  const balances: Record<string, number> = {};
  
  for (const currencyCode of Object.keys(SUPPORTED_CURRENCIES)) {
    balances[currencyCode] = 0;
  }
  
  return balances;
}