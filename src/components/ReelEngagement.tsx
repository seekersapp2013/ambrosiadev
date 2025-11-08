import { useState } from "react";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { getFullReelUrl } from "../utils/router";

interface ReelEngagementProps {
  reel: {
    _id: Id<"reels">;
    caption?: string;
    author: {
      id?: Id<"users">;
      name?: string;
      username?: string;
      avatar?: string;
    };
    isGated?: boolean;
  };
  onNavigate?: (screen: string, data?: any) => void;
  disabled?: boolean;
  hasAccess?: boolean;
}

export function ReelEngagement({ reel, onNavigate, disabled = false, hasAccess }: ReelEngagementProps) {
  const { isAuthenticated } = useConvexAuth();
  const [showShare, setShowShare] = useState(false);
  
  const likeReel = useMutation(api.engagement.likeReel);
  const bookmarkReel = useMutation(api.engagement.bookmarkReel);
  const startChat = useMutation(api.chat.startChatWithAuthor);
  
  // Get like and bookmark status from database
  const isLiked = useQuery(api.engagement.isLiked, { 
    contentType: "reel", 
    contentId: reel._id 
  });
  const isBookmarked = useQuery(api.engagement.isBookmarked, { 
    contentType: "reel", 
    contentId: reel._id 
  });
  const likeCount = useQuery(api.engagement.getReelLikeCount, { reelId: reel._id });

  // Get author avatar URL
  const authorAvatarUrl = useQuery(
    api.files.getFileUrl,
    reel.author.avatar ? { storageId: reel.author.avatar } : "skip"
  );

  const handleLike = async () => {
    try {
      if (!isAuthenticated || disabled) {
        alert('Please sign in to like this reel.');
        return;
      }
      if (hasAccess === undefined) return;
      if (reel.isGated && !hasAccess) {
        alert('Unlock this reel to like it.');
        return;
      }
      await likeReel({ reelId: reel._id });
    } catch (error) {
      console.error("Error liking reel:", error);
    }
  };

  const handleBookmark = async () => {
    try {
      if (!isAuthenticated || disabled) {
        alert('Please sign in to bookmark this reel.');
        return;
      }
      await bookmarkReel({ reelId: reel._id });
    } catch (error) {
      console.error("Error bookmarking reel:", error);
    }
  };

  const handleComments = () => {
    if (!isAuthenticated || disabled) {
      alert('Please sign in to view and participate in comments.');
      return;
    }
    if (hasAccess === undefined) return;
    if (reel.isGated && !hasAccess) {
      alert('Unlock this reel to view and participate in comments.');
      return;
    }
    onNavigate?.('reel-comments', { reelId: reel._id });
  };

  const handleChatWithAuthor = async () => {
    if (!isAuthenticated || disabled) {
      alert('Please sign in to message the author.');
      return;
    }
    
    if (!reel.author.id) {
      alert('Unable to message this author.');
      return;
    }

    try {
      const result = await startChat({
        authorId: reel.author.id,
        contentType: "reel",
        contentId: reel._id,
        initialMessage: `Hi! I saw your reel and wanted to chat.`,
      });
      
      if (result.success) {
        onNavigate?.('chat', { conversationId: result.conversationId });
      }
    } catch (error: any) {
      alert(error.message || 'Failed to start chat with author');
    }
  };

  const buildShareUrl = () => {
    const username = reel.author.username || reel.author.name || 'author';
    const url = getFullReelUrl(username, reel._id);
    console.log('Generated reel share URL:', { username, reelId: reel._id, url });
    return url;
  };

  const openShareLink = () => {
    const url = buildShareUrl();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareMessage = `Check out this reel by ${reel.author.username || reel.author.name || 'this creator'} on Ambrosia`;

  const isEngagementDisabled = disabled || !isAuthenticated;
  const isGatedAndNoAccess = reel.isGated && !hasAccess;

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Author Avatar */}
      <div className="relative">
        <img 
          src={authorAvatarUrl || "https://randomuser.me/api/portraits/women/44.jpg"} 
          alt="Author" 
          className="w-12 h-12 rounded-full border-2 border-white object-cover" 
        />
        <div className="absolute -bottom-2 -right-2 bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center">
          <i className="fas fa-plus text-xs"></i>
        </div>
      </div>

      {/* Like Button */}
      <button 
        onClick={handleLike}
        disabled={isEngagementDisabled || hasAccess === undefined || isGatedAndNoAccess}
        className={`flex flex-col items-center text-white ${
          isEngagementDisabled || isGatedAndNoAccess ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <i className={`text-3xl mb-1 ${isLiked ? 'fas fa-heart text-red-500' : 'far fa-heart'}`}></i>
        <span className="text-xs">{likeCount !== undefined ? likeCount : 0}</span>
      </button>

      {/* Comment Button */}
      <button 
        onClick={handleComments}
        disabled={isEngagementDisabled || hasAccess === undefined || isGatedAndNoAccess}
        className={`flex flex-col items-center text-white ${
          isEngagementDisabled || isGatedAndNoAccess ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <i className="far fa-comment text-3xl mb-1"></i>
        <span className="text-xs">Comment</span>
      </button>

      {/* Chat with Author Button */}
      <button 
        onClick={handleChatWithAuthor}
        disabled={isEngagementDisabled}
        title="Message author"
        className={`flex flex-col items-center text-white ${
          isEngagementDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-400'
        }`}
      >
        <i className="far fa-envelope text-3xl mb-1"></i>
        <span className="text-xs">Message</span>
      </button>

      {/* Bookmark Button */}
      <button 
        onClick={handleBookmark}
        disabled={isEngagementDisabled}
        className={`flex flex-col items-center text-white ${
          isEngagementDisabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <i className={`text-3xl ${isBookmarked ? 'fas fa-bookmark text-accent' : 'far fa-bookmark'}`}></i>
      </button>

      {/* Share Button */}
      <div className="relative">
        <button 
          className="flex flex-col items-center text-white"
          onClick={() => setShowShare((s) => !s)}
          title="Share"
        >
          <i className="far fa-paper-plane text-3xl"></i>
        </button>
        {showShare && (
          <div className="absolute z-20 right-0 bottom-full mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64">
            <p className="text-sm font-medium mb-2 text-gray-800">Share this reel</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <button onClick={openShareLink} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-800">Open Link</button>
              <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(buildShareUrl())}`, '_blank', 'noopener,noreferrer')} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-800">X</button>
              <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(buildShareUrl())}`, '_blank', 'noopener,noreferrer')} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-800">Facebook</button>
              <button onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(buildShareUrl())}`, '_blank', 'noopener,noreferrer')} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-800">LinkedIn</button>
              <button onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage + ' ' + buildShareUrl())}`, '_blank', 'noopener,noreferrer')} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-800">WhatsApp</button>
              <button onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(buildShareUrl())}&text=${encodeURIComponent(shareMessage)}`, '_blank', 'noopener,noreferrer')} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-800">Telegram</button>
              <button onClick={() => { navigator.clipboard.writeText(buildShareUrl()); }} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-800">Copy Link</button>
            </div>
            <textarea readOnly className="w-full text-xs border border-gray-200 rounded p-2 bg-gray-50 text-gray-800" rows={2} value={`${shareMessage}\n${buildShareUrl()}`} />
          </div>
        )}
      </div>

    </div>
  );
}