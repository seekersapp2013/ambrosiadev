import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface CircleSettingsViewProps {
  circleId: Id<'circles'>;
  onBack?: () => void;
  onDeleted?: () => void;
}

export function CircleSettingsView({ circleId, onBack, onDeleted }: CircleSettingsViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const circle = useQuery(api.circles.getCircleById, { circleId });
  const updateCircle = useMutation(api.circles.updateCircle);
  const deleteCircle = useMutation(api.circles.deleteCircle);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'PUBLIC' as 'PUBLIC' | 'PRIVATE',
    maxMembers: '',
    tags: '',
    postingPermission: 'EVERYONE' as 'EVERYONE' | 'ADMINS_ONLY',
  });

  // Initialize form when circle loads
  useState(() => {
    if (circle) {
      setFormData({
        name: circle.name,
        description: circle.description,
        type: circle.type as 'PUBLIC' | 'PRIVATE',
        maxMembers: circle.maxMembers?.toString() || '',
        tags: circle.tags?.join(', ') || '',
        postingPermission: circle.postingPermission as 'EVERYONE' | 'ADMINS_ONLY',
      });
    }
  });

  const handleSave = async () => {
    if (!circle) return;

    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await updateCircle({
        circleId,
        name: formData.name,
        description: formData.description,
        maxMembers: formData.maxMembers ? parseInt(formData.maxMembers) : undefined,
        tags: tags.length > 0 ? tags : undefined,
        postingPermission: formData.postingPermission,
      });

      setIsEditing(false);
      alert('Circle settings updated successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to update circle');
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== circle?.name) {
      alert('Circle name does not match. Please type the exact name to confirm deletion.');
      return;
    }

    try {
      await deleteCircle({ circleId });
      alert('Circle deleted successfully');
      onDeleted?.();
    } catch (error: any) {
      alert(error.message || 'Failed to delete circle');
    }
  };

  if (circle === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <i className="fas fa-exclamation-circle text-6xl text-gray-300 mb-4"></i>
        <h3 className="text-lg font-medium text-gray-800 mb-2">Circle not found</h3>
        {onBack && (
          <button onClick={onBack} className="text-accent hover:underline">
            ← Go Back
          </button>
        )}
      </div>
    );
  }

  const isCreator = circle.membership?.role === 'CREATOR';
  const isAdmin = circle.membership && ['CREATOR', 'ADMIN'].includes(circle.membership.role);

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <i className="fas fa-lock text-6xl text-gray-300 mb-4"></i>
        <h3 className="text-lg font-medium text-gray-800 mb-2">Access Denied</h3>
        <p className="text-gray-600 mb-6">Only admins can access circle settings</p>
        {onBack && (
          <button onClick={onBack} className="text-accent hover:underline">
            ← Go Back
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
                <i className="fas fa-arrow-left text-xl"></i>
              </button>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">Circle Settings</h1>
              <p className="text-sm text-gray-600">{circle.name}</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
              >
                <i className="fas fa-edit mr-2"></i>
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
          
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Circle Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Members (Optional)
                </label>
                <input
                  type="number"
                  value={formData.maxMembers}
                  onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
                  placeholder="Leave empty for unlimited"
                  min={circle.currentMembers}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current members: {circle.currentMembers}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (Optional)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., health, wellness, support (comma-separated)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-gray-800 font-medium">{circle.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-gray-800">{circle.description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Members</p>
                <p className="text-gray-800">
                  {circle.currentMembers}
                  {circle.maxMembers && ` / ${circle.maxMembers}`}
                </p>
              </div>
              {circle.tags && circle.tags.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {circle.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Circle Type - Read Only */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Circle Type</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Visibility</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-3 py-1 text-sm rounded-full ${
                  circle.type === 'PUBLIC' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  <i className={`fas ${circle.type === 'PUBLIC' ? 'fa-globe' : 'fa-lock'} mr-1`}></i>
                  {circle.type}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ⚠️ Circle type cannot be changed after creation
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Access</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-3 py-1 text-sm rounded-full ${
                  circle.accessType === 'FREE' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {circle.accessType === 'FREE' ? 'Free' : `${circle.price} ${circle.priceCurrency}`}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ⚠️ Access type cannot be changed after creation
              </p>
            </div>
          </div>
        </div>

        {/* Posting Permissions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Posting Permissions</h2>
          
          {isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, postingPermission: 'EVERYONE' })}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  formData.postingPermission === 'EVERYONE'
                    ? 'border-accent bg-accent/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <i className="fas fa-users text-lg mr-2"></i>
                  <span className="font-semibold">Everyone</span>
                </div>
                <p className="text-xs text-gray-600">All members can post</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, postingPermission: 'ADMINS_ONLY' })}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  formData.postingPermission === 'ADMINS_ONLY'
                    ? 'border-accent bg-accent/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <i className="fas fa-shield-alt text-lg mr-2"></i>
                  <span className="font-semibold">Admins Only</span>
                </div>
                <p className="text-xs text-gray-600">Only admins can post</p>
              </button>
            </div>
          ) : (
            <div>
              <span className={`inline-block px-4 py-2 rounded-lg ${
                circle.postingPermission === 'EVERYONE'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-orange-100 text-orange-800'
              }`}>
                <i className={`fas ${
                  circle.postingPermission === 'EVERYONE' ? 'fa-users' : 'fa-shield-alt'
                } mr-2`}></i>
                {circle.postingPermission === 'EVERYONE' ? 'Everyone can post' : 'Admins only'}
              </span>
            </div>
          )}
        </div>

        {/* Invite Code (for private circles) */}
        {circle.type === 'PRIVATE' && circle.inviteCode && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-purple-900 mb-4">Invite Code</h2>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-2 bg-white border border-purple-300 rounded text-purple-900 font-mono">
                {circle.inviteCode}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(circle.inviteCode!);
                  alert('Invite code copied!');
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                <i className="fas fa-copy"></i>
              </button>
            </div>
            <p className="text-xs text-purple-700 mt-2">
              Share this code with people you want to invite to this private circle
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-4">
            <button
              onClick={() => {
                setIsEditing(false);
                // Reset form
                if (circle) {
                  setFormData({
                    name: circle.name,
                    description: circle.description,
                    type: circle.type as 'PUBLIC' | 'PRIVATE',
                    maxMembers: circle.maxMembers?.toString() || '',
                    tags: circle.tags?.join(', ') || '',
                    postingPermission: circle.postingPermission as 'EVERYONE' | 'ADMINS_ONLY',
                  });
                }
              }}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90"
            >
              Save Changes
            </button>
          </div>
        )}

        {/* Danger Zone - Only for Creator */}
        {isCreator && !isEditing && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h2>
            <p className="text-sm text-red-700 mb-4">
              Once you delete a circle, there is no going back. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <i className="fas fa-trash mr-2"></i>
              Delete Circle
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Delete Circle</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-3">
                This will permanently delete the circle, all messages, and remove all members.
              </p>
              <p className="text-sm text-gray-700 mb-3">
                To confirm, please type the circle name: <strong>{circle.name}</strong>
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type circle name to confirm"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText !== circle.name}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
