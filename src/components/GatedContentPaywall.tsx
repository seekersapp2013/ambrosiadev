import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface GatedContentPaywallProps {
    contentType?: "article" | "reel" | "booking";
    contentId?: Id<"articles"> | Id<"reels">;
    title: string;
    price: number;
    token: string;
    sellerAddress?: string; // Optional for backward compatibility
    onUnlock: () => void;
    onFundWallet?: () => void;
}

export function GatedContentPaywall({
    contentType = "article",
    contentId,
    price,
    token,
    sellerAddress, // Accept but ignore for now
    onUnlock,
    onFundWallet
}: GatedContentPaywallProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const myProfile = useQuery(api.profiles.getMyProfile);
    const walletBalance = useQuery(api.wallets.getWalletBalance.getWalletBalance, { currency: "USD" });
    const purchaseContent = useMutation(api.payments.purchaseContent);

    // Check if user has sufficient balance (using USD for content purchases)
    const hasSufficientBalance = walletBalance ? walletBalance.balances.USD >= price : false;
    const currentBalance = walletBalance ? walletBalance.balances.USD.toFixed(2) : "0.00";

    const handlePurchase = async () => {
        if (!contentId) {
            setErrorMessage("Content ID not available");
            setPaymentStatus("error");
            return;
        }

        if (!hasSufficientBalance) {
            setErrorMessage("Insufficient balance. Please deposit funds first.");
            setPaymentStatus("error");
            return;
        }

        setIsProcessing(true);
        setPaymentStatus("processing");
        setErrorMessage("");

        try {
            await purchaseContent({
                contentType,
                contentId,
                priceToken: token,
                priceAmount: price,
            });

            setPaymentStatus("success");

            // Auto-redirect after success
            setTimeout(() => {
                onUnlock();
            }, 2000);

        } catch (error) {
            console.error("Purchase failed:", error);
            setErrorMessage(error instanceof Error ? error.message : "Purchase failed");
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
                        Transferring ${price} to content creator
                    </p>
                    <p className="text-gray-400">
                        <i className="fas fa-clock mr-2"></i>
                        Processing internal transfer
                    </p>
                </div>
                <p className="text-sm text-gray-500 mt-6">
                    This usually takes just a moment...
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
                    Your payment has been processed and the content is now unlocked.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Amount Paid:</span>
                        <span className="font-bold text-green-600">${price} {token}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-gray-600">Platform Fee (2%):</span>
                        <span className="text-gray-600">${(price * 0.02).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-gray-600">Creator Receives:</span>
                        <span className="font-bold">${(price * 0.98).toFixed(2)}</span>
                    </div>
                </div>
                <p className="text-sm text-gray-500">
                    Redirecting to content in 2 seconds...
                </p>
            </div>
        );
    }

    if (paymentStatus === "error") {
        return (
            <div className="text-center p-8">
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fas fa-times text-white text-3xl"></i>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-red-600">Payment Failed</h2>
                <p className="text-gray-600 mb-6">
                    {errorMessage || "Something went wrong with your payment."}
                </p>
                <div className="space-y-3">
                    <button
                        onClick={() => {
                            setPaymentStatus("idle");
                            setErrorMessage("");
                        }}
                        className="w-full bg-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-accent-dark"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-lock text-white text-2xl"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Content</h2>
                <p className="text-gray-600">
                    This {contentType} requires payment to access
                </p>
            </div>

            <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">Price:</span>
                        <span className="text-2xl font-bold text-accent">${price} {token}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Platform Fee (2%):</span>
                        <span className="text-gray-500">${(price * 0.02).toFixed(2)}</span>
                    </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Your Balance:</span>
                        <span className={`font-bold ${hasSufficientBalance ? 'text-green-600' : 'text-red-600'}`}>
                            ${currentBalance}
                        </span>
                    </div>
                    {!hasSufficientBalance && (
                        <p className="text-red-600 text-sm mt-2">
                            Insufficient balance. Need ${(price - (walletBalance?.balances.USD || 0)).toFixed(2)} more.
                        </p>
                    )}
                </div>
            </div>

            {errorMessage && (
                <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
                    <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>
            )}

            <div className="space-y-3">
                {hasSufficientBalance ? (
                    <button
                        onClick={handlePurchase}
                        disabled={isProcessing}
                        className="w-full bg-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? "Processing..." : `Purchase for $${price}`}
                    </button>
                ) : (
                    <button
                        onClick={onFundWallet}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700"
                    >
                        Deposit Funds
                    </button>
                )}

                <button
                    onClick={() => window.history.back()}
                    className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300"
                >
                    Go Back
                </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                    Payments are processed instantly using your internal wallet balance.
                    All transactions are secure and recorded.
                </p>
            </div>
        </div>
    );
}