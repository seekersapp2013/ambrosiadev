import { useState } from "react";
import { useQuery } from "convex/react";
import axios from "axios";
import { api } from "../../convex/_generated/api";

export function TransferFunds() {
  const [transferStatus, setTransferStatus] = useState<"loading" | "success" | "error" | string | null>(null);
  const [transferResponse, setTransferResponse] = useState<any>(null);
  
  // Get wallet data from Convex profile instead of localStorage
  const myProfile = useQuery(api.profiles.getMyProfile);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferStatus("loading");

    const form = e.target as HTMLFormElement;
    const address = (form.elements.namedItem("address") as HTMLInputElement).value;
    const amount = (form.elements.namedItem("amount") as HTMLInputElement).value;
    const type = (form.elements.namedItem("type") as HTMLSelectElement).value;

    try {
      if (!myProfile?.privateKey) {
        setTransferStatus("No wallet found in profile.");
        return;
      }

      const res = await axios.post("https://oathstone-api2.azurewebsites.net/transfer", {
        privateKey: myProfile.privateKey,
        address,
        amount,
        type,
      });

      setTransferResponse(res.data);
      setTransferStatus("success");
      
      // Reset form
      form.reset();
    } catch (err) {
      console.error("Transfer error:", err);
      setTransferStatus("error");
    }
  };

  return (
    <section className="bg-white p-6 rounded-xl border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-accent flex items-center">
        <i className="fas fa-exchange-alt mr-2"></i>
        Transfer Funds
      </h2>
      <form onSubmit={handleTransfer} className="space-y-4">
        <input
          name="address"
          type="text"
          placeholder="Recipient Address"
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
        <input
          name="amount"
          type="number"
          step="any"
          placeholder="Amount"
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
        <select
          name="type"
          defaultValue="native"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        >
          <option value="native">Native (CELO)</option>
          <option value="token">USD Token</option>
        </select>
        <button
          type="submit"
          disabled={transferStatus === "loading"}
          className="w-full bg-accent text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition duration-200 disabled:opacity-50"
        >
          {transferStatus === "loading" ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
              Sending...
            </div>
          ) : (
            <>
              <i className="fas fa-send mr-2"></i>
              Send Funds
            </>
          )}
        </button>
      </form>

      {/* Transfer Status Message */}
      {transferStatus === "loading" && (
        <div className="mt-4 bg-blue-100 border border-blue-300 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
            <p className="text-blue-700">Processing transfer...</p>
          </div>
        </div>
      )}
      {transferStatus === "success" && transferResponse && (
        <div className="mt-4 bg-green-100 border border-green-300 rounded-lg p-4">
          <p className="text-green-700 font-medium mb-2">✅ Transfer successful!</p>
          <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
            {JSON.stringify(transferResponse, null, 2)}
          </pre>
        </div>
      )}
      {transferStatus === "error" && (
        <div className="mt-4 bg-red-100 border border-red-300 rounded-lg p-4">
          <p className="text-red-700">❌ Transfer failed. Check console for details.</p>
        </div>
      )}
      {typeof transferStatus === "string" && !["loading", "success", "error"].includes(transferStatus) && (
        <div className="mt-4 bg-yellow-100 border border-yellow-300 rounded-lg p-4">
          <p className="text-yellow-700">{transferStatus}</p>
        </div>
      )}
    </section>
  );
}