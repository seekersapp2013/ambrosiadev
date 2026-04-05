import { useConvexAuth, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { NotificationBanner } from "./NotificationBanner";
import { ForYouTab } from "./ForYouTab";
import { LearnScreen } from "./LearnScreen";
import { CommunityTab } from "./CommunityTab";

interface StreamScreenProps {
  onNavigate?: (screen: string, data?: any) => void;
}

type TabType = 'for-you' | 'learn' | 'community';

export function StreamScreen({ onNavigate }: StreamScreenProps = {}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [activeTab, setActiveTab] = useState<TabType>('for-you');
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

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex">
          <button
            onClick={() => setActiveTab('for-you')}
            className={`flex-1 py-4 px-4 text-center font-medium transition-colors ${
              activeTab === 'for-you'
                ? 'text-accent border-b-2 border-accent bg-accent/5'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            For You
          </button>
          <button
            onClick={() => setActiveTab('learn')}
            className={`flex-1 py-4 px-4 text-center font-medium transition-colors ${
              activeTab === 'learn'
                ? 'text-accent border-b-2 border-accent bg-accent/5'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Learn
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`flex-1 py-4 px-4 text-center font-medium transition-colors ${
              activeTab === 'community'
                ? 'text-accent border-b-2 border-accent bg-accent/5'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Community
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'for-you' && <ForYouTab content={content} onNavigate={onNavigate} />}
      {activeTab === 'learn' && <LearnScreen onNavigate={onNavigate} />}
      {activeTab === 'community' && <CommunityTab onNavigate={onNavigate} />}
    </div>
  );
}