import { useState } from "react";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface CommentSectionProps {
  contentType: "article" | "reel";
  contentId: Id<"articles"> | Id<"reels">;
  onBack: () => void;
}

export function CommentSection({ contentType, contentId, onBack }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useConvexAuth();

  const addComment = useMutation(
    contentType === "article" 
      ? api.engagement.commentArticle 
      : api.engagement.commentReel
  );
  
  const comments = useQuery(
    contentType === "article" 
      ? api.engagement.getArticleComments 
      : api.engagement.getReelComments,
    contentType === "article" 
      ? { articleId: contentId as Id<"articles"> }
      : { reelId: contentId as Id<"reels"> }
  );

  // Server-verified access for gated content
  const hasAccess = contentType === "article"
    ? useQuery(api.payments.hasAccess, { contentType: "article", contentId: contentId as Id<"articles"> })
    : undefined;

  // Fetch article to know if it's gated (for reels we do not gate comments per request)
  const article = contentType === "article" 
    ? useQuery(api.articles.getArticleById, { articleId: contentId as Id<"articles"> })
    : undefined;

  const isGatedArticle = contentType === "article" && article && article.isGated;
  const isAccessLoading = contentType === "article" && (hasAccess === undefined || article === undefined);
  const isBlocked = contentType === "article" && isGatedArticle && hasAccess === false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!isAuthenticated) {
      alert("Please log in to comment");
      return;
    }

    if (isBlocked) {
      alert("Unlock this article to view and participate in comments.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (contentType === "article") {
        await addComment({ 
          articleId: contentId as Id<"articles">, 
          content: newComment.trim() 
        });
      } else {
        await addComment({ 
          reelId: contentId as Id<"reels">, 
          content: newComment.trim() 
        });
      }
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
      alert("Failed to add comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  // Loading and access gates (only for gated articles)
  if (contentType === "article") {
    if (isAccessLoading) {
      return (
        <div className="bg-white min-h-screen">
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
            <button onClick={onBack} className="text-gray-600">
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <h1 className="text-lg font-semibold">Comments</h1>
            <div></div>
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
            <p className="text-gray-500">Checking access...</p>
          </div>
        </div>
      );
    }

    if (isBlocked) {
      return (
        <div className="bg-white min-h-screen">
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
            <button onClick={onBack} className="text-gray-600">
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <h1 className="text-lg font-semibold">Comments</h1>
            <div></div>
          </div>
          <div className="text-center py-12 px-6 text-gray-600">
            <i className="fas fa-lock text-4xl mb-4 text-accent"></i>
            <p className="mb-2">Comments are available to readers who unlocked this article.</p>
            <p className="text-sm">Unlock the article to join the discussion.</p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button onClick={onBack} className="text-gray-600">
          <i className="fas fa-arrow-left text-xl"></i>
        </button>
        <h1 className="text-lg font-semibold">
          Comments 
          {comments !== undefined && (
            <span className="text-sm text-gray-500 ml-2">({comments.length})</span>
          )}
        </h1>
        <div></div>
      </div>

      {/* Comment Form */}
      <div className="p-4 border-b border-gray-200">
        {!isAuthenticated ? (
          <div className="text-center py-4 text-gray-500">
            <i className="fas fa-lock text-2xl mb-2"></i>
            <p>Please log in to comment</p>
            <p className="text-sm mt-1">Join the conversation by signing in</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex space-x-3">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                disabled={isSubmitting}
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting || isBlocked}
                className={`px-4 py-2 rounded-lg font-medium ${
                  newComment.trim() && !isSubmitting && !isBlocked
                    ? 'bg-accent text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {newComment.length}/500 characters
              </p>
              <p className="text-xs text-gray-500">
                Press Enter to post
              </p>
            </div>
          </form>
        )}
      </div>

      {/* Comments List */}
      <div className="p-4">
        {comments === undefined ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
            <p className="text-gray-500">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-comment text-4xl mb-4 opacity-50"></i>
            <p>No comments yet</p>
            <p className="text-sm">
              {isAuthenticated ? 'Be the first to comment!' : 'Log in to be the first to comment!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {isSubmitting && (
              <div className="flex items-center space-x-3">
                <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full"></div>
                <span className="text-sm text-gray-500">Posting comment...</span>
              </div>
            )}
            {comments.map((comment) => (
              <CommentItem key={comment._id} comment={comment} formatTimeAgo={formatTimeAgo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CommentItem({ comment, formatTimeAgo }: { 
  comment: any; 
  formatTimeAgo: (timestamp: number) => string; 
}) {
  const avatarUrl = useQuery(
    api.files.getFileUrl,
    comment.author.avatar ? { storageId: comment.author.avatar } : "skip"
  );

  return (
    <div className="flex space-x-3">
      <img 
        src={avatarUrl || "https://randomuser.me/api/portraits/women/44.jpg"} 
        alt="Author" 
        className="w-8 h-8 rounded-full flex-shrink-0 object-cover" 
      />
      <div className="flex-1">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-sm">
              {comment.author.username || comment.author.name}
            </span>
            <span className="text-xs text-gray-500">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-800">{comment.content}</p>
        </div>
      </div>
    </div>
  );
}
