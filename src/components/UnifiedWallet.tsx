import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { WalletManagement } from "./WalletManagement";

interface WalletBalanceDisplayProps {
  onNavigate?: (screen: string) => void;
}

export function WalletBalanceDisplay({ onNavigate }: WalletBalanceDisplayProps = {}) {
  const [showManagement, setShowManagement] = useState(false);
  
  const walletBalance = useQuery(api.wallets.getWalletBalance.getWalletBalance);

  if (showManagement) {
    return <WalletManagement />;
  }

  return (
    <section className="bg-white p-6 rounded-xl border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-accent flex items-center">
        <i className="fas fa-wallet mr-2"></i>
        Wallet Balance
      </h2>
      {walletBalance ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-ambrosia-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">USD Balance</p>
            <p className="text-2xl font-bold text-accent">${walletBalance.balanceUSD.toFixed(2)}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">NGN Balance</p>
            <p className="text-2xl font-bold text-green-600">₦{walletBalance.balanceNGN.toFixed(2)}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
          <p className="text-gray-500">Loading balance...</p>
        </div>
      )}
      
      <WalletActions onNavigate={onNavigate} onShowManagement={() => setShowManagement(true)} />
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
      <button
        onClick={onShowManagement}
        className="w-full bg-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-accent-dark"
      >
        <i className="fas fa-cog mr-2"></i>
        Manage Wallet
      </button>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate?.("deposit")}
          className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700"
        >
          <i className="fas fa-plus mr-2"></i>
          Deposit
        </button>
        <button
          onClick={() => onNavigate?.("transfer")}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700"
        >
          <i className="fas fa-exchange-alt mr-2"></i>
          Transfer
        </button>
      </div>
    </div>
  );
}