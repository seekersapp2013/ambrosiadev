import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

type ActionType = "all" | "APPROVE" | "REJECT" | "BAN" | "UNBAN" | "ASSIGN_ROLE" | "REMOVE_ROLE";

export function ModerationHistory() {
  const [selectedType, setSelectedType] = useState<ActionType>("all");
  const [limit, setLimit] = useState(50);

  const history = useQuery(
    api.moderationActions.getModerationHistory,
    selectedType === "all" ? { limit } : { limit, actionType: selectedType }
  );

  const getActionIcon = (actionType: string) => {
    const icons: Record<string, string> = {
      APPROVE: "fa-check text-green-600",
      REJECT: "fa-times text-red-600",
      BAN: "fa-ban text-red-600",
      UNBAN: "fa-check-circle text-green-600",
      ASSIGN_ROLE: "fa-user-plus text-blue-600",
      REMOVE_ROLE: "fa-user-minus text-orange-600",
      UPDATE_SETTINGS: "fa-cog text-purple-600",
      CREATE_ROLE: "fa-plus text-blue-600",
      DELETE_ROLE: "fa-trash text-red-600",
    };
    return icons[actionType] || "fa-circle text-gray-600";
  };

  const getActionLabel = (actionType: string) => {
    const labels: Record<string, string> = {
      APPROVE: "Approved",
      REJECT: "Rejected",
      BAN: "Banned User",
      UNBAN: "Unbanned User",
      ASSIGN_ROLE: "Assigned Role",
      REMOVE_ROLE: "Removed Role",
      UPDATE_SETTINGS: "Updated Settings",
      CREATE_ROLE: "Created Role",
      DELETE_ROLE: "Deleted Role",
    };
    return labels[actionType] || actionType;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-6">Moderation History</h2>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        <FilterButton
          active={selectedType === "all"}
          onClick={() => setSelectedType("all")}
          label="All"
        />
        <FilterButton
          active={selectedType === "APPROVE"}
          onClick={() => setSelectedType("APPROVE")}
          label="Approvals"
        />
        <FilterButton
          active={selectedType === "REJECT"}
          onClick={() => setSelectedType("REJECT")}
          label="Rejections"
        />
        <FilterButton
          active={selectedType === "BAN"}
          onClick={() => setSelectedType("BAN")}
          label="Bans"
        />
        <FilterButton
          active={selectedType === "ASSIGN_ROLE"}
          onClick={() => setSelectedType("ASSIGN_ROLE")}
          label="Role Changes"
        />
      </div>

      {/* History Items */}
      {history === undefined ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-history text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No History Yet</h3>
          <p className="text-gray-500">Moderation actions will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((action: any) => (
            <div
              key={action._id}
              className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <i className={`fas ${getActionIcon(action.actionType)} text-lg`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium">{getActionLabel(action.actionType)}</span>
                    {action.performerRoleName && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {action.performerRoleName}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    By: <span className="font-medium">{action.performer.username || action.performer.name}</span>
                  </p>
                  {action.reason && (
                    <p className="text-sm text-gray-600 mb-1">
                      Reason: {action.reason}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {formatDate(action.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {history && history.length >= limit && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setLimit(limit + 50)}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
        active
          ? "bg-purple-600 text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}
