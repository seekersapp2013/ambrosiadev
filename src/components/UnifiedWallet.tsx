import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { WalletManagement } from "./WalletManagement";
import { PrimaryCurrencyFixer } from "./PrimaryCurrencyFixer";
import { 
  getSupportedCurrencies, 
  formatCurrencyAmount,
  getCurrencyConfig,
  type CurrencyConfig
} from '../utils/currencyConfig';

interface WalletBalanceDisplayProps {
  onNavigate?: (screen: string) => void;
}

export function WalletBalanceDisplay({ onNavigate }: WalletBalanceDisplayProps = {}) {
  const [showManagement, setShowManagement] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [showFixer, setShowFixer] = useState(false);
  
  const walletBalance = useQuery(api.wallets.getWalletBalance.getWalletBalance, {});
  const transactionHistory = useQuery(api.wallets.getTransactionHistory.getTransactionHistory, { limit: 10 });
  const supportedCurrencies = getSupportedCurrencies();

  // Set primary currency as default when wallet loads
  useEffect(() => {
    if (walletBalance?.primaryCurrency && !selectedCurrency) {
      setSelectedCurrency(walletBalance.primaryCurrency);
    }
  }, [walletBalance?.primaryCurrency, selectedCurrency]);

  if (showManagement) {
    return <WalletManagement onNavigate={onNavigate} />;
  }

  if (showFixer) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setShowFixer(false)}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          ← Back to Wallet
        </button>
        <PrimaryCurrencyFixer />
      </div>
    );
  }

  return (
    <section className="bg-white p-6 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-accent flex items-center">
          <i className="fas fa-wallet mr-2"></i>
          Wallet Balance
        </h2>
      </div>
      
      {walletBalance ? (
        <div className="mb-4">
          {/* Currency Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Currency to View
            </label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              {supportedCurrencies.map((currency: CurrencyConfig) => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Currency Display */}
          {selectedCurrency && (
            <div className="bg-accent/10 p-4 rounded-lg border border-accent/30 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {selectedCurrency === walletBalance.primaryCurrency ? 'Primary Currency' : 'Selected Currency'}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {getCurrencyConfig(selectedCurrency)?.flag}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {getCurrencyConfig(selectedCurrency)?.name}
                      </p>
                      <p className="text-2xl font-bold text-accent">
                        {formatCurrencyAmount(
                          walletBalance.balances[selectedCurrency as keyof typeof walletBalance.balances] || 0, 
                          selectedCurrency
                        )}
                      </p>
                    </div>
                  </div>
                </div>
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
      
      <WalletActions onNavigate={onNavigate} onShowManagement={() => setShowManagement(true)} />
      
      {/* Transaction History */}
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-4 text-accent flex items-center">
          <i className="fas fa-history mr-2"></i>
          Recent Transactions
        </h3>
        {transactionHistory ? (
          <div className="space-y-3">
            {transactionHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No transactions yet</p>
            ) : (
              transactionHistory.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === 'deposit' ? 'bg-green-100 text-green-600' :
                      transaction.type === 'withdrawal' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <i className={`fas ${
                        transaction.type === 'deposit' ? 'fa-plus' :
                        transaction.type === 'withdrawal' ? 'fa-minus' :
                        'fa-exchange-alt'
                      } text-sm`}></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()} at{' '}
                        {new Date(transaction.createdAt).toLocaleTimeString()}
                      </p>
                      {transaction.type === 'transfer' && (
                        <p className="text-xs text-gray-400">
                          {transaction.isIncoming ? `From: @${transaction.fromUser?.username}` : 
                           transaction.isOutgoing ? `To: @${transaction.toUser?.username}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.isIncoming ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.isIncoming ? '+' : '-'}{formatCurrencyAmount(transaction.amount, transaction.currency)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{transaction.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
            <p className="text-gray-500">Loading transactions...</p>
          </div>
        )}
      </div>
    </section>
  );
}

interface WalletActionsProps {
  onNavigate?: (screen: string) => void;
  onShowManagement: () => void;
}

function WalletActions({ onNavigate, onShowManagement }: WalletActionsProps) {
  return (
    <div className="mt-6 space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => onNavigate?.("deposit-screen")}
          className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700"
        >
          <i className="fas fa-plus mr-2"></i>
          Deposit
        </button>
        <button
          onClick={() => onNavigate?.("withdrawal-screen")}
          className="bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700"
        >
          <i className="fas fa-minus mr-2"></i>
          Withdraw
        </button>
        <button
          onClick={() => onNavigate?.("transfer-screen")}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700"
        >
          <i className="fas fa-exchange-alt mr-2"></i>
          Transfer
        </button>
      </div>
    </div>
  );
}