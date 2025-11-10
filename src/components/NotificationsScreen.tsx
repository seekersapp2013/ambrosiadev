import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

interface NotificationsScreenProps {
  onBack: () => void;
  onOpenSettings?: () => void;
}

export function NotificationsScreen({ onBack, onOpenSettings }: NotificationsScreenProps) {
  const notifications = useQuery(api.notifications.getMyNotifications, { limit: 50 });
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const deleteNotification = useMutation(api.notifications.deleteNotification);
  
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

  const filteredNotifications = notifications?.filter(notification => {
    // Filter by read status
    if (filter === "unread" && notification.isRead) return false;
    if (filter === "read" && !notification.isRead) return false;
    
    // Filter by category
    if (categoryFilter !== "all" && notification.category !== categoryFilter) return false;
    
    return true;
  }) || [];

  // Group notifications by category for filter options
  const categories = Array.from(new Set(notifications?.map(n => n.category).filter(Boolean) || []));

  const handleSelectNotification = (notificationId: string) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n._id)));
    }
  };

  const handleBulkMarkAsRead = async () => {
    try {
      const promises = Array.from(selectedNotifications).map(id => 
        markAsRead({ notificationId: id as any })
      );
      await Promise.all(promises);
      setSelectedNotifications(new Set());
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedNotifications.size} notifications?`)) {
      try {
        const promises = Array.from(selectedNotifications).map(id => 
          deleteNotification({ notificationId: id as any })
        );
        await Promise.all(promises);
        setSelectedNotifications(new Set());
      } catch (error) {
        console.error("Failed to delete notifications:", error);
      }
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead({ notificationId: notificationId as any });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({});
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'CONTENT_LIKED':
        return 'fas fa-heart';
      case 'CONTENT_CLAPPED':
        return 'fas fa-hands-clapping';
      case 'CONTENT_COMMENTED':
        return 'fas fa-comment';
      case 'COMMENT_REPLY':
        return 'fas fa-reply';
      case 'NEW_FOLLOWER':
        return 'fas fa-user-plus';
      case 'CONTENT_PAYMENT':
        return 'fas fa-money-bill';
      case 'USER_MENTION':
        return 'fas fa-at';
      case 'SYSTEM_ANNOUNCEMENT':
        return 'fas fa-bullhorn';
      case 'email_sent':
        return 'fas fa-envelope';
      case 'wallet_created':
        return 'fas fa-wallet';
      case 'payment_received':
        return 'fas fa-money-bill';
      case 'follow':
        return 'fas fa-user-plus';
      case 'like':
        return 'fas fa-heart';
      case 'comment':
        return 'fas fa-comment';
      // Booking notification types
      case 'booking_confirmed':
        return 'fas fa-calendar-check';
      case 'booking_pending':
        return 'fas fa-calendar-plus';
      case 'booking_approved':
        return 'fas fa-check-circle';
      case 'booking_rejected':
        return 'fas fa-times-circle';
      case 'booking_cancelled':
        return 'fas fa-calendar-times';
      case 'booking_reminder':
        return 'fas fa-bell';
      case 'new_booking_request':
        return 'fas fa-calendar-plus';
      default:
        return 'fas fa-bell';
    }
  };

  const getDeliveryChannelIndicator = (notification: any) => {
    const channels = [];
    if (notification.deliveryChannels?.includes('inApp')) {
      channels.push(<i key="inApp" className="fas fa-mobile-alt text-xs text-blue-500" title="In-App" />);
    }
    if (notification.deliveryChannels?.includes('email')) {
      channels.push(<i key="email" className="fas fa-envelope text-xs text-green-500" title="Email" />);
    }
    return channels;
  };

  const formatNotificationContent = (notification: any) => {
    let content = notification.message;
    
    // Add actor information if available
    if (notification.actorName) {
      content = content.replace(/Someone/, notification.actorName);
    }
    
    return content;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <i className="fas fa-arrow-left text-gray-600"></i>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
        </div>
        
        <button
          onClick={onOpenSettings}
          className="p-2 hover:bg-gray-100 rounded-full"
          title="Notification Settings"
        >
          <i className="fas fa-cog text-gray-600"></i>
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Read Status Filter */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === "all" 
                ? "bg-accent text-white" 
                : "bg-gray-200 text-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === "unread" 
                ? "bg-accent text-white" 
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === "read" 
                ? "bg-accent text-white" 
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Read
          </button>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                categoryFilter === "all" 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category as string)}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap capitalize ${
                  categoryFilter === category 
                    ? "bg-blue-500 text-white" 
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedNotifications.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-700">
            {selectedNotifications.size} notification{selectedNotifications.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex space-x-2">
            <button
              onClick={handleBulkMarkAsRead}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Mark as Read
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedNotifications(new Set())}
              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Select All / Actions Bar */}
      {filteredNotifications.length > 0 && (
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedNotifications.size === filteredNotifications.length && filteredNotifications.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Select all</span>
          </label>
          
          {notifications && notifications.some(n => !n.isRead) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-accent text-sm font-medium"
            >
              Mark all read
            </button>
          )}
        </div>
      )}

      {/* Notifications list */}
      {notifications === undefined ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
          <p className="text-gray-500">Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-8">
          <i className="fas fa-bell-slash text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">
            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 rounded-lg border transition-colors ${
                notification.isRead 
                  ? "bg-white border-gray-200" 
                  : "bg-ambrosia-50 border-accent"
              } ${selectedNotifications.has(notification._id) ? "ring-2 ring-blue-500" : ""}`}
            >
              <div className="flex items-start space-x-3">
                {/* Selection Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedNotifications.has(notification._id)}
                  onChange={() => handleSelectNotification(notification._id)}
                  className="mt-1 rounded border-gray-300"
                />

                {/* Notification Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  notification.isRead ? "bg-gray-200" : "bg-accent"
                }`}>
                  <i className={`${getNotificationIcon(notification.type)} text-sm ${
                    notification.isRead ? "text-gray-600" : "text-white"
                  }`}></i>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className={`text-sm font-medium ${
                        notification.isRead ? "text-gray-900" : "text-accent"
                      }`}>
                        {notification.title}
                      </h3>
                      
                      {/* Priority Indicator */}
                      {notification.priority === 'high' && (
                        <span className="inline-block w-2 h-2 bg-red-500 rounded-full" title="High Priority"></span>
                      )}
                      
                      {/* Category Badge */}
                      {notification.category && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                          {notification.category}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Delivery Channel Indicators */}
                      <div className="flex space-x-1">
                        {getDeliveryChannelIndicator(notification)}
                      </div>
                      
                      {/* Unread Indicator */}
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {formatNotificationContent(notification)}
                  </p>
                  
                  {/* Actor and Content Links */}
                  {notification.actor?.name && (
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>by {notification.actor.name}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="text-xs text-accent hover:text-accent-dark"
                        >
                          Mark as read
                        </button>
                      )}
                      
                      {/* Link to content if available */}
                      {notification.relatedContentId && (
                        <button
                          onClick={() => {
                            // Navigate to content - this would need to be implemented based on your routing
                            console.log('Navigate to content:', notification.relatedContentId);
                          }}
                          className="text-xs text-blue-500 hover:text-blue-700"
                        >
                          View content
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}