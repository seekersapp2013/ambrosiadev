import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useIsModerator, useIsAdmin, useIsPrimaryAdmin } from "../../hooks/usePermissions";
import { ModerationQueue } from "./ModerationQueue";
import { RoleManagement } from "./RoleManagement";
import { ModerationSettingsPanel } from "./ModerationSettingsPanel";
import { UserRoleAssignment } from "./UserRoleAssignment";
import { ModerationHistory } from "./ModerationHistory";

type TabType = "queue" | "roles" | "settings" | "users" | "history";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("queue");
  const isModerator = useIsModerator();
  const isAdmin = useIsAdmin();
  const isPrimaryAdmin = useIsPrimaryAdmin();
  const myRoles = useQuery(api.moderation.getMyRoles);

  if (!isModerator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <i className="fas fa-shield-alt text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">
            You don't have permission to access the admin dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">
                {myRoles && myRoles.length > 0 && (
                  <span>
                    Role: {myRoles.map((r: any) => r.name).join(", ")}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 overflow-x-auto">
            <TabButton
              active={activeTab === "queue"}
              onClick={() => setActiveTab("queue")}
              icon="fa-inbox"
              label="Queue"
            />
            {isAdmin && (
              <>
                <TabButton
                  active={activeTab === "roles"}
                  onClick={() => setActiveTab("roles")}
                  icon="fa-user-tag"
                  label="Roles"
                />
                <TabButton
                  active={activeTab === "settings"}
                  onClick={() => setActiveTab("settings")}
                  icon="fa-cog"
                  label="Settings"
                />
                <TabButton
                  active={activeTab === "users"}
                  onClick={() => setActiveTab("users")}
                  icon="fa-users"
                  label="Users"
                />
              </>
            )}
            <TabButton
              active={activeTab === "history"}
              onClick={() => setActiveTab("history")}
              icon="fa-history"
              label="History"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "queue" && <ModerationQueue />}
        {activeTab === "roles" && isAdmin && <RoleManagement />}
        {activeTab === "settings" && isAdmin && <ModerationSettingsPanel />}
        {activeTab === "users" && isAdmin && <UserRoleAssignment />}
        {activeTab === "history" && <ModerationHistory />}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${
        active
          ? "bg-purple-600 text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      <i className={`fas ${icon} mr-2`}></i>
      {label}
    </button>
  );
}
