import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import axios from "axios";
import { api } from "../../convex/_generated/api";

interface WalletBalanceDisplayProps {
  onNavigate?: (screen: string) => void;
}

export function WalletBalanceDisplay({ onNavigate }: WalletBalanceDisplayProps = {}) {
  const [balance, setBalance] = useState<any>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  
  const myProfile = useQuery(api.profiles.getMyProfile);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!myProfile?.privateKey) {
        setBalanceError("No wallet found in profile.");
        return;
      }

      try {
        const response = await axios.post("/api/getBalance", {
          privateKey: myProfile.privateKey,
        });

        if (response.data.success) {
          setBalance(response.data.balances);
        } else {
          setBalanceError("API did not return success.");
        }
      } catch (err) {
        console.error("Failed to fetch balance:", err);
        setBalanceError("Failed to fetch balance.");
      }
    };

    if (myProfile) {
      fetchBalance();
    }
  }, [myProfile]);

  return (
    <section className="bg-white p-6 rounded-xl border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-accent flex items-center">
        <i className="fas fa-wallet mr-2"></i>
        Wallet Balance
      </h2>
      {balanceError ? (
        <div className="bg-red-100 border border-red-300 rounded-lg p-4">
          <p className="text-red-700">{balanceError}</p>
        </div>
      ) : balance ? (
        <div className="space-y-3">
          <div className="bg-ambrosia-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Address</p>
            <p className="font-mono text-sm break-all">{balance.celo.address}</p>
          </div>
          <div className="bg-ambrosia-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Native Balance (CELO)</p>
            <p className="text-xl font-bold text-accent">{balance.celo.native}</p>
          </div>
          <div className="bg-ambrosia-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">USD Token</p>
            <p className="text-xl font-bold text-accent">{balance.celo.tokens?.USD ?? "N/A"}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
          <p className="text-gray-500">Loading balance...</p>
        </div>
      )}
      
      <WalletActions onNavigate={onNavigate} />
    </section>
  );
}

interface WalletActionsProps {
  onNavigate?: (screen: string) => void;
}

export function WalletActions({ onNavigate }: WalletActionsProps) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3">
      <button
        onClick={() => onNavigate?.('transfer-funds')}
        className="bg-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-opacity-90 transition duration-200 flex items-center justify-center"
      >
        <i className="fas fa-exchange-alt mr-2"></i>
        Transfer
      </button>
      <button
        onClick={() => onNavigate?.('send-email')}
        className="bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-opacity-90 transition duration-200 flex items-center justify-center"
      >
        <i className="fas fa-envelope mr-2"></i>
        Email
      </button>
      <button
        onClick={() => onNavigate?.('generate-wallet')}
        className="bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-opacity-90 transition duration-200 flex items-center justify-center"
      >
        <i className="fas fa-plus-circle mr-2"></i>
        Generate
      </button>
      <button
        onClick={() => onNavigate?.('email-history')}
        className="bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-opacity-90 transition duration-200 flex items-center justify-center"
      >
        <i className="fas fa-history mr-2"></i>
        History
      </button>
    </div>
  );
}

// Compact wallet address display for inline use
interface WalletAddressInlineProps {
  address?: string;
  label?: string;
  showCopyButton?: boolean;
}

export function WalletAddressInline({ 
  address, 
  label = "Wallet Address", 
  showCopyButton = true 
}: WalletAddressInlineProps) {
  if (!address) {
    return (
      <div className="text-sm text-gray-500">
        {label}: Not available
      </div>
    );
  }

  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">{label}:</span>
      <code className="text-sm font-mono text-gray-800">{truncatedAddress}</code>
      {showCopyButton && (
        <button
          onClick={() => navigator.clipboard.writeText(address)}
          className="text-accent hover:text-accent-dark text-sm"
          title="Copy full address"
        >
          <i className="fas fa-copy"></i>
        </button>
      )}
    </div>
  );
}