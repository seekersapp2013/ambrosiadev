import { useState } from "react";
import axios from "axios";

interface NovaAIChatProps {
  onNavigate?: (screen: string, data?: any) => void;
}

export function NovaAIChat({ onNavigate }: NovaAIChatProps = {}) {
  const [inputText, setInputText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      setError("Please enter a message");
      return;
    }

    setLoading(true);
    setError("");
    setResponse("");

    try {
      const apiKey = import.meta.env.VITE_NOVA_API_KEY;
      
      if (!apiKey) {
        throw new Error("Nova API key not found in environment variables");
      }

      // Build the content array
      const content: any[] = [
        {
          type: "text",
          text: inputText
        }
      ];

      // Add image if URL is provided
      if (imageUrl.trim()) {
        content.push({
          type: "image_url",
          image_url: {
            url: imageUrl.trim()
          }
        });
      }

      const result = await axios.post(
        "https://api.nova.amazon.com/v1/chat/completions",
        {
          model: "nova-2-lite-v1",
          messages: [
            {
              role: "user",
              content: content
            }
          ]
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          }
        }
      );

      // Extract the response text
      const aiResponse = result.data.choices?.[0]?.message?.content || "No response received";
      setResponse(aiResponse);
    } catch (err: any) {
      console.error("Nova API Error:", err);
      setError(err.response?.data?.error?.message || err.message || "Failed to get response from Nova AI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Nova AI Chat</h2>

        {/* Text Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Message
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="What would you like to ask?"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            rows={4}
            disabled={loading}
          />
        </div>

        {/* Image URL Input (Optional) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image URL (Optional)
          </label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            disabled={loading}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !inputText.trim()}
          className="w-full bg-accent text-white py-3 px-6 rounded-lg font-medium hover:bg-accent/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Processing...
            </>
          ) : (
            "Send to Nova AI"
          )}
        </button>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">AI Response:</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
