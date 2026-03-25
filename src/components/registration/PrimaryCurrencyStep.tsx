import { useState } from 'react';
import { getSupportedCurrencies, getCurrencyForCountry, getCountryName } from '../../utils/currencyConfig';
import type { CurrencyConfig } from '../../utils/currencyConfig';

interface PrimaryCurrencyStepProps {
  detectedCountry: string;
  selectedCurrency: string;
  onCurrencySelect: (currency: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PrimaryCurrencyStep({
  detectedCountry,
  selectedCurrency,
  onCurrencySelect,
  onNext,
  onBack
}: PrimaryCurrencyStepProps) {
  const supportedCurrencies = getSupportedCurrencies();
  const defaultCurrency = getCurrencyForCountry(detectedCountry);
  const countryName = getCountryName(detectedCountry);

  const handleCurrencySelect = (currencyCode: string) => {
    onCurrencySelect(currencyCode);
  };

  const handleNext = () => {
    if (selectedCurrency) {
      onNext();
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Your Primary Currency</h2>
        {detectedCountry && (
          <p className="text-gray-600">
            Based on your phone number, we detected you're from <strong>{countryName}</strong>
          </p>
        )}
        <p className="text-gray-500 text-sm mt-2">
          This will be your default currency for transactions and balance display
        </p>
      </div>

      {/* Currency Grid */}
      <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
        {supportedCurrencies.map((currency: CurrencyConfig) => (
          <div
            key={currency.code}
            className={`currency-card p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              selectedCurrency === currency.code
                ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                : 'border-gray-200 bg-white/80 hover:border-gray-300 hover:bg-white/90'
            } ${
              currency.code === defaultCurrency
                ? 'ring-2 ring-green-400 ring-opacity-50'
                : ''
            }`}
            onClick={() => handleCurrencySelect(currency.code)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{currency.flag}</div>
                <div>
                  <h3 className="font-semibold text-gray-800">{currency.code}</h3>
                  <p className="text-gray-600 text-sm">{currency.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-700">{currency.symbol}</span>
                {currency.code === defaultCurrency && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    Recommended
                  </span>
                )}
                {selectedCurrency === currency.code && (
                  <i className="fas fa-check-circle text-blue-500 text-xl"></i>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Currency Info */}
      {selectedCurrency && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-blue-800 font-semibold mb-2">Selected Currency: {selectedCurrency}</h4>
          <div className="text-blue-700 text-sm space-y-1">
            <p>• This will be your default currency for balance display</p>
            <p>• You can deposit in any supported currency</p>
            <p>• Withdrawals are only available in NGN (Nigerian Naira)</p>
            <p>• Cross-currency conversions will be handled automatically</p>
          </div>
        </div>
      )}

      {/* Currency Features Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-gray-800 font-semibold mb-2">Multi-Currency Features:</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-green-700 mb-1">✅ Deposits Supported</h5>
            <p className="text-gray-600">All 9 currencies</p>
          </div>
          <div>
            <h5 className="font-medium text-orange-700 mb-1">⚠️ Withdrawals</h5>
            <p className="text-gray-600">NGN only</p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-4 rounded-3xl text-lg font-bold border-2 border-white/40 text-gray-700 hover:bg-white/20 bg-white/10 backdrop-blur-sm transition-all"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back
        </button>
        
        <button
          type="button"
          onClick={handleNext}
          disabled={!selectedCurrency}
          className="flex-1 black-button py-4 rounded-3xl text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue with {selectedCurrency}
          <i className="fas fa-arrow-right ml-2"></i>
        </button>
      </div>
    </div>
  );
}