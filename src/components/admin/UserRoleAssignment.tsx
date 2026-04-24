import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export function UserRoleAssignment() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<Id<"moderationRoles"> | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const roles = useQuery(api.moderation.listModerationRoles);
  const assignRole = useMutation(api.moderation.assignRoleToUser);
  const removeRole = useMutation(api.moderation.removeRoleFromUser);

  // Search users (you'll need to create this query)
  const searchResults = useQuery(
    api.profiles.searchProfiles,
    searchTerm.length >= 2 ? { query: searchTerm } : "skip"
  );

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      alert("Please select a user and role");
      return;
    }

    try {
      await assignRole({
        userId: selectedUser.userId,
        roleId: selectedRole,
      });
      alert("Role assigned successfully!");
      setShowAssignModal(false);
      setSelectedUser(null);
      setSelectedRole(null);
    } catch (error) {
      console.error("Error assigning role:", error);
      alert(error instanceof Error ? error.message : "Failed to assign role");
    }
  };

  const handleRemoveRole = async (assignmentId: Id<"moderationAssignments">) => {
    if (!confirm("Are you sure you want to remove this role assignment?")) {
      return;
    }

    try {
      await removeRole({ assignmentId });
      alert("Role removed successfully!");
    } catch (error) {
      console.error("Error removing role:", error);
      alert(error instanceof Error ? error.message : "Failed to remove role");
    }
  };

  const openAssignModal = (user: any) => {
    setSelectedUser(user);
    setShowAssignModal(true);
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6">User Role Assignment</h2>

        {/* Search Users */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Users
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by username or name..."
            className="w-full border border-gray-300 rounded-lg p-3"
          />
        </div>

        {/* Search Results */}
        {searchTerm.length >= 2 && (
          <div className="mb-6">
            {searchResults === undefined ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full"></div>
              </div>
            ) : searchResults.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No users found</p>
            ) : (
              <div className="space-y-2">
                {searchResults.map((user: any) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatarUrl || "https://randomuser.me/api/portraits/women/44.jpg"}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">@{user.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => openAssignModal(user)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      <i className="fas fa-user-plus mr-1"></i>
                      Assign Role
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Current Assignments */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Current Role Assignments</h3>
          <p className="text-sm text-gray-600 mb-4">
            View and manage all user role assignments across the platform
          </p>
          <p className="text-sm text-gray-500">
            <i className="fas fa-info-circle mr-1"></i>
            Search for a user above to assign them a role
          </p>
        </div>
      </div>

      {/* Assign Role Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Assign Role</h3>

            {selectedUser && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Assigning role to:</p>
                <p className="font-medium">{selectedUser.name}</p>
                <p className="text-sm text-gray-600">@{selectedUser.username}</p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Role
              </label>
              <select
                value={selectedRole || ""}
                onChange={(e) => setSelectedRole(e.target.value as Id<"moderationRoles">)}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="">Choose a role...</option>
                {roles?.map((role: any) => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleAssignRole}
                disabled={!selectedRole}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Assign Role
              </button>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedUser(null);
                  setSelectedRole(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
