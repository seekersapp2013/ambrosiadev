import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function EmailHistory() {
  const emails = useQuery(api.emails.listMyEmailsAndStatuses);

  return (
    <section className="bg-white p-6 rounded-xl border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-accent flex items-center">
        <i className="fas fa-history mr-2"></i>
        Email History
      </h2>
      {emails === undefined ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : emails.length === 0 ? (
        <div className="text-center py-8">
          <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">No emails yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {emails.map((email) => (
            <div key={email.emailId} className="bg-ambrosia-100 p-4 rounded-lg border border-ambrosia-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">To: {email.to}</p>
                  <p className="text-gray-700">{email.subject}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  email.status === 'sent' ? 'bg-green-100 text-green-800' : 
                  email.status === 'failed' ? 'bg-red-100 text-red-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {email.status || "Unknown"}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {new Date(email.sentAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}