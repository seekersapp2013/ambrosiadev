import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import axios from "axios";

interface GatedContentPaywallProps {
    contentType?: "article" | "reel" | "booking";
    contentId?: Id<"articles"> | Id<"reels">;
    title: string;
    price: number;
    token: string;
    sellerAddress?: string;
    onUnlock: () => void;
    onFundWallet?: () => void;
}

const PLATFORM_FEE_ADDRESS = "0x3A3aCaeDA96b65af755ccA1fE3497f1C99D33689";
const PLATFORM_FEE_PERCENTAGE = 0.02; // 2%

export function GatedContentPaywall({
    contentType = "article",
    contentId,
    price,
    token,
    sellerAddress,
    onUnlock,
    onFundWallet
}: GatedContentPaywallProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [balance, setBalance] = useState<any>(null);
    const [balanceError, setBalanceError] = useState<string | null>(null);

    const myProfile = useQuery(api.profiles.getMyProfile);
    const hasWallet = myProfile?.privateKey && myProfile?.walletAddress;
    const purchaseContent = useMutation(api.payments.purchaseContent);

    // Fetch wallet balance
    useEffect(() => {
        const fetchBalance = async () => {
            if (!myProfile?.privateKey) {
                setBalanceError("No wallet found in profile.");
                return;
            }

            try {
                const response = await axios.post("https://oathstone-api2.azurewebsites.net/getBalance", {
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
        if (!hasWallet || !sellerAddress) {
            setErrorMessage("Wallet or seller address not available");
            setPaymentStatus("error");
            return;
        }

        // For content payments, contentId is required
        if ((contentType === "article" || contentType === "reel") && !contentId) {
            setErrorMessage("Content ID not available");
            setPaymentStatus("error");
            return;
        }

        setIsProcessing(true);
        setPaymentStatus("processing");
        setErrorMessage("");

        try {
            // Calculate amounts
            const platformFee = price * PLATFORM_FEE_PERCENTAGE;
            const sellerAmount = price - platformFee;

            // Send payment to seller
            const sellerPayment = await axios.post("https://oathstone-api2.azurewebsites.net/transfer", {
                privateKey: myProfile.privateKey,
                address: sellerAddress,
                amount: sellerAmount.toString(),
                type: token === "USD" ? "token" : "native"
            });

            if (!sellerPayment.data.success) {
                throw new Error(sellerPayment.data.error || "Payment to seller failed");
            }

            // Send platform fee
            const feePayment = await axios.post("https://oathstone-api2.azurewebsites.net/transfer", {
                privateKey: myProfile.privateKey,
                address: PLATFORM_FEE_ADDRESS,
                amount: platformFee.toString(),
                type: token === "USD" ? "token" : "native"
            });

            if (!feePayment.data.success) {
                console.warn("Platform fee payment failed:", feePayment.data.error);
                // Continue even if fee payment fails
            }

            // Record the purchase in database to grant access (only for content, not bookings)
            if ((contentType === "article" || contentType === "reel") && contentId) {
                await purchaseContent({
                    contentType,
                    contentId,
                    priceToken: token,
                    priceAmount: price,
                    txHash: sellerPayment.data.txHash || "automated_payment",
                    network: "celo",
                });
            }

            setPaymentStatus("success");

            // Auto-redirect after success
            setTimeout(() => {
                onUnlock();
            }, 2000);

        } catch (error) {
            console.error("Automated payment failed:", error);
            setErrorMessage(error instanceof Error ? error.message : "Payment failed");
            setPaymentStatus("error");
        } finally {
            setIsProcessing(false);
        }
    };

    if (paymentStatus === "processing") {
        return (
            <div className="text-center p-8">
                <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <i className="fas fa-cog fa-spin text-white text-3xl"></i>
                </div>
                <h2 className="text-2xl font-bold mb-4">Processing Payment...</h2>
                <div className="space-y-3 text-gray-600">
                    <p className="flex items-center justify-center">
                        <div className="animate-spin w-4 h-4 border-2 border-accent border-t-transparent rounded-full mr-2"></div>
                        Sending payment to {contentType === "booking" ? "provider" : "creator"}
                    </p>
                    <p className="text-gray-400">
                        <i className="fas fa-clock mr-2"></i>
                        Processing platform fee
                    </p>
                </div>
                <p className="text-sm text-gray-500 mt-6">
                    This usually takes 10-30 seconds...
                </p>
            </div>
        );
    }

    if (paymentStatus === "success") {
        return (
            <div className="text-center p-8">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fas fa-check text-white text-3xl"></i>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-green-600">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">
                    {contentType === "booking" 
                        ? "Your payment has been processed and your booking is confirmed."
                        : "Your payment has been processed and the content is now unlocked."
                    }
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-green-700">
                        <i className={`fas ${contentType === "booking" ? "fa-calendar-check" : "fa-unlock"} mr-2`}></i>
                        {contentType === "booking" 
                            ? "Confirming booking in 2 seconds..."
                            : "Redirecting to content in 2 seconds..."
                        }
                    </p>
                </div>
                <button
                    onClick={onUnlock}
                    className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium"
                >
                    {contentType === "booking" ? "Complete Booking" : "Access Content Now"}
                </button>
            </div>
        );
    }

    if (paymentStatus === "error") {
        return (
            <div className="text-center p-8">
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
                            setPaymentStatus("idle");
                            setErrorMessage("");
                        }}
                        className="w-full bg-accent text-white py-3 rounded-lg font-medium"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Default paywall display
    return (
        <div className="text-center p-8">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <i className={`fas ${contentType === "booking" ? "fa-credit-card" : "fa-lock"} text-white text-3xl`}></i>
            </div>
            <h3 className="text-xl font-bold mb-2">
                {contentType === "booking" ? "Complete Payment" : "Premium Content"}
            </h3>
            <p className="text-gray-600 mb-4">
                {contentType === "booking" 
                    ? "Pay for your booking session."
                    : `This ${contentType} requires payment to access.`
                }
            </p>
            <p className="text-accent font-bold text-2xl mb-6">
                {price} {token}
            </p>

            {/* Payment Breakdown */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Payment Breakdown:</h4>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>{contentType === "booking" ? "Provider receives:" : "Creator receives:"}</span>
                        <span className="font-semibold">{(price * (1 - PLATFORM_FEE_PERCENTAGE)).toFixed(4)} {token}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Platform fee (2%):</span>
                        <span className="font-semibold">{(price * PLATFORM_FEE_PERCENTAGE).toFixed(4)} {token}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                        <span>Total:</span>
                        <span>{price.toFixed(4)} {token}</span>
                    </div>
                </div>
            </div>

            {/* Seller Address Display */}
            {sellerAddress && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">{contentType === "booking" ? "Provider's wallet:" : "Creator's wallet:"}</p>
                    <div className="flex items-center justify-center space-x-2">
                        <code className="text-xs font-mono text-gray-800 break-all">
                            {sellerAddress.slice(0, 10)}...{sellerAddress.slice(-6)}
                        </code>
                        <button
                            onClick={() => navigator.clipboard.writeText(sellerAddress)}
                            className="text-accent hover:text-accent-dark"
                            title="Copy address"
                        >
                            <i className="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
            )}

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

                    {/* Balance Error Display */}
                    {balanceError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-700">
                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                {balanceError}
                            </p>
                        </div>
                    )}

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
                                    ? "Sufficient balance - One-click automated payment available"
                                    : `Insufficient balance - You need ${(price - parseFloat(currentBalance)).toFixed(4)} more ${token}`
                                }
                            </p>
                        </div>
                    )}

                    {balance && hasSufficientBalance && !balanceError ? (
                        <button
                            onClick={handleAutomatedPayment}
                            disabled={isProcessing}
                            className="bg-accent text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-opacity-90 transition duration-200 disabled:opacity-50"
                        >
                            <i className="fas fa-bolt mr-2"></i>
                            Pay {price} {token} & {contentType === "booking" ? "Book Session" : "Unlock"}
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