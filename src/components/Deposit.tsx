import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  getDepositCurrencies, 
  formatCurrencyAmount,
  getCurrencyConfig,
  type CurrencyConfig
} from '../utils/currencyConfig';

interface DepositProps {
  onBack: () => void;
}

export function Deposit({ onBack }: DepositProps) {
  const [depositAmount, setDepositAmount] = useState("");
  const [selectedDepositCurrency, setSelectedDepositCurrency] = useState("USD");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const walletBalance = useQuery(api.wallets.getWalletBalance.getWalletBalance, { currency: "USD" });
  const depositFunds = useMutation(api.wallets.depositFunds.depositFunds);

  // Get currency configurations
  const depositCurrencies = getDepositCurrencies();

  // Set primary currency as default when wallet loads
  useEffect(() => {
    if (walletBalance?.primaryCurrency) {
      setSelectedDepositCurrency(walletBalance.primaryCurrency);
    }
  }, [walletBalance?.primaryCurrency]);

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setMessage("Please enter a valid amount");
      return;
    }

    setIsProcessing(true);
    setMessage("");

    try {
      const result = await depositFunds({ 
        amount: parseFloat(depositAmount),
        currency: selectedDepositCurrency 
      });
      setMessage(`Successfully deposited ${formatCurrencyAmount(parseFloat(depositAmount), selectedDepositCurrency)}. New balance: ${formatCurrencyAmount(result.newBalance, result.currency)}`);
      setDepositAmount("");
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Deposit failed"}`);
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
        <h1 className="text-2xl font-bold text-accent flex items-center">
          <i className="fas fa-plus-circle mr-2"></i>
          Deposit Funds
        </h1>
      </div>

      {/* Deposit Form */}
      <section className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={selectedDepositCurrency}
              onChange={(e) => setSelectedDepositCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              disabled={isProcessing}
            >
              {depositCurrencies.map((currency: CurrencyConfig) => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount ({getCurrencyConfig(selectedDepositCurrency)?.symbol})
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="0.00"
              disabled={isProcessing}
            />
          </div>
          <button
            onClick={handleDeposit}
            disabled={isProcessing || !depositAmount}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : `Deposit ${selectedDepositCurrency}`}
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