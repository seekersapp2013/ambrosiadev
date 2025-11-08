import { useState } from "react";
import axios from "axios";

export function GenerateWallet() {
  const [generatedWallet, setGeneratedWallet] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateWallet = async () => {
    setIsGenerating(true);
    try {
      const res = await axios.get("/api/createWallet");
      setGeneratedWallet(res.data);
    } catch (err) {
      setGeneratedWallet({ error: "Failed to generate wallet" });
    } finally {
      setIsGenerating(false);
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