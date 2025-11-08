import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { GatedContentPaywall } from "./GatedContentPaywall";
import { ReelEngagement } from "./ReelEngagement";

interface ReelCardProps {
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
  isActive?: boolean;
  onNavigate?: (screen: string, data?: any) => void;
}

export function ReelCard({ reel, isActive = false, onNavigate }: ReelCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSensitiveContent, setShowSensitiveContent] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hasAccess = useQuery(api.payments.hasAccess, {
    contentType: "reel",
    contentId: reel._id,
  });
  const videoUrl = useQuery(api.files.getFileUrl, { storageId: reel.video });
  const posterUrl = reel.poster ? useQuery(api.files.getFileUrl, { storageId: reel.poster }) : null;
  
  // Get current user profile to check if it's their own reel
  const myProfile = useQuery(api.profiles.getMyProfile);
  const deleteReel = useMutation(api.reels.deleteReel);
  
  // Check if this is the current user's reel
  const isOwnReel = myProfile?.userId === reel.author.id;

  useEffect(() => {
    if (videoRef.current && videoUrl) {
      const video = videoRef.current;
      
      if (isActive && (!reel.isGated || hasAccess)) {
        // Try to play with audio first, fallback to muted if needed
        video.muted = false;
        setIsMuted(false);
        
        video.play().catch(error => {
          console.log("Video play with audio failed, trying muted:", error);
          // If autoplay fails, try with muted
          video.muted = true;
          setIsMuted(true);
          video.play().catch(mutedError => {
            console.log("Muted video play also failed:", mutedError);
            setIsPlaying(false);
          });
        });
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  }, [isActive, hasAccess, videoUrl, reel.isGated]);

  const handlePlayPause = () => {
    if (reel.isGated && !hasAccess) {
      // Show paywall
      onNavigate?.('paywall', { 
        contentType: 'reel', 
        contentId: reel._id,
        title: reel.caption || 'Reel',
        price: reel.priceAmount,
        token: reel.priceToken,
        sellerAddress: reel.sellerAddress
      });
      return;
    }

    if (videoRef.current && videoUrl) {
      const video = videoRef.current;
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        // Try to unmute if it was muted due to autoplay restrictions
        if (isMuted) {
          video.muted = false;
          setIsMuted(false);
        }
        
        video.play().catch(error => {
          console.log("Video play failed:", error);
          setIsPlaying(false);
        });
        setIsPlaying(true);
      }
    }
  };

  const handleSingleClick = () => {
    // Single click does nothing, we only respond to double clicks
  };

  const handleDoubleClick = () => {
    handlePlayPause();
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (clickTimeoutRef.current) {
      // This is a double click
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      handleDoubleClick();
    } else {
      // This might be a single click, wait to see if there's another click
      clickTimeoutRef.current = setTimeout(() => {
        handleSingleClick();
        clickTimeoutRef.current = null;
      }, 300);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !videoRef.current.muted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  const handleReelClick = () => {
    // Navigate to private reel viewer for full screen experience
    onNavigate?.('private-reel-viewer', { reelId: reel._id });
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



  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return 'now';
  };

  return (
    <div className="relative h-screen w-full bg-black flex items-center justify-center">
      {/* Video Container */}
      <div className="relative w-full h-full">
        {reel.isSensitive && !showSensitiveContent ? (
          <div className="absolute inset-0 graphic-content-warning flex flex-col items-center justify-center text-white p-4 text-center z-20">
            <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
            <h3 className="font-bold text-xl mb-2">Sensitive Content</h3>
            <p className="mb-4">This reel contains content that some may find sensitive.</p>
            <button 
              onClick={() => setShowSensitiveContent(true)}
              className="bg-white text-accent px-6 py-3 rounded-lg font-medium"
            >
              View Content
            </button>
          </div>
        ) : (
          <>
            {/* Gated Content Overlay */}
            {reel.isGated && !hasAccess && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20">
                <div className="bg-white rounded-lg max-w-sm mx-4">
                  <GatedContentPaywall
                    contentType="reel"
                    contentId={reel._id}
                    title={reel.caption || 'Premium Reel'}
                    price={reel.priceAmount || 0}
                    token={reel.priceToken || "USD"}
                    sellerAddress={reel.sellerAddress}
                    onUnlock={() => {
                      // Content will automatically become accessible after payment
                    }}
                    onFundWallet={() => onNavigate?.('fund-wallet')}
                  />
                </div>
              </div>
            )}

            {/* Video Element */}
            {videoUrl ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                loop
                playsInline
                preload="metadata"
                poster={posterUrl || undefined}
                onClick={handleVideoClick}
                onLoadedData={() => {
                  // Video is ready to play
                  if (isActive && (!reel.isGated || hasAccess)) {
                    const video = videoRef.current;
                    if (video) {
                      // Try to play with audio first
                      video.muted = false;
                      setIsMuted(false);
                      
                      video.play().catch(error => {
                        console.log("Video autoplay with audio failed, trying muted:", error);
                        // Fallback to muted autoplay
                        video.muted = true;
                        setIsMuted(true);
                        video.play().catch(mutedError => {
                          console.log("Muted autoplay also failed:", mutedError);
                          setIsPlaying(false);
                        });
                      });
                    }
                  }
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                  // Video will loop automatically due to loop attribute
                  setIsPlaying(true);
                }}
                onError={(e) => {
                  console.error("Video loading error:", e);
                }}
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <div className="text-white text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p>Loading video...</p>
                </div>
              </div>
            )}

            {/* Play/Pause Overlay */}
            {!isPlaying && videoUrl && (!reel.isGated || hasAccess) && (
              <div 
                className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
              >
                <div className="bg-black bg-opacity-50 rounded-full p-4">
                  <i className="fas fa-play text-white text-3xl"></i>
                </div>
              </div>
            )}

            {/* Audio Control */}
            {videoUrl && (!reel.isGated || hasAccess) && (
              <div className="absolute top-4 left-4 z-10">
                <button
                  onClick={toggleMute}
                  className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-opacity"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'} text-sm`}></i>
                </button>
              </div>
            )}

            {/* Double-tap instruction */}
            {isActive && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
                <div className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-75">
                  Double tap to play/pause
                </div>
              </div>
            )}
          </>
        )}

        {/* Top Right Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
          {isOwnReel && (
            <button
              onClick={handleDeleteClick}
              className="bg-red-600 bg-opacity-75 text-white rounded-full p-2 hover:bg-opacity-100 transition-opacity"
              title="Delete reel"
            >
              <i className="fas fa-trash text-sm"></i>
            </button>
          )}
          <button
            onClick={handleReelClick}
            className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-opacity"
            title="View full screen"
          >
            <i className="fas fa-expand text-sm"></i>
          </button>
        </div>

        {/* Right Side Actions */}
        <div className="absolute right-4 bottom-20 z-10">
          <ReelEngagement
            reel={reel}
            onNavigate={onNavigate}
            hasAccess={hasAccess}
          />
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-4 left-4 right-20 text-white z-10">
          <div className="flex items-center mb-2">
            <span className="font-medium mr-2">@{reel.author.username}</span>
            <span className="text-sm opacity-75">{formatTimeAgo(reel.createdAt)}</span>
          </div>
          
          {reel.caption && (
            <p className="text-sm mb-2 line-clamp-2">{reel.caption}</p>
          )}

          {/* Tags */}
          {reel.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {reel.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="text-xs opacity-75"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}