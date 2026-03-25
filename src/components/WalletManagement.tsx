import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  getSupportedCurrencies, 
  formatCurrencyAmount,
  getCurrencyConfig,
  type CurrencyConfig
} from '../utils/currencyConfig';

interface WalletManagementProps {
  onNavigate?: (screen: string) => void;
}

export function WalletManagement({ onNavigate }: WalletManagementProps = {}) {
  const [showAllBalances, setShowAllBalances] = useState(false);

  const walletBalance = useQuery(api.wallets.getWalletBalance.getWalletBalance, { currency: "USD" });

  // Get currency configurations
  const supportedCurrencies = getSupportedCurrencies();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Current Balance */}
      <section className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-accent flex items-center">
            <i className="fas fa-wallet mr-2"></i>
            Wallet Balance
          </h2>
          <button
            onClick={() => setShowAllBalances(!showAllBalances)}
            className="text-sm text-accent hover:text-accent-dark font-medium"
          >
            {showAllBalances ? "Show Primary Only" : "Show All Currencies"}
          </button>
        </div>
        
        {walletBalance ? (
          <div>
            {showAllBalances ? (
              // Show all currency balances
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {supportedCurrencies.map((currency: CurrencyConfig) => {
                  const balance = walletBalance.balances[currency.code as keyof typeof walletBalance.balances] || 0;
                  const isPrimary = currency.code === walletBalance.primaryCurrency;
                  
                  return (
                    <div 
                      key={currency.code}
                      className={`p-3 rounded-lg border ${
                        isPrimary 
                          ? 'bg-accent/10 border-accent/30' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{currency.flag}</span>
                        <p className="text-xs font-medium text-gray-600">{currency.code}</p>
                        {isPrimary && (
                          <span className="text-xs bg-accent text-white px-1 py-0.5 rounded">Primary</span>
                        )}
                      </div>
                      <p className="text-lg font-bold text-gray-800">
                        {formatCurrencyAmount(balance, currency.code)}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Show primary currency prominently with top 3 others
              <div>
                {/* Primary Currency */}
                <div className="bg-accent/10 p-4 rounded-lg border border-accent/30 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Primary Currency</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">
                          {getCurrencyConfig(walletBalance.primaryCurrency)?.flag}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {getCurrencyConfig(walletBalance.primaryCurrency)?.name}
                          </p>
                          <p className="text-2xl font-bold text-accent">
                            {formatCurrencyAmount(
                              walletBalance.balances[walletBalance.primaryCurrency as keyof typeof walletBalance.balances] || 0, 
                              walletBalance.primaryCurrency
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Other Major Currencies */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['USD', 'NGN', 'GBP', 'EUR'].filter(code => code !== walletBalance.primaryCurrency).map((currencyCode) => {
                    const currency = getCurrencyConfig(currencyCode);
                    const balance = walletBalance.balances[currencyCode as keyof typeof walletBalance.balances] || 0;
                    
                    if (!currency) return null;
                    
                    return (
                      <div key={currencyCode} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm">{currency.flag}</span>
                          <p className="text-xs font-medium text-gray-600">{currency.code}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-800">
                          {formatCurrencyAmount(balance, currency.code)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
            <p className="text-gray-500">Loading balance...</p>
          </div>
        )}
      </section>

      {/* Wallet Operations */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Deposit */}
        <section className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-green-600 flex items-center">
            <i className="fas fa-plus-circle mr-2"></i>
            Deposit Funds
          </h3>
          <p className="text-gray-600 mb-4">Add money to your wallet from external sources.</p>
          <button
            onClick={() => onNavigate?.('deposit-screen')}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
          >
            <i className="fas fa-plus mr-2"></i>
            Deposit
          </button>
        </section>

        {/* Withdraw */}
        <section className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-red-600 flex items-center">
            <i className="fas fa-minus-circle mr-2"></i>
            Withdraw Funds
          </h3>
          <p className="text-gray-600 mb-4">Withdraw money from your wallet (NGN only).</p>
          <button
            onClick={() => onNavigate?.('withdrawal-screen')}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
          >
            <i className="fas fa-minus mr-2"></i>
            Withdraw
          </button>
        </section>

        {/* Transfer */}
        <section className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-blue-600 flex items-center">
            <i className="fas fa-exchange-alt mr-2"></i>
            Transfer Funds
          </h3>
          <p className="text-gray-600 mb-4">Send money to other users instantly.</p>
          <button
            onClick={() => onNavigate?.('transfer-screen')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            <i className="fas fa-exchange-alt mr-2"></i>
            Transfer
          </button>
        </section>
      </div>
    </div>
  );
}