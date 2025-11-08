import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface FundWalletProps {
    onBack: () => void;
}

export function FundWallet({ onBack }: FundWalletProps) {
    const myProfile = useQuery(api.profiles.getMyProfile);

    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                <button onClick={onBack} className="text-gray-600">
                    <i className="fas fa-arrow-left text-xl"></i>
                </button>
                <h1 className="text-lg font-semibold">Fund Wallet</h1>
                <div></div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-wallet text-white text-3xl"></i>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Fund Your Wallet</h2>
                    <p className="text-gray-600">
                        Get tokens added to your wallet to make payments
                    </p>
                </div>

                {/* Wallet Address Display */}
                {myProfile?.walletAddress && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-gray-800 mb-2">Your Wallet Address:</h3>
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <code className="text-sm font-mono text-gray-800 break-all">
                                    {myProfile.walletAddress}
                                </code>
                                <button
                                    onClick={() => navigator.clipboard.writeText(myProfile.walletAddress!)}
                                    className="ml-2 text-accent hover:text-accent-dark"
                                    title="Copy address"
                                >
                                    <i className="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Funding Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
                        <i className="fas fa-info-circle mr-2"></i>
                        How to Fund Your Wallet
                    </h3>
                    <div className="space-y-4 text-blue-700">
                        <p className="text-sm">
                            To add funds to your wallet, please contact our admin team with your wallet address.
                        </p>

                        <div className="bg-white border border-blue-200 rounded-lg p-4">
                            <p className="font-semibold mb-2">Contact Information:</p>
                            <div className="flex items-center space-x-2">
                                <i className="fas fa-envelope text-blue-600"></i>
                                <a
                                    href="mailto:graderng@gmail.com"
                                    className="text-blue-600 hover:text-blue-800 underline"
                                >
                                    graderng@gmail.com
                                </a>
                            </div>
                        </div>

                        <div className="text-sm">
                            <p className="font-semibold mb-2">Include in your email:</p>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>Your wallet address (shown above)</li>
                                <li>The amount you need</li>
                                <li>The token type (USD or CELO)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                    <button
                        onClick={() => {
                            const subject = "Wallet Funding Request";
                            const body = `Hello,\n\nI would like to request funding for my wallet.\n\nWallet Address: ${myProfile?.walletAddress || '[Your wallet address]'}\nAmount Needed: [Enter amount]\nToken Type: [USD/CELO]\n\nThank you!`;
                            window.open(`mailto:graderng@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                        }}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-200"
                    >
                        <i className="fas fa-envelope mr-2"></i>
                        Send Funding Request Email
                    </button>

                    <button
                        onClick={onBack}
                        className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition duration-200"
                    >
                        <i className="fas fa-arrow-left mr-2"></i>
                        Go Back
                    </button>
                </div>

                {/* Additional Info */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-500">
                        Funding requests are typically processed within 24 hours during business days.
                    </p>
                </div>
            </div>
        </div>
    );
}