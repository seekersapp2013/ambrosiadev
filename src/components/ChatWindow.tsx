import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface ChatWindowProps {
  conversationId: Id<"chatConversations">;
  onBack: () => void;
}

export function ChatWindow({ conversationId, onBack }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("");
  const [messageType, setMessageType] = useState<"text" | "image" | "emoji">("text");
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const conversation = useQuery(api.chats.getConversation, { conversationId });
  const messages = useQuery(api.chats.getConversationMessages, {
    conversationId,
    paginationOpts: { numItems: 100 }
  });

  const sendMessage = useMutation(api.chats.sendMessage);
  const markAsRead = useMutation(api.chats.markMessagesAsRead);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  // Get avatar URL for other user
  const otherUserAvatarUrl = useQuery(
    api.files.getFileUrl,
    conversation?.otherUser.profile?.avatar ? { storageId: conversation.otherUser.profile.avatar } : "skip"
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.page]);

  // Mark messages as read when conversation opens
  useEffect(() => {
    if (conversationId) {
      markAsRead({ conversationId });
    }
  }, [conversationId, markAsRead]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId) return;

    try {
      await sendMessage({
        conversationId,
        messageType,
        content: newMessage.trim()
      });
      setNewMessage("");
      setMessageType("text");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !conversationId) return;

    setIsUploading(true);

    try {
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB");
      }

      if (!file.type.startsWith("image/")) {
        throw new Error("File must be an image");
      }

      // Upload file
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await result.json();

      // Send image message
      await sendMessage({
        conversationId,
        messageType: "image",
        content: storageId
      });

    } catch (error) {
      console.error("Error uploading image:", error);
      alert(`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const otherUser = conversation.otherUser;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="mr-3 p-2 hover:bg-gray-100 rounded-full"
        >
          <i className="fas fa-arrow-left text-gray-600"></i>
        </button>

        <img
          src={otherUserAvatarUrl || "https://randomuser.me/api/portraits/women/44.jpg"}
          alt="User"
          className="w-10 h-10 rounded-full object-cover mr-3"
        />

        <div>
          <h3 className="font-medium">{otherUser.profile?.name || otherUser.user?.name || "User"}</h3>
          {otherUser.profile?.username && (
            <p className="text-sm text-gray-600">@{otherUser.profile.username}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages?.page?.map((message) => {
          const isOwnMessage = message.senderId === conversation.otherUser._id ? false : true;

          return (
            <div
              key={message._id}
              className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? "order-2" : "order-1"}`}>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? "bg-accent text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {message.messageType === "text" && (
                    <p className="text-sm">{message.content}</p>
                  )}

                  {message.messageType === "image" && (
                    <ImageMessage storageId={message.content} />
                  )}

                  {message.messageType === "emoji" && (
                    <p className="text-2xl">{message.content}</p>
                  )}
                </div>

                <p className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? "text-right" : "text-left"}`}>
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            {isUploading ? (
              <div className="animate-spin w-4 h-4 border border-gray-400 border-t-transparent rounded-full"></div>
            ) : (
              <i className="fas fa-image text-gray-600"></i>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-transparent outline-none text-sm"
            />

            <button
              onClick={() => setMessageType(messageType === "emoji" ? "text" : "emoji")}
              className="ml-2 p-1 hover:bg-gray-200 rounded"
            >
              <i className="fas fa-smile text-gray-600"></i>
            </button>
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-accent text-white rounded-full hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>

        {messageType === "emoji" && (
          <div className="mt-2 p-2 bg-gray-50 rounded-lg">
            <div className="flex flex-wrap gap-2">
              {["😀", "😂", "❤️", "👍", "😢", "😡", "🙏", "🔥", "🎉", "💯"].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setNewMessage(emoji);
                    setMessageType("emoji");
                  }}
                  className="text-xl p-1 hover:bg-gray-200 rounded"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for image messages
function ImageMessage({ storageId }: { storageId: string }) {
  const imageUrl = useQuery(api.files.getFileUrl, { storageId });

  if (!imageUrl) {
    return (
      <div className="w-48 h-32 bg-gray-200 rounded flex items-center justify-center">
        <div className="animate-spin w-4 h-4 border border-gray-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt="Sent image"
      className="max-w-48 max-h-64 rounded object-cover"
    />
  );
}