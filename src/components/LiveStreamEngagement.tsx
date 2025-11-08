import { useState } from "react";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";


interface LiveStreamEngagementProps {
  booking: {
    _id: Id<"bookings">;
    title?: string;
    provider: {
      id?: Id<"users">;
      name?: string;
      username?: string;
      avatar?: string;
    };
  };
  onNavigate?: (screen: string, data?: any) => void;
  disabled?: boolean;
  isProvider?: boolean;
}

export function LiveStreamEngagement({ 
  booking, 
  onNavigate, 
  disabled = false, 
  isProvider = false 
}: LiveStreamEngagementProps) {
  const { isAuthenticated } = useConvexAuth();
  const [showShare, setShowShare] = useState(false);

  
  const likeStream = useMutation(api.engagement.likeStream);
  const bookmarkStream = useMutation(api.engagement.bookmarkStream);
  const startChat = useMutation(api.chat.startChatWithAuthor);
  
  // Get like and bookmark status from database
  const isLiked = useQuery(api.engagement.isLiked, { 
    contentType: "stream", 
    contentId: booking._id
  });
  const isBookmarked = useQuery(api.engagement.isBookmarked, { 
    contentType: "stream", 
    contentId: booking._id
  });
  const likeCount = useQuery(api.engagement.getStreamLikeCount, { streamId: booking._id });


  // Get provider avatar URL
  const providerAvatarUrl = useQuery(
    api.files.getFileUrl,
    booking.provider.avatar ? { storageId: booking.provider.avatar } : "skip"
  );

  const handleLike = async () => {
    try {
      if (!isAuthenticated || disabled) {
        alert('Please sign in to like this stream.');
        return;
      }
      await likeStream({ streamId: booking._id });
    } catch (error) {
      console.error("Error liking stream:", error);
    }
  };

  const handleBookmark = async () => {
    try {
      if (!isAuthenticated || disabled) {
        alert('Please sign in to bookmark this stream.');
        return;
      }
      await bookmarkStream({ streamId: booking._id });
    } catch (error) {
      console.error("Error bookmarking stream:", error);
    }
  };



  const handleChatWithProvider = async () => {
    if (!isAuthenticated || disabled) {
      alert('Please sign in to message the provider.');
      return;
    }
    
    if (!booking.provider.id) {
      alert('Unable to message this provider.');
      return;
    }

    try {
      const result = await startChat({
        authorId: booking.provider.id,
        contentType: "stream",
        contentId: booking._id,
        initialMessage: `Hi! I'm interested in your live stream session.`,
      });
      
      if (result.success) {
        onNavigate?.('chat', { conversationId: result.conversationId });
      }
    } catch (error: any) {
      alert(error.message || 'Failed to start chat with provider');
    }
  };

  const buildShareUrl = () => {
    const username = booking.provider.username || booking.provider.name || 'provider';
    // For now, use a generic share URL - this would need to be updated based on your routing
    const url = `${window.location.origin}/stream/${username}/${booking._id}`;
    console.log('Generated stream share URL:', { username, streamId: booking._id, url });
    return url;
  };

  const openShareLink = () => {
    const url = buildShareUrl();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareMessage = `Join this live stream by ${booking.provider.username || booking.provider.name || 'this provider'} on Ambrosia`;

  const isEngagementDisabled = disabled || !isAuthenticated;

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Provider Avatar */}
      <div className="relative">
        <img 
          src={providerAvatarUrl || "https://randomuser.me/api/portraits/women/44.jpg"} 
          alt="Provider" 
          className="w-12 h-12 rounded-full border-2 border-white object-cover" 
        />
        {!isProvider && (
          <div className="absolute -bottom-2 -right-2 bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center">
            <i className="fas fa-plus text-xs"></i>
          </div>
        )}
      </div>

      {/* Like Button */}
      <button 
        onClick={handleLike}
        disabled={isEngagementDisabled}
        className={`flex flex-col items-center text-white ${
          isEngagementDisabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <i className={`text-3xl mb-1 ${isLiked ? 'fas fa-heart text-red-500' : 'far fa-heart'}`}></i>
        <span className="text-xs">{likeCount !== undefined ? likeCount : 0}</span>
      </button>



      {/* Message Provider Button (only for participants) */}
      {!isProvider && (
        <button 
          onClick={handleChatWithProvider}
          disabled={isEngagementDisabled}
          title="Message provider"
          className={`flex flex-col items-center text-white ${
            isEngagementDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-400'
          }`}
        >
          <i className="far fa-envelope text-3xl mb-1"></i>
          <span className="text-xs">Message</span>
        </button>
      )}

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
            <p className="text-sm font-medium mb-2 text-gray-800">Share this stream</p>
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