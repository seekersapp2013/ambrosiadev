import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import "./LiveStreamOverlayComments.css";

interface LiveStreamOverlayCommentsProps {
  streamId: Id<"bookings">;
}

interface Comment {
  _id: Id<"streamComments">;
  content: string;
  createdAt: number;
  author: {
    _id: Id<"users">;
    name: string;
    username: string;
    avatar?: string;
  };
}

export function LiveStreamOverlayComments({ streamId }: LiveStreamOverlayCommentsProps) {
  const { isAuthenticated } = useConvexAuth();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibleComments, setVisibleComments] = useState<Comment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const addComment = useMutation(api.streamComments.addStreamComment);
  const comments = useQuery(api.streamComments.getStreamComments, { streamId });

  // Auto-scroll to bottom and manage visible comments
  useEffect(() => {
    if (comments && comments.length > 0) {
      // Show only the last 4 comments for overlay (like Instagram Live)
      const recentComments = comments.slice(-4);
      setVisibleComments(recentComments);
      
      // Auto-scroll to bottom with a slight delay for animation
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
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

  const getAvatarUrl = (avatar?: string) => {
    if (!avatar) return "https://randomuser.me/api/portraits/women/44.jpg";
    return "https://randomuser.me/api/portraits/women/44.jpg";
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-15">
      {/* Comments Overlay - Instagram/Facebook Live Style */}
      <div 
        ref={containerRef}
        className="flex flex-col justify-end min-h-80 max-h-80 overflow-hidden p-4 pb-24"
      >
        <div className="space-y-3 flex flex-col justify-end">
          {visibleComments.map((comment, index) => (
            <div
              key={comment._id}
              className="flex items-start space-x-2 comment-bubble"
              style={{
                animationDelay: `${index * 0.15}s`,
                animationFillMode: 'both'
              }}
            >
              <img
                src={getAvatarUrl(comment.author.avatar)}
                alt={comment.author.name}
                className="w-7 h-7 rounded-full object-cover flex-shrink-0 border-2 border-white/50 shadow-sm"
              />
              <div className="bg-black/75 backdrop-blur-md rounded-2xl px-4 py-2.5 max-w-xs shadow-xl border border-white/10">
                <div className="flex items-center space-x-1 mb-1">
                  <span className="font-semibold text-white text-sm">
                    {comment.author.name}
                  </span>
                </div>
                <p className="text-white text-sm break-words leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Comment Input - Fixed at bottom */}
      <div className="comment-gradient p-4 pointer-events-auto">
        {!isAuthenticated ? (
          <div className="text-center">
            <p className="text-white/80 text-sm">Sign in to join the conversation</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt="Your avatar"
              className="w-9 h-9 rounded-full object-cover flex-shrink-0 border-2 border-white/40"
            />
            <div className="flex-1 relative">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="comment-input w-full px-5 py-3 bg-white/15 border border-white/25 rounded-full text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/40 text-sm transition-all duration-200"
                maxLength={500}
                disabled={isSubmitting}
              />
              {newComment.trim() && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="send-button absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-lg"
                >
                  {isSubmitting ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    "Send"
                  )}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}