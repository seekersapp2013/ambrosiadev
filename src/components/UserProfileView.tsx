import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface UserProfileViewProps {
  username: string;
  onStartChat?: (conversationId: Id<"chatConversations">) => void;
}

export function UserProfileView({ username, onStartChat }: UserProfileViewProps) {
  const [isStartingChat, setIsStartingChat] = useState(false);

  const profile = useQuery(api.profiles.getProfileByUsername, { username });
  const createOrGetConversation = useMutation(api.chats.createOrGetConversation);

  // Get avatar URL
  const avatarUrl = useQuery(
    api.files.getFileUrl,
    profile?.avatar ? { storageId: profile.avatar } : "skip"
  );

  const handleStartChat = async () => {
    if (!profile?.userId) return;

    setIsStartingChat(true);
    try {
      const conversationId = await createOrGetConversation({
        otherUserId: profile.userId
      });

      if (onStartChat) {
        onStartChat(conversationId);
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      alert("Failed to start chat. Please try again.");
    } finally {
      setIsStartingChat(false);
    }
  };

  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 rounded-full border-2 border-gray-300 mb-4 flex items-center justify-center">
          <i className="fas fa-user text-2xl text-gray-400"></i>
        </div>
        <h3 className="font-bold text-xl mb-2 text-gray-700">User Not Found</h3>
        <p className="text-gray-500 text-center max-w-xs">
          The user @{username} could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="p-4">
        {/* Profile Header */}
        <div className="flex items-center mb-6">
          <div className="mr-6">
            <img
              src={avatarUrl || "https://randomuser.me/api/portraits/women/44.jpg"}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
            />
          </div>
          <div className="flex-1 flex justify-between">
            <div className="text-center">
              <div className="font-bold">{profile.stats?.articles || 0}</div>
              <div className="text-xs text-gray-500">Posts</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{profile.stats?.followers || 0}</div>
              <div className="text-xs text-gray-500">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{profile.stats?.following || 0}</div>
              <div className="text-xs text-gray-500">Following</div>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="mb-6">
          <h2 className="font-bold">{profile.name || profile.username}</h2>
          <p className="text-sm text-gray-600 mb-2">@{profile.username}</p>
          {profile.bio && <p className="text-sm mb-2">{profile.bio}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex mb-6 space-x-3">
          <button className="flex-1 bg-gray-100 py-2 rounded-lg text-sm font-medium">
            Follow
          </button>
          <button
            onClick={handleStartChat}
            disabled={isStartingChat}
            className="flex-1 bg-accent text-white py-2 rounded-lg text-sm font-medium hover:bg-accent-dark disabled:opacity-50 flex items-center justify-center"
          >
            {isStartingChat ? (
              <div className="animate-spin w-4 h-4 border border-white border-t-transparent rounded-full mr-2"></div>
            ) : (
              <i className="fas fa-comment mr-2"></i>
            )}
            Message
          </button>
        </div>

        {/* Content Tabs */}
        <div className="border-t border-gray-200 pt-3">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full border-2 border-gray-300 mb-4 flex items-center justify-center mx-auto">
              <i className="fas fa-th-large text-2xl text-gray-400"></i>
            </div>
            <p className="text-gray-500">No posts yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}