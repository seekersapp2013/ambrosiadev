import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function WalletManagement() {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [recipientUsername, setRecipientUsername] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const walletBalance = useQuery(api.wallets.getWalletBalance.getWalletBalance);
  const transactionHistory = useQuery(api.wallets.getTransactionHistory.getTransactionHistory, { limit: 10 });
  
  const depositFunds = useMutation(api.wallets.depositFunds.depositFunds);
  const withdrawFunds = useMutation(api.wallets.withdrawFunds.withdrawFunds);
  const transferFunds = useMutation(api.wallets.transferFunds.transferFunds);

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
        currency: selectedCurrency 
      });
      setMessage(`Successfully deposited ${depositAmount} ${selectedCurrency}. New balance: ${result.newBalance} ${result.currency}`);
      setDepositAmount("");
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Deposit failed"}`);
    } finally {
      setIsProcessing(false);
    }
  };

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
        currency: selectedCurrency 
      });
      setMessage(`Successfully withdrew ${withdrawAmount} ${selectedCurrency}. New balance: ${result.newBalance} ${result.currency}`);
      setWithdrawAmount("");
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Withdrawal failed"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      setMessage("Please enter a valid amount");
      return;
    }

    if (!recipientUsername.trim()) {
      setMessage("Please enter a recipient username");
      return;
    }

    setIsProcessing(true);
    setMessage("");

    try {
      const result = await transferFunds({
        recipientUsername: recipientUsername.trim(),
        amount: parseFloat(transferAmount),
        currency: selectedCurrency,
        description: `Transfer to @${recipientUsername.trim()}`,
      });
      setMessage(`Successfully sent ${transferAmount} ${selectedCurrency} to @${recipientUsername}. New balance: ${result.senderNewBalance} ${result.currency}`);
      setTransferAmount("");
      setRecipientUsername("");
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Transfer failed"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Current Balance */}
      <section className="bg-white p-6 rounded-xl border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-accent flex items-center">
          <i className="fas fa-wallet mr-2"></i>
          Wallet Balance
        </h2>
        {walletBalance ? (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-ambrosia-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600">USD Balance</p>
              <p className="text-3xl font-bold text-accent">${walletBalance.balanceUSD.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600">NGN Balance</p>
              <p className="text-3xl font-bold text-green-600">₦{walletBalance.balanceNGN.toFixed(2)}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
            <p className="text-gray-500">Loading balance...</p>
          </div>
        )}
      </section>

      {/* Currency Selector */}
      <section className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Select Currency</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedCurrency("USD")}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedCurrency === "USD" 
                ? "bg-accent text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            USD ($)
          </button>
          <button
            onClick={() => setSelectedCurrency("NGN")}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedCurrency === "NGN" 
                ? "bg-green-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            NGN (₦)
          </button>
        </div>
      </section>

      {/* Wallet Operations */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Deposit */}
        <section className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-green-600 flex items-center">
            <i className="fas fa-plus-circle mr-2"></i>
            Deposit Funds
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ({selectedCurrency})
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
              {isProcessing ? "Processing..." : `Deposit ${selectedCurrency}`}
            </button>
          </div>
        </section>

        {/* Withdraw */}
        <section className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-red-600 flex items-center">
            <i className="fas fa-minus-circle mr-2"></i>
            Withdraw Funds
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ({selectedCurrency})
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
            </div>
            <button
              onClick={handleWithdraw}
              disabled={isProcessing || !withdrawAmount}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Processing..." : `Withdraw ${selectedCurrency}`}
            </button>
          </div>
        </section>

        {/* Transfer */}
        <section className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-blue-600 flex items-center">
            <i className="fas fa-exchange-alt mr-2"></i>
            Transfer Funds
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Username
              </label>
              <input
                type="text"
                value={recipientUsername}
                onChange={(e) => setRecipientUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="@username"
                disabled={isProcessing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ({selectedCurrency})
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
            </div>
            <button
              onClick={handleTransfer}
              disabled={isProcessing || !transferAmount || !recipientUsername}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Processing..." : `Transfer ${selectedCurrency}`}
            </button>
          </div>
        </section>
      </div>

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

      {/* Transaction History */}
      <section className="bg-white p-6 rounded-xl border border-gray-200">
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
                      {transaction.isIncoming ? '+' : '-'}{transaction.currency === 'NGN' ? '₦' : '$'}{transaction.amount.toFixed(2)}
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
      </section>
    </div>
  );
}