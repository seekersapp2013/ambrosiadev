import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

export function ModerationSetup() {
  const setupModeration = useMutation(api.setupModeration.setupModerationSystem);
  const checkStatus = useMutation(api.setupModeration.checkModerationStatus);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const result = await setupModeration();
      alert(result.message);
      await handleCheckStatus();
    } catch (error) {
      console.error("Setup error:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    try {
      const result = await checkStatus();
      setStatus(result);
    } catch (error) {
      console.error("Status check error:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Moderation System Setup</h1>

      <div className="space-y-4">
        <button
          onClick={handleSetup}
          disabled={loading}
          className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? "Setting up..." : "Initialize Moderation System"}
        </button>

        <button
          onClick={handleCheckStatus}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Checking..." : "Check System Status"}
        </button>
      </div>

      {status && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h2 className="font-bold mb-3">System Status</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Initialized:</span>
              <span className={status.isInitialized ? "text-green-600" : "text-red-600"}>
                {status.isInitialized ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Primary Admin:</span>
              <span>{status.primaryAdminUserId || "Not set"}</span>
            </div>
            <div className="flex justify-between">
              <span>Current User:</span>
              <span>{status.currentUserId}</span>
            </div>
            <div className="flex justify-between">
              <span>Has Settings:</span>
              <span className={status.hasSettings ? "text-green-600" : "text-red-600"}>
                {status.hasSettings ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Roles:</span>
              <span>{status.totalRoles}</span>
            </div>
            <div className="flex justify-between">
              <span>My Roles:</span>
              <span>{status.myRoles.length}</span>
            </div>
            {status.myRoles.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-300">
                <p className="font-semibold mb-2">My Roles:</p>
                {status.myRoles.map((role: any) => (
                  <div key={role._id} className="ml-4 mb-2">
                    <p className="font-medium">
                      {role.name}
                      {role.isPrimaryAdmin && (
                        <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-1 rounded">
                          Primary Admin
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-600">{role.description}</p>
                    <p className="text-xs text-gray-500">
                      Permissions: {role.permissions.join(", ")}
                    </p>
                    <p className="text-xs text-gray-500">
                      Can Approve: {role.canApprove.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
