import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  getSupportedCurrencies, 
  formatCurrencyAmount,
  getCurrencyConfig,
  type CurrencyConfig
} from '../utils/currencyConfig';
import { UserSearchDropdown } from './UserSearchDropdown';

interface TransferProps {
  onBack: () => void;
}

export function Transfer({ onBack }: TransferProps) {
  const [transferAmount, setTransferAmount] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedTransferCurrency, setSelectedTransferCurrency] = useState("USD");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const walletBalance = useQuery(api.wallets.getWalletBalance.getWalletBalance, { currency: "USD" });
  const transferFunds = useMutation(api.wallets.transferFunds.transferFunds);

  // Get currency configurations
  const supportedCurrencies = getSupportedCurrencies();

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
  };

  const handleTransfer = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      setMessage("Please enter a valid amount");
      return;
    }

    if (!selectedUser) {
      setMessage("Please select a recipient from the search results");
      return;
    }

    setIsProcessing(true);
    setMessage("");

    try {
      const result = await transferFunds({
        recipientUsername: selectedUser.username,
        amount: parseFloat(transferAmount),
        currency: selectedTransferCurrency,
        description: `Transfer to @${selectedUser.username}`,
      });
      setMessage(`Successfully sent ${formatCurrencyAmount(parseFloat(transferAmount), selectedTransferCurrency)} to @${selectedUser.username}. New balance: ${formatCurrencyAmount(result.senderNewBalance, result.currency)}`);
      setTransferAmount("");
      setSelectedUser(null);
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Transfer failed"}`);
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
        <h1 className="text-2xl font-bold text-blue-600 flex items-center">
          <i className="fas fa-exchange-alt mr-2"></i>
          Transfer Funds
        </h1>
      </div>

      {/* Transfer Form */}
      <section className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="space-y-4">
          <UserSearchDropdown
            onUserSelect={handleUserSelect}
            label="Search & Select Recipient"
            placeholder="Search by username or name..."
            disabled={isProcessing}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={selectedTransferCurrency}
              onChange={(e) => setSelectedTransferCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              disabled={isProcessing}
            >
              {supportedCurrencies.map((currency: CurrencyConfig) => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount ({getCurrencyConfig(selectedTransferCurrency)?.symbol})
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="0.00"
              disabled={isProcessing}
            />
            {walletBalance && (
              <p className="text-xs text-gray-500 mt-1">
                Available: {formatCurrencyAmount(
                  walletBalance.balances[selectedTransferCurrency as keyof typeof walletBalance.balances] || 0, 
                  selectedTransferCurrency
                )}
              </p>
            )}
          </div>
          <button
            onClick={handleTransfer}
            disabled={isProcessing || !transferAmount || !selectedUser}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : `Transfer ${selectedTransferCurrency}`}
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