/**
 * Exchange Rate Configuration and Utilities
 * Manual exchange rate management for multi-currency content pricing
 */

export interface ExchangeRates {
  baseCurrency: string;
  rates: Record<string, number>;
  lastUpdated: number;
}

// Manual exchange rates - Base currency is USD
// TODO: Replace with dynamic API integration later
export const EXCHANGE_RATES: ExchangeRates = {
  baseCurrency: 'USD',
  rates: {
    USD: 1.0,        // Base currency
    NGN: 1650.0,     // 1 USD = 1650 NGN
    GBP: 0.79,       // 1 USD = 0.79 GBP
    EUR: 0.92,       // 1 USD = 0.92 EUR
    CAD: 1.36,       // 1 USD = 1.36 CAD
    GHS: 15.8,       // 1 USD = 15.8 GHS
    KES: 129.0,      // 1 USD = 129 KES
    GMD: 68.5,       // 1 USD = 68.5 GMD
    ZAR: 18.2,       // 1 USD = 18.2 ZAR
  },
  lastUpdated: Date.now()
};

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const rates = EXCHANGE_RATES.rates;
  
  if (!rates[fromCurrency] || !rates[toCurrency]) {
    throw new Error(`Exchange rate not available for ${fromCurrency} to ${toCurrency}`);
  }

  // Convert to USD first, then to target currency
  const usdAmount = amount / rates[fromCurrency];
  const convertedAmount = usdAmount * rates[toCurrency];
  
  return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
}

/**
 * Get exchange rate between two currencies
 */
export function getExchangeRate(fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) {
    return 1.0;
  }

  const rates = EXCHANGE_RATES.rates;
  
  if (!rates[fromCurrency] || !rates[toCurrency]) {
    throw new Error(`Exchange rate not available for ${fromCurrency} to ${toCurrency}`);
  }

  return rates[toCurrency] / rates[fromCurrency];
}

/**
 * Check if user has sufficient balance across all currencies for a purchase
 */
export function checkSufficientBalance(
  walletBalances: Record<string, number>,
  requiredAmount: number,
  requiredCurrency: string
): {
  hasSufficient: boolean;
  availableCurrencies: Array<{
    currency: string;
    balance: number;
    convertedAmount: number;
  }>;
} {
  const availableCurrencies = [];
  let hasSufficient = false;

  for (const [currency, balance] of Object.entries(walletBalances)) {
    if (balance > 0) {
      try {
        const convertedAmount = convertCurrency(balance, currency, requiredCurrency);
        availableCurrencies.push({
          currency,
          balance,
          convertedAmount
        });

        if (convertedAmount >= requiredAmount) {
          hasSufficient = true;
        }
      } catch (error) {
        // Skip currencies with no exchange rate
        continue;
      }
    }
  }

  return {
    hasSufficient,
    availableCurrencies: availableCurrencies.sort((a, b) => b.convertedAmount - a.convertedAmount)
  };
}

/**
 * Find the best currency to use for payment
 */
export function findBestPaymentCurrency(
  walletBalances: Record<string, number>,
  requiredAmount: number,
  requiredCurrency: string
): {
  currency: string;
  balance: number;
  amountToDeduct: number;
} | null {
  // First try to pay in the same currency
  if (walletBalances[requiredCurrency] >= requiredAmount) {
    return {
      currency: requiredCurrency,
      balance: walletBalances[requiredCurrency],
      amountToDeduct: requiredAmount
    };
  }

  // Find the currency with sufficient balance that requires the least conversion
  for (const [currency, balance] of Object.entries(walletBalances)) {
    if (balance > 0) {
      try {
        const convertedAmount = convertCurrency(balance, currency, requiredCurrency);
        if (convertedAmount >= requiredAmount) {
          const amountToDeduct = convertCurrency(requiredAmount, requiredCurrency, currency);
          return {
            currency,
            balance,
            amountToDeduct
          };
        }
      } catch (error) {
        continue;
      }
    }
  }

  return null;
}