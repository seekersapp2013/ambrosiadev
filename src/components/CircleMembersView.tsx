import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface CircleMembersViewProps {
  circleId: Id<'circles'>;
  onBack?: () => void;
}

export function CircleMembersView({ circleId, onBack }: CircleMembersViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const circle = useQuery(api.circles.getCircleById, { circleId });
  
  // Only fetch members if user is a member
  const members = useQuery(
    circle?.isMember ? api.circleMembers.getCircleMembers : "skip",
    circle?.isMember ? { circleId, limit: 100 } : "skip"
  );

  const updateMemberRole = useMutation(api.circleMembers.updateMemberRole);
  const removeMember = useMutation(api.circleMembers.removeMember);
  const banMember = useMutation(api.circleMembers.banMember);

  const handleUpdateRole = async (memberId: Id<'users'>, newRole: string) => {
    if (!confirm(`Change member role to ${newRole}?`)) return;
    try {
      await updateMemberRole({ circleId, memberId, newRole });
      setSelectedMember(null);
    } catch (error: any) {
      alert(error.message || 'Failed to update role');
    }
  };

  const handleRemoveMember = async (memberId: Id<'users'>) => {
    if (!confirm('Remove this member from the circle?')) return;
    try {
      await removeMember({ circleId, memberId });
      setSelectedMember(null);
    } catch (error: any) {
      alert(error.message || 'Failed to remove member');
    }
  };

  const handleBanMember = async (memberId: Id<'users'>) => {
    if (!confirm('Ban this member from the circle? They will not be able to rejoin.')) return;
    try {
      await banMember({ circleId, memberId });
      setSelectedMember(null);
    } catch (error: any) {
      alert(error.message || 'Failed to ban member');
    }
  };

  if (circle === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!circle || !circle.isMember) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <i className="fas fa-lock text-6xl text-gray-300 mb-4"></i>
        <h3 className="text-lg font-medium text-gray-800 mb-2">Access Denied</h3>
        <p className="text-gray-600">You must be a member to view circle members</p>
      </div>
    );
  }

  if (members === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const isAdmin = circle.membership && ['CREATOR', 'ADMIN'].includes(circle.membership.role);

  const filteredMembers = members.members.filter(member =>
    member.profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.profile.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h1 className="text-2xl font-bold text-gray-800">Members</h1>
              <p className="text-sm text-gray-600">{circle.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <i className="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
          </div>
        </div>

        {/* Member Count */}
        <div className="mb-4 text-sm text-gray-600">
          {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
        </div>

        {/* Members List */}
        <div className="space-y-3">
          {filteredMembers.map((member) => (
            <div
              key={member._id}
              className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
                  {member.profile.avatar ? (
                    <img
                      src={member.profile.avatar}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <i className="fas fa-user text-gray-400"></i>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {member.profile.name || member.profile.username}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                      member.role === 'CREATOR' ? 'bg-purple-100 text-purple-800' :
                      member.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                      member.role === 'MODERATOR' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {member.role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">@{member.profile.username}</p>
                  {member.profile.bio && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{member.profile.bio}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                {isAdmin && member.role !== 'CREATOR' && (
                  <button
                    onClick={() => setSelectedMember(member)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <i className="fas fa-ellipsis-v"></i>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-users text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No members found</h3>
            <p className="text-gray-600">Try adjusting your search</p>
          </div>
        )}
      </div>

      {/* Member Actions Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                {selectedMember.profile.avatar ? (
                  <img
                    src={selectedMember.profile.avatar}
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <i className="fas fa-user text-gray-400"></i>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {selectedMember.profile.name || selectedMember.profile.username}
                </h3>
                <p className="text-sm text-gray-600">@{selectedMember.profile.username}</p>
              </div>
            </div>

            <div className="space-y-2">
              {/* Change Role */}
              {selectedMember.role !== 'ADMIN' && (
                <button
                  onClick={() => handleUpdateRole(selectedMember.userId, 'ADMIN')}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <i className="fas fa-shield-alt text-blue-600 mr-3"></i>
                  <span>Make Admin</span>
                </button>
              )}
              {selectedMember.role !== 'MODERATOR' && (
                <button
                  onClick={() => handleUpdateRole(selectedMember.userId, 'MODERATOR')}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <i className="fas fa-user-shield text-green-600 mr-3"></i>
                  <span>Make Moderator</span>
                </button>
              )}
              {selectedMember.role !== 'MEMBER' && (
                <button
                  onClick={() => handleUpdateRole(selectedMember.userId, 'MEMBER')}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <i className="fas fa-user text-gray-600 mr-3"></i>
                  <span>Make Member</span>
                </button>
              )}

              {/* Remove */}
              <button
                onClick={() => handleRemoveMember(selectedMember.userId)}
                className="w-full text-left px-4 py-3 hover:bg-red-50 rounded-lg transition-colors text-red-600"
              >
                <i className="fas fa-user-minus mr-3"></i>
                <span>Remove from Circle</span>
              </button>

              {/* Ban */}
              <button
                onClick={() => handleBanMember(selectedMember.userId)}
                className="w-full text-left px-4 py-3 hover:bg-red-50 rounded-lg transition-colors text-red-600"
              >
                <i className="fas fa-ban mr-3"></i>
                <span>Ban from Circle</span>
              </button>
            </div>

            <button
              onClick={() => setSelectedMember(null)}
              className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
