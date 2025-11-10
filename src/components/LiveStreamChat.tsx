import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface LiveStreamChatProps {
  streamId: Id<"bookings">;
  onClose: () => void;
}

export function LiveStreamChat({ streamId, onClose }: LiveStreamChatProps) {
  const { isAuthenticated } = useConvexAuth();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addComment = useMutation(api.streamComments.addStreamComment);
  const comments = useQuery(api.streamComments.getStreamComments, { streamId });
  const commentCount = useQuery(api.streamComments.getStreamCommentCount, { streamId });

  // Auto-scroll to bottom when new comments arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert("Please sign in to comment");
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await addComment({
        streamId,
        content: newComment.trim(),
      });
      setNewComment("");
    } catch (error: any) {
      alert(error.message || "Failed to send comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAvatarUrl = (avatar?: string) => {
    if (!avatar) return "https://randomuser.me/api/portraits/women/44.jpg";
    // For now, return a placeholder - individual avatar URLs would need separate queries
    return "https://randomuser.me/api/portraits/women/44.jpg";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <i className="fas fa-comments text-blue-500"></i>
            <h3 className="font-semibold text-gray-900">Live Chat</h3>
            <span className="text-sm text-gray-500">
              ({commentCount || 0})
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!comments || comments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <i className="fas fa-comments text-4xl mb-2 opacity-50"></i>
              <p>No messages yet</p>
              <p className="text-sm">Be the first to say something!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="flex space-x-3">
                <img
                  src={getAvatarUrl(comment.author.avatar)}
                  alt={comment.author.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm text-gray-900">
                      {comment.author.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          {!isAuthenticated ? (
            <div className="text-center text-gray-500 py-2">
              <p className="text-sm">Sign in to join the conversation</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={500}
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-paper-plane"></i>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}