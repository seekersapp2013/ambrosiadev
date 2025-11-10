import { useState } from "react";
import axios from "axios";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function GenerateWallet() {
  const [generatedWallet, setGeneratedWallet] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const myProfile = useQuery(api.profiles.getMyProfile);
  const updateProfile = useMutation(api.profiles.createOrUpdateProfile);

  const handleGenerateWallet = async () => {
    setIsGenerating(true);
    try {
      const res = await axios.get("https://oathstone-api2.azurewebsites.net/createWallet");
      setGeneratedWallet(res.data);
      
      // Automatically save to profile if generation was successful
      if (res.data && res.data.address && res.data.privateKey) {
        await saveWalletToProfile(res.data);
      }
    } catch (err) {
      setGeneratedWallet({ error: "Failed to generate wallet" });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveWalletToProfile = async (walletData: any) => {
    if (!myProfile) {
      alert("Profile not found. Please try again.");
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        username: myProfile.username || `user_${Date.now()}`,
        name: myProfile.name || myProfile.user?.name || "User",
        bio: myProfile.bio ?? undefined,
        avatar: myProfile.avatar ?? undefined,
        walletAddress: walletData.address,
        privateKey: walletData.privateKey,
        seedPhrase: walletData.mnemonic,
      });
      
      alert("Wallet generated and saved to your profile successfully!");
    } catch (error) {
      console.error("Error saving wallet to profile:", error);
      alert("Wallet generated but failed to save to profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="bg-white p-6 rounded-xl border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-accent flex items-center">
        <i className="fas fa-plus-circle mr-2"></i>
        Generate New Wallet
      </h2>
      <button
        onClick={handleGenerateWallet}
        disabled={isGenerating}
        className="bg-accent text-white py-3 px-6 rounded-lg font-medium hover:bg-opacity-90 transition duration-200 disabled:opacity-50"
      >
        {isGenerating ? (
          <div className="flex items-center">
            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
            Generating...
          </div>
        ) : (
          <>
            <i className="fas fa-magic mr-2"></i>
            Generate Wallet
          </>
        )}
      </button>
      {generatedWallet && (
        <div className="mt-4 bg-ambrosia-100 p-4 rounded-lg">
          <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(generatedWallet, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}