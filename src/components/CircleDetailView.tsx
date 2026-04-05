import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface CircleDetailViewProps {
  circleId: Id<'circles'>;
  onNavigate?: (screen: string, data?: any) => void;
  onBack?: () => void;
}

export function CircleDetailView({ circleId, onNavigate, onBack }: CircleDetailViewProps) {
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const circle = useQuery(api.circles.getCircleById, { circleId });
  
  // Only fetch members if user is a member (for preview)
  const members = useQuery(
    circle?.isMember ? api.circleMembers.getCircleMembers : "skip",
    circle?.isMember ? { circleId, limit: 10 } : "skip"
  );
  
  const joinCircle = useMutation(api.circles.joinCircle);
  const joinByInviteCode = useMutation(api.circles.joinCircleByInviteCode);

  const handleJoinCircle = async () => {
    if (!circle) return;

    setIsJoining(true);
    try {
      if (circle.type === 'PRIVATE' && circle.inviteCode) {
        await joinByInviteCode({ inviteCode: circle.inviteCode });
      } else {
        await joinCircle({ circleId });
      }
      onNavigate?.('circle-chat', { circleId });
    } catch (error: any) {
      alert(error.message || 'Failed to join circle');
    } finally {
      setIsJoining(false);
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
        <p className="text-gray-600 mb-6">This circle may be private or no longer exists</p>
        {onBack && (
          <button
            onClick={onBack}
            className="text-accent hover:underline"
          >
            ← Go Back
          </button>
        )}
      </div>
    );
  }

  const isAdmin = circle.membership && ['CREATOR', 'ADMIN', 'MODERATOR'].includes(circle.membership.role);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-800"
              >
                <i className="fas fa-arrow-left text-xl"></i>
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-800 flex-1">{circle.name}</h1>
            {isAdmin && (
              <button
                onClick={() => onNavigate?.('circle-settings', { circleId })}
                className="text-gray-600 hover:text-gray-800"
                title="Circle Settings"
              >
                <i className="fas fa-cog text-xl"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Cover Image */}
        {circle.coverImage && (
          <div className="w-full h-48 bg-gray-200 rounded-lg mb-6"></div>
        )}

        {/* Circle Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  circle.type === 'PUBLIC' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  <i className={`fas ${circle.type === 'PUBLIC' ? 'fa-globe' : 'fa-lock'} mr-1`}></i>
                  {circle.type}
                </span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  circle.accessType === 'FREE' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {circle.accessType === 'FREE' ? 'Free' : `${circle.price} ${circle.priceCurrency}`}
                </span>
              </div>
              <p className="text-gray-700 mb-4">{circle.description}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
            <div className="flex items-center">
              <i className="fas fa-users mr-2"></i>
              <span>{circle.currentMembers} members</span>
              {circle.maxMembers && <span className="text-gray-400 ml-1">/ {circle.maxMembers}</span>}
            </div>
            <div className="flex items-center">
              <i className="fas fa-calendar mr-2"></i>
              <span>Created {new Date(circle.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Tags */}
          {circle.tags && circle.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {circle.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Creator Info */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              {circle.creator.avatar ? (
                <img src={circle.creator.avatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <i className="fas fa-user text-gray-400"></i>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Created by</p>
              <p className="font-medium text-gray-800">
                {circle.creator.name || circle.creator.username}
              </p>
            </div>
          </div>

          {/* Invite Code (for private circles and admins) */}
          {circle.type === 'PRIVATE' && isAdmin && circle.inviteCode && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900 mb-1">Invite Code</p>
                  <p className="text-xs text-purple-700">Share this code with people you want to invite</p>
                </div>
                <button
                  onClick={() => setShowInviteCode(!showInviteCode)}
                  className="text-purple-700 hover:text-purple-900"
                >
                  <i className={`fas ${showInviteCode ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {showInviteCode && (
                <div className="mt-3 flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-white border border-purple-300 rounded text-purple-900 font-mono">
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
              )}
            </div>
          )}
        </div>

        {/* Members Preview */}
        {circle.isMember && members && members.members.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Members</h3>
              <button
                onClick={() => onNavigate?.('circle-members', { circleId })}
                className="text-accent hover:underline text-sm"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {members.members.slice(0, 5).map((member) => (
                <div key={member._id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {member.profile.avatar ? (
                      <img src={member.profile.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <i className="fas fa-user text-gray-400"></i>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {member.profile.name || member.profile.username}
                    </p>
                    <p className="text-xs text-gray-500">@{member.profile.username}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    member.role === 'CREATOR' ? 'bg-purple-100 text-purple-800' :
                    member.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                    member.role === 'MODERATOR' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions for Members */}
        {circle.isMember && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Circle Features</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onNavigate?.('circle-members', { circleId })}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-accent hover:bg-accent/5 transition-colors text-left"
              >
                <i className="fas fa-users text-accent text-xl mb-2"></i>
                <p className="font-medium text-gray-800">Members</p>
                <p className="text-xs text-gray-600">{circle.currentMembers} members</p>
              </button>
              <button
                onClick={() => onNavigate?.('circle-events', { circleId })}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-accent hover:bg-accent/5 transition-colors text-left"
              >
                <i className="fas fa-calendar-alt text-accent text-xl mb-2"></i>
                <p className="font-medium text-gray-800">Events</p>
                <p className="text-xs text-gray-600">Live sessions</p>
              </button>
              <button
                onClick={() => onNavigate?.('expert-requests', { circleId })}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-accent hover:bg-accent/5 transition-colors text-left"
              >
                <i className="fas fa-briefcase text-accent text-xl mb-2"></i>
                <p className="font-medium text-gray-800">Expert Requests</p>
                <p className="text-xs text-gray-600">Hire experts</p>
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="sticky bottom-4">
          {circle.isMember ? (
            <button
              onClick={() => onNavigate?.('circle-chat', { circleId })}
              className="w-full bg-accent text-white py-4 rounded-lg hover:bg-accent/90 transition-colors shadow-lg"
            >
              <i className="fas fa-comments mr-2"></i>
              Open Chat
            </button>
          ) : (
            <button
              onClick={handleJoinCircle}
              disabled={isJoining || (circle.maxMembers && circle.currentMembers >= circle.maxMembers)}
              className="w-full bg-accent text-white py-4 rounded-lg hover:bg-accent/90 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isJoining ? (
                <span className="flex items-center justify-center">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Joining...
                </span>
              ) : circle.maxMembers && circle.currentMembers >= circle.maxMembers ? (
                'Circle is Full'
              ) : circle.accessType === 'PAID' ? (
                `Join for ${circle.price} ${circle.priceCurrency}`
              ) : (
                'Join Circle'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
