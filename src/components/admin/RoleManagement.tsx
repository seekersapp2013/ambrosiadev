import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { PERMISSIONS, CONTENT_TYPES } from "../../utils/permissions";

export function RoleManagement() {
  const roles = useQuery(api.moderation.listModerationRoles);
  const createRole = useMutation(api.moderation.createModerationRole);
  const updateRole = useMutation(api.moderation.updateModerationRole);
  const deleteRole = useMutation(api.moderation.deleteModerationRole);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
    canApprove: [] as string[],
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      permissions: [],
      canApprove: [],
    });
  };

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await createRole(formData);
      alert("Role created successfully!");
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error("Error creating role:", error);
      alert(error instanceof Error ? error.message : "Failed to create role");
    }
  };

  const handleUpdate = async () => {
    if (!editingRole || !formData.name.trim() || !formData.description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await updateRole({
        roleId: editingRole._id,
        ...formData,
      });
      alert("Role updated successfully!");
      setShowEditModal(false);
      setEditingRole(null);
      resetForm();
    } catch (error) {
      console.error("Error updating role:", error);
      alert(error instanceof Error ? error.message : "Failed to update role");
    }
  };

  const handleDelete = async (roleId: Id<"moderationRoles">) => {
    if (!confirm("Are you sure you want to delete this role?")) {
      return;
    }

    try {
      await deleteRole({ roleId });
      alert("Role deleted successfully!");
    } catch (error) {
      console.error("Error deleting role:", error);
      alert(error instanceof Error ? error.message : "Failed to delete role");
    }
  };

  const openEditModal = (role: any) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      canApprove: role.canApprove,
    });
    setShowEditModal(true);
  };

  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const toggleContentType = (contentType: string) => {
    setFormData((prev) => ({
      ...prev,
      canApprove: prev.canApprove.includes(contentType)
        ? prev.canApprove.filter((c) => c !== contentType)
        : [...prev.canApprove, contentType],
    }));
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Role Management</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>
            Create Role
          </button>
        </div>

        {roles === undefined ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full"></div>
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-user-tag text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Roles Yet</h3>
            <p className="text-gray-500">Create your first moderation role</p>
          </div>
        ) : (
          <div className="space-y-4">
            {roles.map((role: any) => (
              <div
                key={role._id}
                className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-bold text-lg">{role.name}</h3>
                      {role.isSystemRole && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          System Role
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                    <p className="text-xs text-gray-500">
                      Created by {role.creator.username || role.creator.name} • {role.assignmentCount} users
                    </p>
                  </div>

                  {!role.isSystemRole && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => openEditModal(role)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="Edit role"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(role._id)}
                        className="text-red-600 hover:text-red-800 p-2"
                        title="Delete role"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Permissions:</p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map((perm: string) => (
                        <span
                          key={perm}
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
                        >
                          {perm.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Can Approve:</p>
                    <div className="flex flex-wrap gap-1">
                      {role.canApprove.map((type: string) => (
                        <span
                          key={type}
                          className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <RoleFormModal
          isEdit={showEditModal}
          formData={formData}
          onClose={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setEditingRole(null);
            resetForm();
          }}
          onSubmit={showEditModal ? handleUpdate : handleCreate}
          onNameChange={(name) => setFormData((prev) => ({ ...prev, name }))}
          onDescriptionChange={(description) => setFormData((prev) => ({ ...prev, description }))}
          togglePermission={togglePermission}
          toggleContentType={toggleContentType}
        />
      )}
    </div>
  );
}

function RoleFormModal({
  isEdit,
  formData,
  onClose,
  onSubmit,
  onNameChange,
  onDescriptionChange,
  togglePermission,
  toggleContentType,
}: {
  isEdit: boolean;
  formData: {
    name: string;
    description: string;
    permissions: string[];
    canApprove: string[];
  };
  onClose: () => void;
  onSubmit: () => void;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  togglePermission: (permission: string) => void;
  toggleContentType: (contentType: string) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
        <h3 className="text-xl font-bold mb-4">{isEdit ? "Edit Role" : "Create New Role"}</h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g., Content Moderator"
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Describe what this role does..."
              className="w-full border border-gray-300 rounded-lg p-2 min-h-[80px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PERMISSIONS).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(value)}
                    onChange={() => togglePermission(value)}
                    className="rounded"
                  />
                  <span className="text-sm">{key.replace(/_/g, " ")}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Can Approve</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(CONTENT_TYPES).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.canApprove.includes(value)}
                    onChange={() => toggleContentType(value)}
                    className="rounded"
                  />
                  <span className="text-sm">{key.replace(/_/g, " ")}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onSubmit}
            className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            {isEdit ? "Update Role" : "Create Role"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
