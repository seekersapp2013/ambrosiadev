import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function GenerateWallet() {
  const [isCreating, setIsCreating] = useState(false);
  
  const myProfile = useQuery(api.profiles.getMyProfile);
  const myWallet = useQuery(api.wallets.getWalletBalance.getMyWallet);
  const createWallet = useMutation(api.wallets.createWallet.createWallet);

  const handleCreateWallet = async () => {
    if (!myProfile?.username) {
      alert("Please complete your profile setup first.");
      return;
    }

    setIsCreating(true);
    try {
      await createWallet();
      alert("Multi-currency wallet created successfully!");
    } catch (error) {
      console.error("Error creating wallet:", error);
      alert("Failed to create wallet. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  if (myWallet) {
    return (
      <section className="bg-white p-6 rounded-xl border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-accent flex items-center">
          <i className="fas fa-check-circle mr-2 text-green-500"></i>
          Wallet Active
        </h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 mb-2">
            <i className="fas fa-wallet mr-2"></i>
            Your multi-currency wallet is active and ready to use!
          </p>
          <div className="text-sm text-green-600">
            <p><strong>Primary Currency:</strong> {myWallet.primaryCurrency}</p>
            <p><strong>Created:</strong> {new Date(myWallet.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white p-6 rounded-xl border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-accent flex items-center">
        <i className="fas fa-plus-circle mr-2"></i>
        Create Multi-Currency Wallet
      </h2>
      <p className="text-gray-600 mb-4">
        Create a secure multi-currency wallet to manage your funds across 9 supported currencies.
      </p>
      <button
        onClick={handleCreateWallet}
        disabled={isCreating || !myProfile?.username}
        className="bg-accent text-white py-3 px-6 rounded-lg font-medium hover:bg-opacity-90 transition duration-200 disabled:opacity-50"
      >
        {isCreating ? (
          <div className="flex items-center">
            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
            Creating...
          </div>
        ) : (
          <>
            <i className="fas fa-wallet mr-2"></i>
            Create Wallet
          </>
        )}
      </button>
      {!myProfile?.username && (
        <p className="text-red-600 text-sm mt-2">
          <i className="fas fa-exclamation-triangle mr-1"></i>
          Please complete your profile setup first.
        </p>
      )}
    </section>
  );
}