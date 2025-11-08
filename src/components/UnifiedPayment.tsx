import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// Unified Payment Configuration Component
interface PaymentConfigProps {
  isGated: boolean;
  setIsGated: (value: boolean) => void;
  priceAmount: number;
  setPriceAmount: (value: number) => void;
  contentType: "article" | "reel";
}

export function PaymentConfig({
  isGated,
  setIsGated,
  priceAmount,
  setPriceAmount,
  contentType
}: PaymentConfigProps) {
  const myProfile = useQuery(api.profiles.getMyProfile);

  return (
    <div className="space-y-3 pt-4 border-t border-gray-200">
      {/* Token Gating */}
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={isGated}
          onChange={(e) => setIsGated(e.target.checked)}
          className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
        />
        <span className="text-sm text-gray-700">
          Require payment to {contentType === "article" ? "read" : "watch"}
        </span>
      </label>

      {/* Price Input */}
      {isGated && (
        <div className="ml-7 space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={priceAmount}
              onChange={(e) => setPriceAmount(parseFloat(e.target.value) || 1)}
              className="w-20 text-sm border border-gray-300 rounded px-2 py-1"
            />
            <span className="text-sm text-gray-600">USD tokens</span>
          </div>
          <p className="text-xs text-gray-500">
            {contentType === "article" ? "Readers" : "Viewers"} will pay this amount to access your {contentType}
          </p>
          
          {/* Payment Address Display */}
          {myProfile?.walletAddress && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Payments will be sent to:</p>
              <div className="flex items-center justify-between">
                <code className="text-xs font-mono text-gray-800 break-all">
                  {myProfile.walletAddress}
                </code>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(myProfile.walletAddress!)}
                  className="ml-2 text-accent hover:text-accent-dark text-xs"
                  title="Copy address"
                >
                  <i className="fas fa-copy"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Unified Paywall Display Component
interface PaywallDisplayProps {
  contentType: "article" | "reel";
  title: string;
  price: number;
  token: string;
  sellerAddress?: string;
  onUnlock: () => void;
  showFullPaywall?: boolean;
}

export function PaywallDisplay({
  contentType,
  title,
  price,
  token,
  sellerAddress,
  onUnlock,
  showFullPaywall = false
}: PaywallDisplayProps) {
  if (showFullPaywall) {
    return (
      <div className="text-center p-8">
        <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-lock text-white text-3xl"></i>
        </div>
        <h2 className="text-2xl font-bold mb-2">Unlock Premium Content</h2>
        <p className="text-gray-600 mb-4">
          {contentType === "article" ? "Read this exclusive article" : "Watch this exclusive reel"}
        </p>
        
        {/* Content Preview */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">{title}</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {contentType === "article" ? "Article" : "Reel"}
            </span>
            <span className="text-accent font-bold text-lg">
              {price} {token}
            </span>
          </div>
        </div>

        <WalletAddressDisplay address={sellerAddress} />
        
        <button
          onClick={onUnlock}
          className="bg-accent text-white px-6 py-3 rounded-lg font-medium mt-4"
        >
          Proceed to Payment
        </button>
      </div>
    );
  }

  return (
    <div className="text-center p-8">
      <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
        <i className="fas fa-lock text-white text-3xl"></i>
      </div>
      <h3 className="text-xl font-bold mb-2">Premium Content</h3>
      <p className="text-gray-600 mb-4">
        This {contentType} requires payment to access.
      </p>
      <p className="text-accent font-bold text-lg mb-4">
        {price} {token}
      </p>
      
      <WalletAddressDisplay address={sellerAddress} />
      
      <button
        onClick={onUnlock}
        className="bg-accent text-white px-6 py-3 rounded-lg font-medium mt-4"
      >
        Unlock {contentType === "article" ? "Article" : "Reel"}
      </button>
    </div>
  );
}

// Unified Payment Flow Component
interface PaymentFlowProps {
  contentType: "article" | "reel";
  contentId: Id<"articles"> | Id<"reels">;
  title: string;
  price: number;
  token: string;
  sellerAddress?: string;
  onBack: () => void;
  onSuccess: () => void;
  onFundWallet?: () => void;
}

export function PaymentFlow({ 
  contentType, 
  contentId, 
  title, 
  price, 
  token, 
  sellerAddress,
  onBack, 
  onSuccess,
  onFundWallet
}: PaymentFlowProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState("");
  
  const purchaseContent = useMutation(api.payments.purchaseContent);

  const handlePurchase = async () => {
    if (!txHash.trim()) {
      alert("Please enter a transaction hash");
      return;
    }

    setIsProcessing(true);
    try {
      await purchaseContent({
        contentType,
        contentId,
        priceToken: token,
        priceAmount: price,
        txHash: txHash.trim(),
        network: "celo",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Purchase failed. Please check your transaction hash and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button onClick={onBack} className="text-gray-600">
          <i className="fas fa-arrow-left text-xl"></i>
        </button>
        <h1 className="text-lg font-semibold">Complete Payment</h1>
        <div></div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-credit-card text-white text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold mb-2">Complete Your Payment</h2>
          <p className="text-gray-600">
            Verify your blockchain transaction to unlock content
          </p>
        </div>

        {/* Content Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">{title}</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {contentType === "article" ? "Article" : "Reel"}
            </span>
            <span className="text-accent font-bold text-lg">
              {price} {token}
            </span>
          </div>
        </div>

        <WalletAddressDisplay address={sellerAddress} showInstructions />

        {/* Transaction Hash Input */}
        <div className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Hash
            </label>
            <input
              type="text"
              placeholder="Enter your blockchain transaction hash"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="text-xs text-gray-500 mt-1">
              After making the payment on the blockchain, paste the transaction hash here
            </p>
          </div>

          <button
            onClick={handlePurchase}
            disabled={!txHash.trim() || isProcessing}
            className={`w-full py-3 rounded-lg font-medium ${
              txHash.trim() && !isProcessing
                ? 'bg-accent text-white'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            {isProcessing ? 'Verifying Payment...' : 'Verify & Unlock Content'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Reusable Wallet Address Display Component
interface WalletAddressDisplayProps {
  address?: string;
  showInstructions?: boolean;
}

export function WalletAddressDisplay({ address, showInstructions = false }: WalletAddressDisplayProps) {
  if (!address) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-yellow-800">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          Payment address not available. This content was created before wallet addresses were tracked. 
          Please contact the creator for payment details.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">Payment Address:</h4>
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-sm text-gray-600 mb-1">Send payment to:</p>
          <div className="flex items-center justify-between">
            <code className="text-sm font-mono text-gray-800 break-all">
              {address}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(address)}
              className="ml-2 text-accent hover:text-accent-dark"
              title="Copy address"
            >
              <i className="fas fa-copy"></i>
            </button>
          </div>
        </div>
      </div>

      {showInstructions && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Payment Instructions:</h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Copy the wallet address above</li>
            <li>Send the exact amount to this address using your wallet</li>
            <li>Copy the transaction hash from your wallet</li>
            <li>Paste it below and click "Verify & Unlock Content"</li>
          </ol>
        </div>
      )}
    </div>
  );
}