import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";

interface NotificationBannerItem {
  _id: string;
  title: string;
  type: string;
  createdAt: number;
  priority?: string;
}

interface NotificationBannerProps {
  notifications: NotificationBannerItem[];
  onNotificationClick: (notificationId: string) => void;
  onNotificationDismiss?: (notificationId: string) => void;
  onDismiss?: () => void;
}

export function NotificationBanner({ 
  notifications, 
  onNotificationClick, 
  onNotificationDismiss,
  onDismiss 
}: NotificationBannerProps) {
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());
  const [isMarkingAsRead, setIsMarkingAsRead] = useState<Set<string>>(new Set());
  const [fadingOut, setFadingOut] = useState<Set<string>>(new Set());
  const markAsRead = useMutation(api.notifications.markAsRead);

  // Reset dismissed notifications when new notifications come in
  useEffect(() => {
    const currentNotificationIds = new Set(notifications.map(n => n._id));
    setDismissedNotifications(prev => {
      const filtered = new Set<string>();
      prev.forEach(id => {
        if (currentNotificationIds.has(id as any)) {
          filtered.add(id);
        }
      });
      return filtered;
    });
    
    // Also reset fading out state for notifications that are no longer present
    setFadingOut(prev => {
      const filtered = new Set<string>();
      prev.forEach(id => {
        if (currentNotificationIds.has(id as any)) {
          filtered.add(id);
        }
      });
      return filtered;
    });
  }, [notifications]);

  // Filter out dismissed notifications and those being marked as read
  const visibleNotifications = notifications.filter(
    notification => !dismissedNotifications.has(notification._id as string) && !isMarkingAsRead.has(notification._id as string)
  );

  if (visibleNotifications.length === 0) {
    return null;
  }

  const handleNotificationClick = (notificationId: string) => {
    // Start fade out animation
    setFadingOut(prev => new Set([...prev, notificationId]));
    
    // After a short delay, hide the notification and navigate
    setTimeout(() => {
      setDismissedNotifications(prev => new Set([...prev, notificationId]));
      onNotificationClick(notificationId);
    }, 150);
  };

  const handleDismissNotification = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Start fade out animation
    setFadingOut(prev => new Set([...prev, notificationId]));
    setIsMarkingAsRead(prev => new Set([...prev, notificationId]));
    
    // Immediately notify parent component to hide the notification
    onNotificationDismiss?.(notificationId);
    
    // After animation, hide the notification locally too
    setTimeout(() => {
      setDismissedNotifications(prev => new Set([...prev, notificationId]));
    }, 150);
    
    try {
      // Mark as read in the backend
      await markAsRead({ notificationId: notificationId as any });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      // Remove from dismissed set if marking as read failed
      setDismissedNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
      setFadingOut(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    } finally {
      // Remove from marking as read set
      setIsMarkingAsRead(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'CONTENT_LIKED':
        return 'fas fa-heart text-red-500';
      case 'CONTENT_CLAPPED':
        return 'fas fa-hands-clapping text-yellow-500';
      case 'CONTENT_COMMENTED':
        return 'fas fa-comment text-blue-500';
      case 'COMMENT_REPLY':
        return 'fas fa-reply text-blue-500';
      case 'NEW_FOLLOWER':
        return 'fas fa-user-plus text-green-500';
      case 'CONTENT_PAYMENT':
        return 'fas fa-money-bill text-green-600';
      case 'USER_MENTIONED':
        return 'fas fa-at text-purple-500';
      case 'FOLLOWER_NEW_POST':
        return 'fas fa-newspaper text-blue-600';
      default:
        return 'fas fa-bell text-gray-500';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
        {visibleNotifications.map((notification) => (
          <div
            key={`${notification._id}-${notification.createdAt}`}
            onClick={() => handleNotificationClick(notification._id)}
            className={`
              flex items-center space-x-2 min-w-0 flex-shrink-0 
              px-3 py-2 rounded-lg border-l-4 cursor-pointer
              hover:shadow-md transition-all duration-200
              ${getPriorityColor(notification.priority)}
              ${fadingOut.has(notification._id) ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
            `}
          >
            {/* Notification Icon */}
            <i className={`${getNotificationIcon(notification.type)} text-sm flex-shrink-0`}></i>
            
            {/* Notification Title */}
            <span className="text-sm font-medium text-gray-800 truncate max-w-48">
              {notification.title}
            </span>
            
            {/* Close Button */}
            <button
              onClick={(e) => handleDismissNotification(notification._id, e)}
              className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 
                         flex items-center justify-center transition-colors duration-150
                         ml-2"
              title="Dismiss notification"
            >
              <i className="fas fa-times text-xs text-gray-600"></i>
            </button>
          </div>
        ))}
        
        {/* Show all notifications button if there are more */}
        {visibleNotifications.length > 0 && (
          <button
            onClick={() => onDismiss?.()}
            className="flex-shrink-0 px-3 py-2 text-sm text-accent hover:text-accent-dark 
                       font-medium whitespace-nowrap"
          >
            View all
          </button>
        )}
      </div>
    </div>
  );
}