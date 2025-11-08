import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import axios from "axios";

// Automated Payment Flow Component
interface AutomatedPaymentFlowProps {
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

export function AutomatedPaymentFlow({ 
  contentType, 
  contentId, 
  title, 
  price, 
  token, 
  sellerAddress,
  onBack, 
  onSuccess,
  onFundWallet
}: AutomatedPaymentFlowProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'confirm' | 'processing' | 'success' | 'error'>('confirm');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [balance, setBalance] = useState<any>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  
  const myProfile = useQuery(api.profiles.getMyProfile);
  const purchaseContent = useMutation(api.payments.purchaseContent);

  // Fetch wallet balance
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
          setBalanceError(null);
        } else {
          setBalanceError("Failed to fetch balance.");
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

  // Check if user has sufficient balance
  const getSufficientBalance = () => {
    if (!balance) return false;
    
    if (token === "USD") {
      const usdBalance = parseFloat(balance.celo.tokens?.USD || "0");
      return usdBalance >= price;
    } else {
      // Assuming native CELO token
      const celoBalance = parseFloat(balance.celo.native || "0");
      return celoBalance >= price;
    }
  };

  const hasSufficientBalance = getSufficientBalance();
  const currentBalance = balance ? (token === "USD" ? balance.celo.tokens?.USD : balance.celo.native) : "0";

  const handleAutomatedPayment = async () => {
    if (!myProfile?.privateKey || !sellerAddress) {
      setErrorMessage("Wallet information not available");
      setPaymentStep('error');
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      // Step 1: Send the blockchain transaction automatically
      const paymentResponse = await axios.post("/api/sendPayment", {
        fromPrivateKey: myProfile.privateKey,
        toAddress: sellerAddress,
        amount: price,
        token: token
      });

      if (!paymentResponse.data.success) {
        throw new Error(paymentResponse.data.error || "Payment transaction failed");
      }

      const txHash = paymentResponse.data.txHash;

      // Step 2: Record the purchase in our system
      await purchaseContent({
        contentType,
        contentId,
        priceToken: token,
        priceAmount: price,
        txHash: txHash,
        network: "celo",
      });

      setPaymentStep('success');
      
      // Auto-redirect after success
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (error) {
      console.error("Automated payment failed:", error);
      setErrorMessage(error instanceof Error ? error.message : "Payment failed");
      setPaymentStep('error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button onClick={onBack} className="text-gray-600" disabled={isProcessing}>
          <i className="fas fa-arrow-left text-xl"></i>
        </button>
        <h1 className="text-lg font-semibold">Automated Payment</h1>
        <div></div>
      </div>

      {/* Content */}
      <div className="p-6">
        {paymentStep === 'confirm' && (
          <div>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-credit-card text-white text-3xl"></i>
              </div>
              <h2 className="text-2xl font-bold mb-2">Confirm Payment</h2>
              <p className="text-gray-600">
                One-click payment - we'll handle the blockchain transaction for you
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

            {/* Balance Display */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Your Balance:</span>
                {balanceError ? (
                  <span className="text-red-600 text-sm">Error loading</span>
                ) : balance ? (
                  <span className="font-semibold text-gray-800">
                    {currentBalance} {token}
                  </span>
                ) : (
                  <div className="animate-spin w-4 h-4 border-2 border-accent border-t-transparent rounded-full"></div>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Required:</span>
                <span className="font-semibold text-gray-800">{price} {token}</span>
              </div>
            </div>

            {/* Balance Error Display */}
            {balanceError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-700">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  {balanceError}
                </p>
              </div>
            )}

            {/* Balance Status */}
            {balance && (
              <div className={`border rounded-lg p-4 mb-4 ${
                hasSufficientBalance 
                  ? "bg-green-50 border-green-200" 
                  : "bg-red-50 border-red-200"
              }`}>
                <p className={`text-sm ${
                  hasSufficientBalance 
                    ? "text-green-700" 
                    : "text-red-700"
                }`}>
                  <i className={`fas ${
                    hasSufficientBalance 
                      ? "fa-check-circle" 
                      : "fa-exclamation-triangle"
                  } mr-2`}></i>
                  {hasSufficientBalance 
                    ? "Sufficient balance for automated payment"
                    : `Insufficient balance - You need ${(price - parseFloat(currentBalance)).toFixed(4)} more ${token}`
                  }
                </p>
              </div>
            )}

            {/* Payment Details */}
            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Payment Details:</h4>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-semibold">{price} {token}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>To:</span>
                    <span className="font-mono text-xs">{sellerAddress?.slice(0, 10)}...{sellerAddress?.slice(-6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network:</span>
                    <span>Celo</span>
                  </div>
                </div>
              </div>

              {myProfile?.walletAddress && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Your Wallet:</h4>
                  <div className="text-sm text-green-700">
                    <div className="flex justify-between">
                      <span>From:</span>
                      <span className="font-mono text-xs">{myProfile.walletAddress.slice(0, 10)}...{myProfile.walletAddress.slice(-6)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {balance && hasSufficientBalance && !balanceError && myProfile?.privateKey && sellerAddress ? (
              <button
                onClick={handleAutomatedPayment}
                className="w-full py-4 bg-accent text-white rounded-lg font-medium text-lg hover:bg-opacity-90 transition duration-200"
              >
                <i className="fas fa-bolt mr-2"></i>
                Pay {price} {token} Automatically
              </button>
            ) : balance && !hasSufficientBalance ? (
              <button
                onClick={() => onFundWallet?.()}
                className="w-full py-4 bg-blue-600 text-white rounded-lg font-medium text-lg hover:bg-blue-700 transition duration-200"
              >
                <i className="fas fa-wallet mr-2"></i>
                Insufficient Balance - Fund Wallet
              </button>
            ) : (
              <button
                disabled
                className="w-full py-4 bg-gray-300 text-gray-500 rounded-lg font-medium text-lg cursor-not-allowed"
              >
                <i className="fas fa-bolt mr-2"></i>
                {balanceError 
                  ? "Balance Error" 
                  : "Loading Balance..."
                }
              </button>
            )}

            <p className="text-xs text-gray-500 mt-3 text-center">
              {balanceError 
                ? "Unable to check wallet balance. Please try refreshing the page."
                : balance && hasSufficientBalance 
                  ? "Payment will be processed automatically using your wallet. No manual transaction required."
                  : !balance 
                    ? "Checking wallet balance..."
                    : "Please add funds to your wallet to continue"
              }
            </p>
          </div>
        )}

        {paymentStep === 'processing' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <i className="fas fa-cog fa-spin text-white text-3xl"></i>
            </div>
            <h2 className="text-2xl font-bold mb-4">Processing Payment...</h2>
            <div className="space-y-3 text-gray-600">
              <p className="flex items-center justify-center">
                <i className="fas fa-check text-green-500 mr-2"></i>
                Preparing transaction
              </p>
              <p className="flex items-center justify-center">
                <div className="animate-spin w-4 h-4 border-2 border-accent border-t-transparent rounded-full mr-2"></div>
                Sending payment to blockchain
              </p>
              <p className="text-gray-400">
                <i className="fas fa-clock mr-2"></i>
                Verifying transaction
              </p>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              This usually takes 10-30 seconds...
            </p>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-check text-white text-3xl"></i>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-green-600">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your payment has been processed and the content is now unlocked.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-700">
                <i className="fas fa-unlock mr-2"></i>
                Redirecting to content in 2 seconds...
              </p>
            </div>
            <button
              onClick={onSuccess}
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium"
            >
              Access Content Now
            </button>
          </div>
        )}

        {paymentStep === 'error' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-exclamation-triangle text-white text-3xl"></i>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-red-600">Payment Failed</h2>
            <p className="text-gray-600 mb-6">
              {errorMessage || "There was an issue processing your payment."}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setPaymentStep('confirm');
                  setErrorMessage('');
                }}
                className="w-full bg-accent text-white py-3 rounded-lg font-medium"
              >
                Try Again
              </button>
              <button
                onClick={onBack}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Automated Paywall Display Component
interface AutomatedPaywallDisplayProps {
  contentType: "article" | "reel";
  title: string;
  price: number;
  token: string;
  sellerAddress?: string;
  onUnlock: () => void;
  onFundWallet?: () => void;
}

export function AutomatedPaywallDisplay({
  contentType,
  title,
  price,
  token,
  sellerAddress,
  onUnlock,
  onFundWallet
}: AutomatedPaywallDisplayProps) {
  const [balance, setBalance] = useState<any>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  const myProfile = useQuery(api.profiles.getMyProfile);
  const hasWallet = myProfile?.privateKey && myProfile?.walletAddress;

  // Fetch wallet balance
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
          setBalanceError(null);
        } else {
          setBalanceError("Failed to fetch balance.");
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

  // Check if user has sufficient balance
  const getSufficientBalance = () => {
    if (!balance) return false;
    
    if (token === "USD") {
      const usdBalance = parseFloat(balance.celo.tokens?.USD || "0");
      return usdBalance >= price;
    } else {
      // Assuming native CELO token
      const celoBalance = parseFloat(balance.celo.native || "0");
      return celoBalance >= price;
    }
  };

  const hasSufficientBalance = getSufficientBalance();
  const currentBalance = balance ? (token === "USD" ? balance.celo.tokens?.USD : balance.celo.native) : "0";

  return (
    <div className="text-center p-8">
      <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
        <i className="fas fa-lock text-white text-3xl"></i>
      </div>
      <h3 className="text-xl font-bold mb-2">Premium Content</h3>
      <p className="text-gray-600 mb-4">
        This {contentType} requires payment to access.
      </p>
      <p className="text-accent font-bold text-2xl mb-6">
        {price} {token}
      </p>
      
      {hasWallet ? (
        <div className="space-y-4">
          {/* Balance Display */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Your Balance:</span>
              {balanceError ? (
                <span className="text-red-600 text-sm">Error loading</span>
              ) : balance ? (
                <span className="font-semibold text-gray-800">
                  {currentBalance} {token}
                </span>
              ) : (
                <div className="animate-spin w-4 h-4 border-2 border-accent border-t-transparent rounded-full"></div>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Required:</span>
              <span className="font-semibold text-gray-800">{price} {token}</span>
            </div>
          </div>

          {/* Balance Status */}
          {balance && (
            <div className={`border rounded-lg p-4 ${
              hasSufficientBalance 
                ? "bg-green-50 border-green-200" 
                : "bg-red-50 border-red-200"
            }`}>
              <p className={`text-sm ${
                hasSufficientBalance 
                  ? "text-green-700" 
                  : "text-red-700"
              }`}>
                <i className={`fas ${
                  hasSufficientBalance 
                    ? "fa-check-circle" 
                    : "fa-exclamation-triangle"
                } mr-2`}></i>
                {hasSufficientBalance 
                  ? "One-click automated payment available"
                  : `Insufficient balance - You need ${(price - parseFloat(currentBalance)).toFixed(4)} more ${token}`
                }
              </p>
            </div>
          )}

          {/* Balance Error Display */}
          {balanceError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {balanceError}
              </p>
            </div>
          )}
          
          {balance && hasSufficientBalance && !balanceError ? (
            <button
              onClick={onUnlock}
              className="bg-accent text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-opacity-90 transition duration-200"
            >
              <i className="fas fa-bolt mr-2"></i>
              Pay & Unlock Instantly
            </button>
          ) : balance && !hasSufficientBalance ? (
            <button
              onClick={() => onFundWallet?.()}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-blue-700 transition duration-200"
            >
              <i className="fas fa-wallet mr-2"></i>
              Insufficient Balance - Fund Wallet
            </button>
          ) : (
            <button
              disabled
              className="bg-gray-300 text-gray-500 px-8 py-4 rounded-lg font-medium text-lg cursor-not-allowed"
            >
              <i className="fas fa-bolt mr-2"></i>
              {balanceError 
                ? "Balance Error" 
                : "Loading Balance..."
              }
            </button>
          )}
          
          <p className="text-xs text-gray-500">
            {balanceError 
              ? "Unable to check wallet balance. Please try refreshing the page."
              : balance && hasSufficientBalance 
                ? "Payment will be processed automatically from your wallet"
                : !balance 
                  ? "Checking wallet balance..."
                  : "Please add funds to your wallet to continue"
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-700">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              Wallet setup required for automated payments
            </p>
          </div>
          
          <button
            onClick={onUnlock}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Set Up Payment
          </button>
        </div>
      )}
    </div>
  );
}