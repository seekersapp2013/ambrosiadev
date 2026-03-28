import { useState } from "react";

export function ErcasPayDebug() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string>("");

  const testErcasPayAPI = async () => {
    setIsLoading(true);
    setResponse("");

    try {
      console.log("Testing ErcasPay API...");
      const apiUrl = `${import.meta.env.VITE_CONVEX_URL}/ercaspay/test`;
      console.log("Test API URL:", apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("Test response status:", response.status);
      const responseText = await response.text();
      console.log("Test response body:", responseText);

      setResponse(`
=== ErcasPay API Test Results ===
Status: ${response.status} ${response.statusText}
Response: ${responseText}
=== End Test Results ===
      `.trim());

    } catch (error) {
      console.error("Test error:", error);
      setResponse(`Test Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <h3 className="text-lg font-bold mb-4">ErcasPay API Debug</h3>
      
      <button
        onClick={testErcasPayAPI}
        disabled={isLoading}
        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-4"
      >
        {isLoading ? "Testing..." : "Test ErcasPay API"}
      </button>

      {response && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h4 className="font-medium mb-2">API Response:</h4>
          <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-96">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
}