import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface ReelCardFeedProps {
  reel: {
    _id: Id<"reels">;
    video: string;
    poster?: string;
    caption?: string;
    tags: string[];
    isSensitive: boolean;
    isGated: boolean;
    priceToken?: string;
    priceAmount?: number;
    sellerAddress?: string;
    views: number;
    createdAt: number;
    author: {
      id?: Id<"users">;
      name?: string;
      username?: string;
      avatar?: string;
    };
  };
  onNavigate?: (screen: string, data?: any) => void;
}

export function ReelCardFeed({ reel, onNavigate }: ReelCardFeedProps) {
  const [showSensitiveContent, setShowSensitiveContent] = useState(false);

  const hasAccess = useQuery(api.payments.hasAccess, {
    contentType: "reel",
    contentId: reel._id,
  });

  // Get current user profile to check if it's their own reel
  const myProfile = useQuery(api.profiles.getMyProfile);
  
  // Follow functionality
  const isFollowing = useQuery(api.follows.isFollowing, 
    reel.author.id ? { userId: reel.author.id } : "skip"
  );
  const followUser = useMutation(api.follows.followUser);
  
  // Delete functionality
  const deleteReel = useMutation(api.reels.deleteReel);
  
  // Check if this is the current user's reel
  const isOwnReel = myProfile?.userId === reel.author.id;

  // Get poster/thumbnail URL
  const posterUrl = reel.poster ? useQuery(api.files.getFileUrl, { storageId: reel.poster }) : null;
  const videoUrl = useQuery(api.files.getFileUrl, { storageId: reel.video });

  // Get author avatar URL
  const authorAvatarUrl = useQuery(
    api.files.getFileUrl,
    reel.author.avatar ? { storageId: reel.author.avatar } : "skip"
  );

  const handleWatchReel = () => {
    // Navigate to private reel viewer for full screen experience
    onNavigate?.('private-reel-viewer', { reelId: reel._id });
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!reel.author.id) return;
    
    try {
      await followUser({ followingId: reel.author.id });
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this reel? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await deleteReel({ reelId: reel._id });
      console.log(`Reel deleted successfully. Removed ${result.deletedComments} comments, ${result.deletedLikes} likes, ${result.deletedBookmarks} bookmarks.`);
    } catch (error) {
      console.error('Error deleting reel:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete reel. Please try again.');
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 pb-4">
      {/* Reel Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <img
            src={authorAvatarUrl || "https://randomuser.me/api/portraits/women/44.jpg"}
            alt="Author"
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <span className="font-medium">{reel.author.username || reel.author.name}</span>
            <div className="text-xs text-gray-500 flex items-center">
              <i className="fas fa-video mr-1"></i>
              {formatTimeAgo(reel.createdAt)} • Reel
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {reel.author.id && !isOwnReel && (
            <button
              onClick={handleFollowClick}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                isFollowing
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-accent text-white hover:bg-accent-dark'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
          {isOwnReel && (
            <button
              onClick={handleDeleteClick}
              className="text-red-600 hover:text-red-800 p-1"
              title="Delete reel"
            >
              <i className="fas fa-trash text-sm"></i>
            </button>
          )}
          <button onClick={(e) => e.stopPropagation()}>
            <i className="fas fa-ellipsis-h text-gray-500"></i>
          </button>
        </div>
      </div>

      {/* Clickable Reel Content */}
      <div
        className="px-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        onClick={handleWatchReel}
      >
        {/* Caption */}
        {reel.caption && (
          <p className="text-gray-800 mb-3">{reel.caption}</p>
        )}

        {/* Tags */}
        {reel.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {reel.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-ambrosia-100 text-accent px-2 py-1 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Video Thumbnail */}
        <div className="relative mb-3">
          {reel.isSensitive && !showSensitiveContent ? (
            <div className="relative aspect-video">
              <div className="absolute inset-0 graphic-content-warning flex flex-col items-center justify-center text-white p-4 text-center z-10 rounded-lg">
                <i className="fas fa-exclamation-triangle text-3xl mb-2"></i>
                <h3 className="font-bold text-lg mb-2">Sensitive Content</h3>
                <p className="mb-4">This reel contains content that some may find sensitive.</p>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowSensitiveContent(true);
                  }}
                  className="bg-white text-accent px-4 py-2 rounded-lg font-medium"
                >
                  View Content
                </button>
              </div>
              <div className="w-full aspect-video bg-gray-900 rounded-lg"></div>
            </div>
          ) : (
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
              {/* Gated Content Overlay */}
              {reel.isGated && !hasAccess && (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
                  <div className="text-center text-white p-4">
                    <i className="fas fa-lock text-3xl mb-3"></i>
                    <h3 className="font-bold text-lg mb-2">Premium Reel</h3>
                    <p className="text-sm mb-3">
                      {reel.priceAmount} {reel.priceToken}
                    </p>
                    <p className="text-xs opacity-75">
                      Unlock to watch this reel
                    </p>
                  </div>
                </div>
              )}
              
              {/* Video Thumbnail */}
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt="Reel thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <i className="fas fa-video text-white text-4xl opacity-50"></i>
                </div>
              )}
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-50 rounded-full p-4">
                  <i className="fas fa-play text-white text-2xl ml-1"></i>
                </div>
              </div>
              
              {/* Duration Badge */}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                <i className="fas fa-video mr-1"></i>
                Reel
              </div>
            </div>
          )}
        </div>

        {/* Gated Content Indicator */}
        {reel.isGated && !hasAccess && (
          <div className="bg-ambrosia-100 border border-ambrosia-300 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-lock text-accent mr-2"></i>
                <span className="text-sm font-medium">Premium Reel</span>
              </div>
              <span className="text-accent font-bold">
                {reel.priceAmount} {reel.priceToken}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Unlock this reel to watch the full video
            </p>
          </div>
        )}

        {/* Watch Button */}
        <div className="font-medium text-sm mb-3 text-accent flex items-center">
          <i className="fas fa-play mr-2"></i>
          Watch Reel
        </div>
      </div>

      {/* Reel Actions - Simplified for feed */}
      <div className="px-4 flex items-center justify-between text-gray-500 text-sm">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1 hover:text-accent transition-colors">
            <i className="fas fa-heart"></i>
            <span>Like</span>
          </button>
          <button 
            onClick={() => onNavigate?.('reel-comments', { reelId: reel._id })}
            className="flex items-center space-x-1 hover:text-accent transition-colors"
          >
            <i className="fas fa-comment"></i>
            <span>Comment</span>
          </button>
          <button className="flex items-center space-x-1 hover:text-accent transition-colors">
            <i className="fas fa-share"></i>
            <span>Share</span>
          </button>
        </div>
        <div className="text-xs text-gray-400">
          {reel.views} views
        </div>
      </div>
    </div>
  );
}