import { useConvexAuth, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { UnifiedContentCard } from "./UnifiedContentCard";
import { NotificationBanner } from "./NotificationBanner";

interface StreamScreenProps {
  onNavigate?: (screen: string, data?: any) => void;
}

export function StreamScreen({ onNavigate }: StreamScreenProps = {}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const articles = useQuery(api.articles.listFeed, { limit: 10 });
  const reels = useQuery(api.reels.listReels, { limit: 10 });
  const recentNotifications = useQuery(api.notifications.getRecentUnreadNotifications, { limit: 5 });
  const [hiddenNotifications, setHiddenNotifications] = useState<Set<string>>(new Set());
  
  // Combine articles and reels into unified content
  const content = articles && reels ? [
    ...articles.map(article => ({ ...article, contentType: "article" as const })),
    ...reels.map(reel => ({ ...reel, contentType: "reel" as const }))
  ].sort((a, b) => b.createdAt - a.createdAt).slice(0, 20) : undefined;

  // Filter out hidden notifications
  const visibleNotifications = recentNotifications?.filter(
    notification => !hiddenNotifications.has(notification._id as string)
  ) || [];

  // Reset hidden notifications when new notifications arrive
  useEffect(() => {
    if (recentNotifications) {
      const currentNotificationIds = new Set(recentNotifications.map(n => n._id));
      setHiddenNotifications(prev => {
        const filtered = new Set<string>();
        prev.forEach(id => {
          if (currentNotificationIds.has(id as any)) {
            filtered.add(id);
          }
        });
        return filtered;
      });
    }
  }, [recentNotifications]);

  console.log("StreamScreen render - isAuthenticated:", isAuthenticated, "isLoading:", isLoading, "content:", content);
  console.log("StreamScreen - onNavigate function:", onNavigate);

  useEffect(() => {
    // No need to reload the page - just let the component handle authentication state
  }, [isAuthenticated]);

  // Show loading state while authentication is being determined
  if (isLoading) {
    console.log("StreamScreen showing loading state");
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Show loading state while not authenticated
  if (!isAuthenticated) {
    console.log("StreamScreen showing not authenticated state");
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-500">Please sign in to view content</p>
      </div>
    );
  }

  console.log("StreamScreen rendering main content");

  const handleNotificationClick = (notificationId: string) => {
    // Hide the notification immediately
    setHiddenNotifications(prev => new Set([...prev, notificationId]));
    
    // Navigate to notifications screen with specific notification highlighted
    onNavigate?.('notifications-screen', { highlightNotificationId: notificationId });
  };

  const handleNotificationDismiss = (notificationId: string) => {
    // Hide the notification immediately
    setHiddenNotifications(prev => new Set([...prev, notificationId]));
  };

  const handleViewAllNotifications = () => {
    onNavigate?.('notifications-screen');
  };

  return (
    <div>
      {/* Notification Banner - only show when authenticated and has notifications */}
      {isAuthenticated && visibleNotifications && visibleNotifications.length > 0 && (
        <NotificationBanner
          notifications={visibleNotifications}
          onNotificationClick={handleNotificationClick}
          onNotificationDismiss={handleNotificationDismiss}
          onDismiss={handleViewAllNotifications}
        />
      )}

      {/* Story Highlights - Creation Buttons */}
      <div className="bg-white py-3 px-4 border-b border-gray-200 overflow-x-auto">
        <div className="flex space-x-4">
          {/* Write Article */}
          <div className="flex flex-col items-center">
            <button 
              onClick={() => onNavigate?.('write-article')}
              className="w-16 h-16 rounded-full bg-accent text-white border-2 border-white flex items-center justify-center mb-1"
            >
              <i className="fas fa-pen text-lg"></i>
            </button>
            <span className="text-xs">Write</span>
          </div>
          {/* Create Reel */}
          <div className="flex flex-col items-center">
            <button 
              onClick={() => onNavigate?.('write-reel')}
              className="w-16 h-16 rounded-full bg-purple-500 text-white border-2 border-white flex items-center justify-center mb-1"
            >
              <i className="fas fa-video text-lg"></i>
            </button>
            <span className="text-xs">Reel</span>
          </div>
        </div>
      </div>

      {/* Content Feed */}
      <div className="mb-4">
        
        {content === undefined ? (
          // Loading state
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
            <p className="text-gray-500">Loading content...</p>
          </div>
        ) : content.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <i className="fas fa-newspaper text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-bold text-gray-600 mb-2">No content yet</h3>
            <p className="text-gray-500 text-center mb-4">
              Be the first to share your thoughts with the community!
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => onNavigate?.('write-article')}
                className="bg-accent text-white px-6 py-3 rounded-lg font-medium"
              >
                Write an article
              </button>
              <button 
                onClick={() => onNavigate?.('write-reel')}
                className="bg-purple-500 text-white px-6 py-3 rounded-lg font-medium"
              >
                Create a reel
              </button>
            </div>
          </div>
        ) : (
          // Content list
          content.map((item: any) => (
            <UnifiedContentCard 
              key={item._id} 
              content={item} 
              onNavigate={onNavigate}
            />
          ))
        )}
      </div>


    </div>
  );
}