import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import "./LiveStreamComments.css";

interface LiveStreamCommentsProps {
  streamId: Id<"bookings">;
  className?: string;
}

export function LiveStreamComments({ streamId, className = "" }: LiveStreamCommentsProps) {
  const { isAuthenticated } = useConvexAuth();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addComment = useMutation(api.streamComments.addStreamComment);
  const comments = useQuery(api.streamComments.getStreamComments, { streamId });
  const commentCount = useQuery(api.streamComments.getStreamCommentCount, { streamId });

  // Auto-scroll to bottom when new comments arrive
  useEffect(() => {
    if (showComments) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments, showComments]);

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
    return "https://randomuser.me/api/portraits/women/44.jpg";
  };

  return (
    <div className={`bg-black/80 backdrop-blur-sm rounded-lg live-stream-comments ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/20">
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 text-white hover:text-blue-400"
        >
          <i className="fas fa-comments"></i>
          <span className="font-medium">Live Chat</span>
          <span className="text-sm text-gray-300">
            ({commentCount || 0})
          </span>
          <i className={`fas fa-chevron-${showComments ? 'up' : 'down'} text-sm`}></i>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <>
          {/* Messages */}
          <div className="max-h-64 overflow-y-auto p-3 space-y-2">
            {!comments || comments.length === 0 ? (
              <div className="text-center text-gray-400 py-4">
                <i className="fas fa-comments text-2xl mb-2 opacity-50"></i>
                <p className="text-sm">No messages yet</p>
                <p className="text-xs">Be the first to say something!</p>
              </div>
            ) : (
              comments.slice(-20).map((comment) => (
                <div key={comment._id} className="flex space-x-2 text-sm comment-item">
                  <img
                    src={getAvatarUrl(comment.author.avatar)}
                    alt={comment.author.name}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-white text-xs">
                        {comment.author.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-200 text-xs mt-1 break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/20 p-3">
            {!isAuthenticated ? (
              <div className="text-center text-gray-400 py-2">
                <p className="text-xs">Sign in to join the conversation</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  maxLength={500}
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="px-3 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <i className="fas fa-spinner fa-spin text-sm"></i>
                  ) : (
                    <i className="fas fa-paper-plane text-sm"></i>
                  )}
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}