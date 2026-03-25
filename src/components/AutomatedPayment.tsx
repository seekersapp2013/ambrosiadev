import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// Automated Payment Flow Component
interface AutomatedPaymentFlowProps {
  contentType: "article" | "reel";
  contentId: Id<"articles"> | Id<"reels">;
  title: string;
  price: number;
  token: string;
  onBack: () => void;
  onSuccess: () => void;
  onFundWallet?: () => void;
}

export function AutomatedPaymentFlow({ 
  contentType, 
  contentId, 
  title, 
  price, 
  token, 
  onBack, 
  onSuccess,
  onFundWallet
}: AutomatedPaymentFlowProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'confirm' | 'processing' | 'success' | 'error'>('confirm');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const myProfile = useQuery(api.profiles.getMyProfile);
  const walletBalance = useQuery(api.wallets.getWalletBalance.getWalletBalance, { currency: token });
  const purchaseContent = useMutation(api.payments.purchaseContent);

  // Check if user has sufficient balance
  const hasSufficientBalance = walletBalance ? walletBalance.balances[token as keyof typeof walletBalance.balances] >= price : false;
  const currentBalance = walletBalance ? walletBalance.balances[token as keyof typeof walletBalance.balances].toFixed(2) : "0.00";

  const handleAutomatedPayment = async () => {
    if (!hasSufficientBalance) {
      setErrorMessage("Insufficient balance");
      setPaymentStep('error');
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');
    setErrorMessage('');

    try {
      await purchaseContent({
        contentType,
        contentId,
        priceToken: token,
        priceAmount: price,
      });

      setPaymentStep('success');
      
      // Auto-redirect after success
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (error) {
      console.error("Payment failed:", error);
      setErrorMessage(error instanceof Error ? error.message : "Payment failed");
      setPaymentStep('error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStep === 'processing') {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <i className="fas fa-cog fa-spin text-white text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold mb-4">Processing Payment...</h2>
          <p className="text-gray-600">Please wait while we process your payment.</p>
        </div>
      </div>
    );
  }

  if (paymentStep === 'success') {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-check text-white text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-green-600">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">Your payment has been processed successfully.</p>
          <p className="text-sm text-gray-500">Redirecting to content...</p>
        </div>
      </div>
    );
  }

  if (paymentStep === 'error') {
    return (
      <div className="bg-white min-h-screen">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <button onClick={onBack} className="text-gray-600">
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <h1 className="text-lg font-semibold">Payment Failed</h1>
          <div></div>
        </div>

        <div className="p-6 text-center">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-times text-white text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-red-600">Payment Failed</h2>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          
          <div className="space-y-3">
            <button
              onClick={() => setPaymentStep('confirm')}
              className="w-full bg-accent text-white py-3 rounded-lg font-medium hover:bg-opacity-90"
            >
              Try Again
            </button>
            <button
              onClick={onBack}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button onClick={onBack} className="text-gray-600">
          <i className="fas fa-arrow-left text-xl"></i>
        </button>
        <h1 className="text-lg font-semibold">Confirm Payment</h1>
        <div></div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-lock text-white text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold mb-2">Premium Content</h2>
          <p className="text-gray-600 mb-4">{title}</p>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Price:</span>
            <span className="text-2xl font-bold text-accent">{price} {token}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Your Balance:</span>
            <span className={`font-bold ${hasSufficientBalance ? 'text-green-600' : 'text-red-600'}`}>
              {currentBalance} {token}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {hasSufficientBalance ? (
            <button
              onClick={handleAutomatedPayment}
              disabled={isProcessing}
              className="w-full bg-accent text-white py-4 rounded-lg font-medium text-lg hover:bg-opacity-90 disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : `Pay ${price} ${token}`}
            </button>
          ) : (
            <button
              onClick={onFundWallet}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-medium text-lg hover:bg-blue-700"
            >
              Fund Wallet
            </button>
          )}

          <button
            onClick={onBack}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Legacy component for backward compatibility
export function AutomatedPayment(props: any) {
  return <AutomatedPaymentFlow {...props} />;
}