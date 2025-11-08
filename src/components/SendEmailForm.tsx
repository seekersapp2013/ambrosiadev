import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function SendEmailForm() {
  const sendEmail = useMutation(api.emails.sendEmail);
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [subject, setSubject] = useState("Hello");
  const [message, setMessage] = useState("World");
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipient || !subject || !message) return;
    setIsSending(true);
    try {
      await sendEmail({ to: selectedRecipient, subject, body: message });
      setSelectedRecipient("");
      setSubject("Hello");
      setMessage("World");
    } catch (err) {
      alert("Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="bg-white p-6 rounded-xl border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-accent flex items-center">
        <i className="fas fa-envelope mr-2"></i>
        Send Test Email
      </h2>
      <form onSubmit={handleSendEmail} className="space-y-4">
        <input
          type="text"
          placeholder="Recipient"
          value={selectedRecipient}
          onChange={(e) => setSelectedRecipient(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
        <textarea
          placeholder="Message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
        <button
          type="submit"
          disabled={isSending}
          className="w-full bg-accent text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition duration-200 disabled:opacity-50"
        >
          {isSending ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
              Sending...
            </div>
          ) : (
            <>
              <i className="fas fa-paper-plane mr-2"></i>
              Send Test Email
            </>
          )}
        </button>
      </form>
    </section>
  );
}