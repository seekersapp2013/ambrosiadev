import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  getWithdrawalCurrencies,
  formatCurrencyAmount,
  type CurrencyConfig
} from '../utils/currencyConfig';

interface WithdrawalProps {
  onBack: () => void;
}

export function Withdrawal({ onBack }: WithdrawalProps) {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedWithdrawCurrency, setSelectedWithdrawCurrency] = useState("NGN");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const walletBalance = useQuery(api.wallets.getWalletBalance.getWalletBalance, { currency: "USD" });
  const withdrawFunds = useMutation(api.wallets.withdrawFunds.withdrawFunds);

  // Get currency configurations
  const withdrawalCurrencies = getWithdrawalCurrencies();

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setMessage("Please enter a valid amount");
      return;
    }

    setIsProcessing(true);
    setMessage("");

    try {
      const result = await withdrawFunds({ 
        amount: parseFloat(withdrawAmount),
        currency: selectedWithdrawCurrency 
      });
      setMessage(`Successfully withdrew ${formatCurrencyAmount(parseFloat(withdrawAmount), selectedWithdrawCurrency)}. New balance: ${formatCurrencyAmount(result.newBalance, result.currency)}`);
      setWithdrawAmount("");
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Withdrawal failed"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 mr-4"
        >
          <i className="fas fa-arrow-left text-xl"></i>
        </button>
        <h1 className="text-2xl font-bold text-red-600 flex items-center">
          <i className="fas fa-minus-circle mr-2"></i>
          Withdraw Funds
        </h1>
      </div>

      {/* Withdraw Form */}
      <section className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={selectedWithdrawCurrency}
              onChange={(e) => setSelectedWithdrawCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-gray-50"
              disabled={true}
            >
              {withdrawalCurrencies.map((currency: CurrencyConfig) => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              <i className="fas fa-info-circle mr-1"></i>
              Withdrawals are only available in Nigerian Naira (NGN)
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₦)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="0.00"
              disabled={isProcessing}
            />
            {walletBalance && (
              <p className="text-xs text-gray-500 mt-1">
                Available: {formatCurrencyAmount(walletBalance.balances.NGN, 'NGN')}
              </p>
            )}
          </div>
          <button
            onClick={handleWithdraw}
            disabled={isProcessing || !withdrawAmount || (walletBalance && walletBalance.balances.NGN < parseFloat(withdrawAmount || "0"))}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : `Withdraw NGN`}
          </button>
        </div>
      </section>

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes("Error") 
            ? "bg-red-100 border border-red-300 text-red-700" 
            : "bg-green-100 border border-green-300 text-green-700"
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}