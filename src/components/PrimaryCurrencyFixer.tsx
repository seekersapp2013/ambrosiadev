import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getSupportedCurrencies } from "../utils/currencyConfig";

export function PrimaryCurrencyFixer() {
  const [selectedCurrency, setSelectedCurrency] = useState("NGN");
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState("");

  const walletBalance = useQuery(api.wallets.getWalletBalance.getWalletBalance, {});
  const myProfile = useQuery(api.profiles.getMyProfile);
  const updatePrimaryCurrency = useMutation(api.wallets.updatePrimaryCurrency.updatePrimaryCurrency);
  const syncPrimaryCurrency = useMutation(api.wallets.updatePrimaryCurrency.ensureWalletPrimaryCurrency);

  const supportedCurrencies = getSupportedCurrencies();

  const handleUpdatePrimaryCurrency = async () => {
    setIsUpdating(true);
    setMessage("");

    try {
      await updatePrimaryCurrency({ primaryCurrency: selectedCurrency });
      setMessage(`✅ Primary currency updated to ${selectedCurrency}`);
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : "Update failed"}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSyncPrimaryCurrency = async () => {
    setIsUpdating(true);
    setMessage("");

    try {
      const result = await syncPrimaryCurrency();
      if (result.updated) {
        setMessage(`✅ Ensured primary currency is set: ${result.primaryCurrency}`);
      } else {
        setMessage(`ℹ️ Primary currency already set: ${result.primaryCurrency}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : "Sync failed"}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Primary Currency Fixer</h3>
      
      {/* Current Status */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-2">Current Status:</h4>
        <p className="text-sm text-gray-600">
          Wallet Primary: <strong>{walletBalance?.primaryCurrency || "Loading..."}</strong>
        </p>
      </div>

      {/* Currency Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Primary Currency:
        </label>
        <select
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isUpdating}
        >
          {supportedCurrencies.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.flag} {currency.code} - {currency.name}
            </option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleSyncPrimaryCurrency}
          disabled={isUpdating}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? "Processing..." : "Ensure Primary Currency Set"}
        </button>
        
        <button
          onClick={handleUpdatePrimaryCurrency}
          disabled={isUpdating}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? "Processing..." : `Set Primary to ${selectedCurrency}`}
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`mt-4 p-3 rounded-lg ${
          message.includes("✅") ? "bg-green-100 text-green-700" :
          message.includes("❌") ? "bg-red-100 text-red-700" :
          "bg-blue-100 text-blue-700"
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}