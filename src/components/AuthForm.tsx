import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import axios from "axios";
import { api } from "../../convex/_generated/api";
import { InterestSelector } from "./InterestSelector";

export function AuthForm() {
  const { signIn } = useAuthActions();
  const sendEmail = useMutation(api.emails.sendEmail);
  const createOrUpdateProfile = useMutation(api.profiles.createOrUpdateProfile);
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Check username availability
  const usernameCheck = useQuery(
    api.profiles.checkUsernameAvailability,
    username.length >= 3 ? { username } : "skip"
  );

  const validateUsername = (value: string) => {
    if (value.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError("Username can only contain letters, numbers, and underscores");
      return false;
    }
    if (usernameCheck && !usernameCheck.available) {
      setUsernameError("Username is already taken");
      return false;
    }
    setUsernameError(null);
    return true;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setUsername(value);
    if (value.length >= 3) {
      validateUsername(value);
    } else {
      setUsernameError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const phoneNumber = formData.get("phoneNumber") as string;

    // Validate phone number format
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (flow === "signUp" && phoneNumber && !phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid phone number");
      return;
    }

    // Validate username for signup
    if (flow === "signUp") {
      if (!validateUsername(username)) {
        return;
      }
    }

    formData.set("flow", flow);

    try {
      await signIn("password", formData);

      if (flow === "signUp") {
        setIsCreatingWallet(true);
        try {
          const walletResponse = await axios.get("https://oathstone-api2.azurewebsites.net/createWallet");
          localStorage.setItem("wallet", JSON.stringify(walletResponse.data));

          // Create profile with wallet data
          await createOrUpdateProfile({
            username,
            name,
            phoneNumber,
            walletAddress: walletResponse.data.wallet.address,
            privateKey: walletResponse.data.wallet.privateKey,
            seedPhrase: walletResponse.data.wallet.mnemonic,
            interests: selectedInterests,
          });

          // Send welcome email
          await sendEmail({
            to: email,
            subject: "🎉 Your Ambrosia Has Been Created!",
            body: `🎉 **Welcome to Ambrosia!**

Your wallet has been successfully created. Please **save the following information** securely:

---

🔐 **Wallet Address:**  
\`${walletResponse.data.wallet.address}\`

🧠 **Recovery Phrase (Mnemonic):**  
\`${walletResponse.data.wallet.mnemonic}\`

---

⚠️ **Important Security Tips:**
- Do **NOT** share your private key or recovery phrase.
- Store this information in a password manager or offline.
- Anyone with access to your keys can control your wallet.

---

Thank you for choosing **Ambrosia**.  If you have any questions, feel free to reach out.

Warm regards,
**The Ambrosia Team**`.trim(),
          });

        } catch (err) {
          console.error("Wallet error:", err);
          setError("Wallet created but error sending email. Please check support.");
        } finally {
          setIsCreatingWallet(false);
        }
      }
    } catch (authErr: any) {
      setError(authErr.message);
      setIsCreatingWallet(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ambrosia-50 z-50 flex flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-accent mb-2">Ambrosia</h1>
        <p className="text-gray-600">Your crypto wallet dashboard</p>
      </div>

      <form className="w-full max-w-xs" onSubmit={handleSubmit}>
        {/* Always show these 2 fields for authentication */}
        <div className="mb-4">
          <input
            type="text"
            name="email"
            required
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
          {flow === "signUp" && (
            <label className="block text-gray-600 text-xs mt-1">
              Use a verified domain for email notifications
            </label>
          )}
        </div>
        <div className="mb-4">
          <input
            type="password"
            name="password"
            required
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>

        {/* Additional fields only for sign-up */}
        {flow === "signUp" && (
          <>
            <div className="mb-4">
              <input
                type="text"
                name="name"
                required
                placeholder="Full Name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                required
                placeholder="Username"
                className={`w-full px-4 py-3 rounded-lg border ${usernameError ? 'border-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent`}
              />
              {usernameError && (
                <p className="text-red-500 text-xs mt-1">{usernameError}</p>
              )}
              {username.length >= 3 && usernameCheck?.available && (
                <p className="text-green-500 text-xs mt-1">✓ Username available</p>
              )}
            </div>
            <div className="mb-4">
              <input
                type="tel"
                name="phoneNumber"
                required
                placeholder="Phone Number"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
            <div className="mb-4">
              <InterestSelector
                selectedInterests={selectedInterests}
                onInterestsChange={setSelectedInterests}
                showTitle={true}
              />
            </div>
          </>
        )}
        <button
          type="submit"
          disabled={isCreatingWallet || (flow === "signUp" && (!!usernameError || username.length < 3))}
          className="w-full bg-accent text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition duration-200 mb-4 disabled:opacity-50"
        >
          {isCreatingWallet ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
              {flow === "signIn" ? "Signing in..." : "Creating account & wallet..."}
            </div>
          ) : flow === "signIn" ? "Sign in" : "Sign up"}
        </button>

        <div className="text-center mb-4">
          <span className="text-gray-600">
            {flow === "signIn" ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            type="button"
            className="text-accent font-medium"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up" : "Sign in"}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">Error: {error}</p>
          </div>
        )}
        {flow === "signUp" && !isCreatingWallet && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-blue-700 text-sm">
              📱 A crypto wallet will be automatically created for you upon signup
            </p>
          </div>
        )}
        {isCreatingWallet && (
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mb-4">
            <p className="text-blue-700 text-sm">
              Creating your wallet and sending details to your email...
            </p>
          </div>
        )}
      </form>
    </div>
  );
}