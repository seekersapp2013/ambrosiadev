import { useConvexAuth, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { ReelCard } from "./ReelCard";

interface ReelsScreenProps {
  onNavigate?: (screen: string, data?: any) => void;
}

export function ReelsScreen({ onNavigate }: ReelsScreenProps = {}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const reels = useQuery(api.reels.listReels, { limit: 20 });
  const [currentReelIndex, setCurrentReelIndex] = useState(0);

  useEffect(() => {
    // No need to reload the page - just let the component handle authentication state
  }, [isAuthenticated]);

  // Show loading state while authentication is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Show loading state while not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-500">Please sign in to view reels</p>
      </div>
    );
  }

  const handleSwipeUp = () => {
    if (reels && currentReelIndex < reels.length - 1) {
      setCurrentReelIndex(currentReelIndex + 1);
    }
  };

  const handleSwipeDown = () => {
    if (currentReelIndex > 0) {
      setCurrentReelIndex(currentReelIndex - 1);
    }
  };

  return (
    <div className="h-screen overflow-hidden">
      {reels === undefined ? (
        // Loading state
        <div className="flex items-center justify-center h-full bg-black">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mr-3"></div>
          <p className="text-white">Loading reels...</p>
        </div>
      ) : reels.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center justify-center h-full bg-black text-white px-4">
          <i className="fas fa-video text-6xl mb-6 opacity-50"></i>
          <h3 className="text-xl font-bold mb-2">No reels yet</h3>
          <p className="text-gray-300 text-center mb-6">
            Be the first to create a reel and share your story!
          </p>
          <button 
            onClick={() => onNavigate?.('write-reel')}
            className="bg-accent text-white px-6 py-3 rounded-lg font-medium"
          >
            Create your first reel
          </button>
        </div>
      ) : (
        // Reels viewer
        <div 
          className="h-full"
          onTouchStart={(e) => {
            const startY = e.touches[0].clientY;
            const handleTouchEnd = (endEvent: TouchEvent) => {
              const endY = endEvent.changedTouches[0].clientY;
              const diff = startY - endY;
              
              if (Math.abs(diff) > 50) { // Minimum swipe distance
                if (diff > 0) {
                  handleSwipeUp();
                } else {
                  handleSwipeDown();
                }
              }
              
              document.removeEventListener('touchend', handleTouchEnd);
            };
            
            document.addEventListener('touchend', handleTouchEnd);
          }}
        >
          {reels.map((reel, index) => (
            <div
              key={reel._id}
              className={`absolute inset-0 transition-transform duration-300 ${
                index === currentReelIndex 
                  ? 'transform translate-y-0' 
                  : index < currentReelIndex 
                    ? 'transform -translate-y-full' 
                    : 'transform translate-y-full'
              }`}
            >
              <ReelCard 
                reel={reel} 
                isActive={index === currentReelIndex}
                onNavigate={onNavigate}
              />
            </div>
          ))}
          
          {/* Navigation indicators */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2 z-20">
            {reels.map((_, index) => (
              <div
                key={index}
                className={`w-1 h-8 rounded-full ${
                  index === currentReelIndex ? 'bg-white' : 'bg-white bg-opacity-30'
                }`}
              />
            ))}
          </div>

          {/* Create Reel Button */}
          <button
            onClick={() => onNavigate?.('write-reel')}
            className="absolute bottom-20 right-4 w-14 h-14 bg-accent text-white rounded-full flex items-center justify-center shadow-lg z-20"
          >
            <i className="fas fa-plus text-xl"></i>
          </button>
        </div>
      )}
    </div>
  );
}