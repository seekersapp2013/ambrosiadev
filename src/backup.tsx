"use client";

import {
  Authenticated,
  Unauthenticated,
  useConvexAuth,
  useMutation,
  useQuery,
} from "convex/react";


import { api } from "../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState, useEffect } from "react";
import axios from "axios";

// Main App Entry
export default function App() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-light dark:bg-dark p-4 border-b-2 border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <span className="text-xl font-semibold">📧 Ambrosia Dashboard</span>
        <SignOutButton />
      </header>

      <main className="p-8 flex flex-col gap-16">
        <h1 className="text-4xl font-bold text-center">Ambrosia Dashboard</h1>
        <Authenticated>
          <Content />
        </Authenticated>
      
        <Unauthenticated>
          <SignInForm />
        </Unauthenticated>
      </main>
    </>
  );
}

// Sign Out Button
function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  return isAuthenticated ? (
    <button
      onClick={() => void signOut()}
      className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
    >
      <span className="text-lg">🚪</span> Sign out
    </button>
  ) : null;
}

// Sign In / Sign Up Form with Wallet Creation
function SignInForm() {
  const { signIn } = useAuthActions();
  const sendEmail = useMutation(api.emails.sendEmail);
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    formData.set("flow", flow);

    try {
      await signIn("password", formData);

      if (flow === "signUp") {
        setIsCreatingWallet(true);
        try {
          const walletResponse = await axios.get("/api/createWallet");
          localStorage.setItem("wallet", JSON.stringify(walletResponse.data));

          await sendEmail({
            to: email,
            subject: "🎉 Your Ambrosia Has Been Created!",
            body: `
🎉 **Welcome to Ambrosia!**

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

Thank you for choosing **Ambrosia**.  
If you have any questions, feel free to reach out.

Warm regards,  
**The Oathstone Team**
            `.trim(),
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
    <div className="flex flex-col gap-8 w-96 mx-auto">
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <label htmlFor="email">
          You must use a verified domain for your email to send correctly
        </label>
        <input
          type="email"
          name="email"
          required
          placeholder="email@your-verified-domain.com"
          className="p-2 rounded-md border-2 bg-light dark:bg-dark text-dark dark:text-light border-slate-300 dark:border-slate-700"
        />
        <input
          type="text"
          name="name"
          required
          placeholder="Name"
          className="p-2 rounded-md border-2 bg-light dark:bg-dark text-dark dark:text-light border-slate-300 dark:border-slate-700"
        />
        <input
          type="password"
          name="password"
          required
          placeholder="Password"
          className="p-2 rounded-md border-2 bg-light dark:bg-dark text-dark dark:text-light border-slate-300 dark:border-slate-700"
        />
        <button
          type="submit"
          disabled={isCreatingWallet}
          className="bg-dark dark:bg-light text-light dark:text-dark rounded-md p-2 disabled:opacity-50"
        >
          {isCreatingWallet ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
              {flow === "signIn" ? "Signing in..." : "Creating account & wallet..."}
            </div>
          ) : flow === "signIn" ? "Sign in" : "Sign up"}
        </button>

        <div className="flex flex-row gap-2">
          <span>
            {flow === "signIn" ? "Don't have an account?" : "Already have an account?"}
          </span>
          <span
            className="underline cursor-pointer"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </span>
        </div>

        {error && (
          <div className="bg-red-500/20 border-2 border-red-500/50 rounded-md p-2">
            <p className="text-dark dark:text-light font-mono text-xs">Error: {error}</p>
          </div>
        )}
        {isCreatingWallet && (
          <div className="bg-blue-500/20 border-2 border-blue-500/50 rounded-md p-2">
            <p className="text-dark dark:text-light font-mono text-xs">
              Creating your wallet and sending details to your email...
            </p>
          </div>
        )}
      </form>
    </div>
  );
}

// Main Dashboard Content
function Content() {
  const emails = useQuery(api.emails.listMyEmailsAndStatuses);
  const sendEmail = useMutation(api.emails.sendEmail);

  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [subject, setSubject] = useState("Hello");
  const [message, setMessage] = useState("World");
  const [isSending, setIsSending] = useState(false);
  const [_storedWallet, setStoredWallet] = useState<any | null>(null);
  const [generatedWallet, setGeneratedWallet] = useState<any | null>(null);

  useEffect(() => {
    const wallet = localStorage.getItem("wallet");
    if (wallet) {
      setStoredWallet(JSON.parse(wallet));
    }
  }, []);

const [balance, setBalance] = useState<any>(null);
const [balanceError, setBalanceError] = useState<string | null>(null);
const [transferStatus, setTransferStatus] = useState<"loading" | "success" | "error" | string | null>(null);
const [transferResponse, setTransferResponse] = useState<any>(null);



useEffect(() => {
  const fetchBalance = async () => {
    const walletData = localStorage.getItem("wallet");
    if (!walletData) return;

    try {
      const parsed = JSON.parse(walletData);
      const privateKey = parsed.wallet?.privateKey;
      if (!privateKey) {
        setBalanceError("No private key found in stored wallet.");
        return;
      }

      const response = await axios.post("/api/getBalance", {
        privateKey,
      });

      if (response.data.success) {
        setBalance(response.data.balances);
      } else {
        setBalanceError("API did not return success.");
      }
    } catch (err) {
      console.error("Failed to fetch balance:", err);
      setBalanceError("Failed to fetch balance.");
    }
  };

  fetchBalance();
}, []);


  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipient || !subject || !message) return;
    setIsSending(true);
    try {
      await sendEmail({ to: selectedRecipient, subject, body: message });
      setSelectedRecipient("");
    } catch (err) {
      alert("Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-16">
  
      {/* Wallet Balance Section */}
<section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
  <h2 className="text-2xl font-bold mb-4">💰 Wallet Balance</h2>
  {balanceError ? (
    <p className="text-red-500">{balanceError}</p>
  ) : balance ? (
    <div className="space-y-2">
      <p><strong>Address:</strong> {balance.celo.address}</p>
      <p><strong>Native Balance (CELO):</strong> {balance.celo.native}</p>
      <p><strong>USD Token:</strong> {balance.celo.tokens?.USD ?? "N/A"}</p>
    </div>
  ) : (
    <p className="text-slate-500 dark:text-slate-400">Loading balance...</p>
  )}
</section>



      {/* Generate Wallet */}
      <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-4">⚡ Generate New Wallet</h2>
        <button
          onClick={async () => {
            try {
              const res = await axios.get("/api/createWallet");
              setGeneratedWallet(res.data);
            } catch (err) {
              setGeneratedWallet({ error: "Failed to generate wallet" });
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-all"
        >
          Generate Wallet
        </button>
        {generatedWallet && (
          <pre className="text-sm bg-slate-100 dark:bg-slate-700 p-4 rounded-lg mt-4 overflow-x-auto">
            {JSON.stringify(generatedWallet, null, 2)}
          </pre>
        )}
      </section>

      {/* Send Test Email */}
      <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-4">📧 Send Test Email</h2>
        <form onSubmit={handleSendEmail} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Recipient"
            value={selectedRecipient}
            onChange={(e) => setSelectedRecipient(e.target.value)}
            className="p-3 border rounded-md bg-slate-100 dark:bg-slate-700"
          />
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="p-3 border rounded-md bg-slate-100 dark:bg-slate-700"
          />
          <textarea
            placeholder="Message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="p-3 border rounded-md bg-slate-100 dark:bg-slate-700"
          />
          <button
            type="submit"
            disabled={isSending}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-md shadow-lg disabled:opacity-50"
          >
            {isSending ? "Sending..." : "Send Test Email"}
          </button>
        </form>
      </section>

{/* Transfer Funds Section */}
<section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
  <h2 className="text-2xl font-bold mb-4">💸 Transfer Funds</h2>
  <form
    className="flex flex-col gap-4"
    onSubmit={async (e) => {
      e.preventDefault();
      setTransferStatus("loading");

      const form = e.target as HTMLFormElement;
      const address = (form.elements.namedItem("address") as HTMLInputElement).value;
      const amount = (form.elements.namedItem("amount") as HTMLInputElement).value;
      const type = (form.elements.namedItem("type") as HTMLSelectElement).value;

      try {
        const walletData = localStorage.getItem("wallet");
        if (!walletData) {
          setTransferStatus("No wallet found in localStorage.");
          return;
        }

        const { wallet } = JSON.parse(walletData);
        const res = await axios.post("/api/transfer", {
          privateKey: wallet.privateKey,
          address,
          amount,
          type,
        });

        setTransferResponse(res.data);
        setTransferStatus("success");
      } catch (err) {
        console.error("Transfer error:", err);
        setTransferStatus("error");
      }
    }}
  >
    <input
      name="address"
      type="text"
      placeholder="Recipient Address"
      required
      className="p-3 border rounded-md bg-slate-100 dark:bg-slate-700"
    />
    <input
      name="amount"
      type="number"
      step="any"
      placeholder="Amount"
      required
      className="p-3 border rounded-md bg-slate-100 dark:bg-slate-700"
    />
    <select
      name="type"
      className="p-3 border rounded-md bg-slate-100 dark:bg-slate-700"
      defaultValue="native"
    >
      <option value="native">Native (CELO)</option>
      <option value="token">USD Token</option>
    </select>
    <button
      type="submit"
 className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-md shadow-lg disabled:opacity-50"
    >
      Send Funds
    </button>
  </form>

  {/* Transfer Status Message */}
  {transferStatus === "loading" && <p className="mt-4 text-blue-500">Sending...</p>}
  {transferStatus === "success" && transferResponse && (
    <pre className="mt-4 bg-slate-100 dark:bg-slate-700 p-4 rounded-lg text-sm overflow-x-auto">
      {JSON.stringify(transferResponse, null, 2)}
    </pre>
  )}
  {transferStatus === "error" && (
    <p className="mt-4 text-red-500">❌ Transfer failed. Check console.</p>
  )}
</section>

      {/* Email History */}
      <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-4">📊 Email History</h2>
        {emails === undefined ? (
          <div className="text-center">Loading...</div>
        ) : emails.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400">No emails yet.</p>
        ) : (
          <ul className="space-y-4">
            {emails.map((email) => (
              <li key={email.emailId} className="border p-4 rounded-md bg-slate-100 dark:bg-slate-700">
                <p><strong>To:</strong> {email.to}</p>
                <p><strong>Subject:</strong> {email.subject}</p>
                <p><strong>Status:</strong> {email.status || "Unknown"}</p>
                <p className="text-sm text-slate-400">
                  {new Date(email.sentAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}