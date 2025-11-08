import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface ChatListProps {
  onSelectConversation: (conversationId: Id<"chatConversations">) => void;
}

export function ChatList({ onSelectConversation }: ChatListProps) {
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const conversations = useQuery(api.chats.getUserConversations);
  const searchResults = useQuery(
    api.profiles.searchProfiles,
    searchQuery.trim() ? { query: searchQuery.trim() } : "skip"
  );
  const createOrGetConversation = useMutation(api.chats.createOrGetConversation);

  const handleStartChat = async (userId: Id<"users">) => {
    try {
      const conversationId = await createOrGetConversation({ otherUserId: userId });
      onSelectConversation(conversationId);
      setShowNewChat(false);
      setSearchQuery("");
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return new Date(timestamp).toLocaleDateString();
    }
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const getLastMessagePreview = (lastMessage: any) => {
    if (!lastMessage) return "No messages yet";

    switch (lastMessage.messageType) {
      case "text":
        return lastMessage.content.length > 50
          ? `${lastMessage.content.substring(0, 50)}...`
          : lastMessage.content;
      case "image":
        return "=� Photo";
      case "emoji":
        return lastMessage.content;
      default:
        return "Message";
    }
  };

  if (conversations === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
        <p className="text-gray-500">Loading conversations...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 rounded-full border-2 border-gray-300 mb-4 flex items-center justify-center">
          <i className="fas fa-comments text-2xl text-gray-400"></i>
        </div>
        <h3 className="font-bold text-xl mb-2 text-gray-700">No Conversations Yet</h3>
        <p className="text-gray-500 text-center max-w-xs mb-6">
          Start chatting with people by searching for them below.
        </p>
        <button
          onClick={() => setShowNewChat(true)}
          className="bg-accent text-white px-6 py-2 rounded-lg font-medium hover:bg-accent/90 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>
          Start New Chat
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          <button
            onClick={() => setShowNewChat(true)}
            className="text-accent hover:text-accent/80 transition-colors"
            title="Start new chat"
          >
            <i className="fas fa-plus text-xl"></i>
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {conversations.map((conversation) => {
          const otherUser = conversation.otherUser;

          return (
            <ConversationItem
              key={conversation._id}
              conversation={conversation}
              otherUser={otherUser}
              onSelect={() => onSelectConversation(conversation._id)}
              formatTime={formatTime}
              getLastMessagePreview={getLastMessagePreview}
            />
          );
        })}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Start New Chat</h3>
              <button
                onClick={() => {
                  setShowNewChat(false);
                  setSearchQuery("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="p-4">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search by username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-100 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-accent"
                  autoFocus
                />
                <i className="fas fa-search absolute left-3 top-2.5 text-gray-500"></i>
              </div>

              <div className="max-h-48 overflow-y-auto">
                {searchQuery.trim() && searchResults === undefined && (
                  <div className="text-center py-4">
                    <div className="animate-spin w-5 h-5 border-2 border-accent border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Searching...</p>
                  </div>
                )}

                {searchQuery.trim() && searchResults && searchResults.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No users found</p>
                  </div>
                )}

                {searchResults && searchResults.map((profile: any) => (
                  <div
                    key={profile._id}
                    onClick={() => handleStartChat(profile.userId)}
                    className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <img
                      src={profile.avatarUrl || "https://randomuser.me/api/portraits/women/44.jpg"}
                      alt="User"
                      className="w-10 h-10 rounded-full object-cover mr-3"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{profile.name}</h4>
                      <p className="text-sm text-gray-500">@{profile.username}</p>
                    </div>
                  </div>
                ))}

                {!searchQuery.trim() && (
                  <div className="text-center py-8">
                    <i className="fas fa-search text-3xl text-gray-300 mb-3"></i>
                    <p className="text-sm text-gray-500">Type a username to search for people</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for individual conversation items
function ConversationItem({
  conversation,
  otherUser,
  onSelect,
  formatTime,
  getLastMessagePreview,
}: {
  conversation: any;
  otherUser: any;
  onSelect: () => void;
  formatTime: (timestamp: number) => string;
  getLastMessagePreview: (lastMessage: any) => string;
}) {
  const avatarUrl = useQuery(
    api.files.getFileUrl,
    otherUser.profile?.avatar ? { storageId: otherUser.profile.avatar } : "skip"
  );

  return (
    <div
      onClick={onSelect}
      className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="relative mr-3">
        <img
          src={avatarUrl || "https://randomuser.me/api/portraits/women/44.jpg"}
          alt="User"
          className="w-12 h-12 rounded-full object-cover"
        />
        {conversation.unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-gray-900 truncate">
            {otherUser.profile?.name || otherUser.user?.name || "User"}
          </h4>
          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
            {formatTime(conversation.lastActivity)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p
            className={`text-sm truncate ${
              conversation.unreadCount > 0 ? "font-medium text-gray-900" : "text-gray-600"
            }`}
          >
            {getLastMessagePreview(conversation.lastMessage)}
          </p>
        </div>

        {otherUser.profile?.username && (
          <p className="text-xs text-gray-500 mt-1">@{otherUser.profile.username}</p>
        )}
      </div>
    </div>
  );
}