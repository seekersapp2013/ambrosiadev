import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import { vEmailId } from "@convex-dev/resend";

export default defineSchema({
  ...authTables,

  emails: defineTable({
    userId: v.id("users"),
    emailId: vEmailId,
    notificationId: v.optional(v.id("notifications")), // Link to notification if this is a notification email
    batchId: v.optional(v.string()), // For batch notification emails
  }).index("userId", ["userId"])
    .index("emailId", ["emailId"])
    .index("notificationId", ["notificationId"]),

  // ✅ Existing wallet table
  wallets: defineTable({
    userId: v.id("users"),      // Link to authenticated user
    address: v.string(),
    publicKey: v.string(),
    privateKey: v.string(),     // You may want to encrypt this in the future
    mnemonic: v.string(),       // Recovery phrase
    createdAt: v.number(),
  }).index("userId", ["userId"]),

  // ✅ Extended user profiles
  profiles: defineTable({
    userId: v.id("users"),
    username: v.string(),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatar: v.optional(v.string()), // storage id
    phoneNumber: v.optional(v.string()),
    walletAddress: v.optional(v.string()),
    privateKey: v.optional(v.string()),
    seedPhrase: v.optional(v.string()),
    walletSeedEnc: v.optional(v.string()),
    interests: v.optional(v.array(v.string())), // Health-related interests
    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  }).index("by_username", ["username"]).index("by_wallet", ["walletAddress"]).index("by_userId", ["userId"]),

  // ✅ Articles table
  articles: defineTable({
    authorId: v.id("users"),
    title: v.string(),
    subtitle: v.optional(v.string()),
    slug: v.string(),
    contentHtml: v.string(),
    contentDelta: v.optional(v.any()),
    coverImage: v.optional(v.string()), // storage id
    readTimeMin: v.number(),
    tags: v.array(v.string()),
    status: v.string(), // DRAFT | PUBLISHED | ARCHIVED
    publishedAt: v.optional(v.number()),
    isSensitive: v.boolean(),
    // Gating with custom token
    isGated: v.boolean(),
    priceToken: v.optional(v.string()), // e.g., "USD"
    priceAmount: v.optional(v.number()),
    sellerAddress: v.optional(v.string()), // wallet address for payments
    views: v.number(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  }).index("by_slug", ["slug"]).index("by_author", ["authorId"]).index("by_tag", ["tags"]).index("by_status", ["status"]).index("by_created", ["createdAt"]),

  // ✅ Reels table
  reels: defineTable({
    authorId: v.id("users"),
    video: v.string(), // storage id
    poster: v.optional(v.string()), // storage id
    durationS: v.optional(v.number()),
    caption: v.optional(v.string()),
    tags: v.array(v.string()),
    isSensitive: v.boolean(),
    // Gating with custom token
    isGated: v.boolean(),
    priceToken: v.optional(v.string()),
    priceAmount: v.optional(v.number()),
    sellerAddress: v.optional(v.string()), // wallet address for payments
    views: v.number(),
    createdAt: v.number()
  }).index("by_author", ["authorId"]).index("by_created", ["createdAt"]),

  // ✅ Comments table
  comments: defineTable({
    articleId: v.optional(v.id("articles")),
    reelId: v.optional(v.id("reels")),
    authorId: v.id("users"),
    parentId: v.optional(v.id("comments")),
    content: v.string(),
    createdAt: v.number()
  }).index("by_article", ["articleId"]).index("by_reel", ["reelId"]),

  // ✅ Stream Comments table (for live stream chat)
  streamComments: defineTable({
    streamId: v.id("bookings"),
    authorId: v.id("users"),
    parentId: v.optional(v.id("streamComments")),
    content: v.string(),
    createdAt: v.number()
  }).index("by_stream", ["streamId"]).index("by_author", ["authorId"]),

  // ✅ Likes table
  likes: defineTable({
    userId: v.id("users"),
    articleId: v.optional(v.id("articles")),
    reelId: v.optional(v.id("reels")),
    streamId: v.optional(v.id("bookings")), // For live stream likes
    createdAt: v.number()
  }).index("by_user_article", ["userId", "articleId"]).index("by_user_reel", ["userId", "reelId"]).index("by_user_stream", ["userId", "streamId"]),

  // ✅ Claps table (per-user clap counts per article)
  claps: defineTable({
    userId: v.id("users"),
    articleId: v.id("articles"),
    count: v.number(), // 0..100 per user per article
    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  }).index("by_user_article", ["userId", "articleId"]).index("by_article", ["articleId"]),

  // ✅ Reads table (tracks if a user has opened an article)
  reads: defineTable({
    userId: v.id("users"),
    articleId: v.id("articles"),
    createdAt: v.number(),
  }).index("by_user_article", ["userId", "articleId"]).index("by_article", ["articleId"]),

  // ✅ Bookmarks table
  bookmarks: defineTable({
    userId: v.id("users"),
    articleId: v.optional(v.id("articles")),
    reelId: v.optional(v.id("reels")),
    streamId: v.optional(v.id("bookings")), // For live stream bookmarks
    createdAt: v.number()
  }).index("by_user", ["userId"]).index("by_user_article", ["userId", "articleId"]).index("by_user_reel", ["userId", "reelId"]).index("by_user_stream", ["userId", "streamId"]),

  // ✅ Follows table
  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
    createdAt: v.number()
  }).index("by_follower", ["followerId"]).index("by_following", ["followingId"]),

  // ✅ Payments audit trail (on-chain tx metadata)
  payments: defineTable({
    payerId: v.id("users"),
    contentType: v.string(), // 'article' | 'reel'
    contentId: v.union(v.id("articles"), v.id("reels")),
    token: v.string(),
    amount: v.number(),
    network: v.string(), // e.g., 'celo'
    txHash: v.optional(v.string()),
    createdAt: v.number()
  }).index("by_content", ["contentType", "contentId"]).index("by_payer", ["payerId"]).index("by_token", ["token"]).index("by_user_content", ["payerId", "contentType", "contentId"]),

  // ✅ Enhanced Notifications table
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),

    // Enhanced fields
    category: v.optional(v.string()), // 'engagement' | 'social' | 'content' | 'system'
    priority: v.optional(v.string()), // 'low' | 'medium' | 'high'

    // Related content
    relatedContentType: v.optional(v.string()), // 'article' | 'reel' | 'comment' | 'user'
    relatedContentId: v.optional(v.string()),
    relatedId: v.optional(v.string()), // Legacy field for backward compatibility

    // Actor information (who triggered the notification)
    actorUserId: v.optional(v.id("users")),

    // Metadata for additional context
    metadata: v.optional(v.any()),

    // Batching
    batchId: v.optional(v.union(v.string(), v.id("notificationBatches"))),
    batchCount: v.optional(v.number()),
    batchedInto: v.optional(v.id("notifications")), // If this notification was batched into a summary notification
    hiddenFromFeed: v.optional(v.boolean()), // Hide individual notifications that are part of a batch

    // Delivery tracking
    deliveryChannels: v.optional(v.array(v.string())),
    deliveryStatus: v.optional(v.object({
      in_app: v.optional(v.object({
        delivered: v.boolean(),
        deliveredAt: v.optional(v.number()),
        viewed: v.optional(v.boolean()),
        viewedAt: v.optional(v.number()),
        clicked: v.optional(v.boolean()),
        clickedAt: v.optional(v.number()),
        dismissed: v.optional(v.boolean()),
        dismissedAt: v.optional(v.number()),
        error: v.optional(v.string()),
        errorAt: v.optional(v.number()),
        retryCount: v.optional(v.number())
      })),
      email: v.optional(v.object({
        delivered: v.boolean(),
        deliveredAt: v.optional(v.number()),
        messageId: v.optional(v.string()),
        opened: v.optional(v.boolean()),
        openedAt: v.optional(v.number()),
        clicked: v.optional(v.boolean()),
        clickedAt: v.optional(v.number()),
        sentAt: v.optional(v.number()),
        error: v.optional(v.string()),
        errorAt: v.optional(v.number()),
        retryCount: v.optional(v.number()),
        batchId: v.optional(v.string())
      })),
      whatsapp: v.optional(v.object({
        delivered: v.boolean(),
        deliveredAt: v.optional(v.number()),
        messageId: v.optional(v.string()),
        error: v.optional(v.string()),
        errorAt: v.optional(v.number()),
        retryCount: v.optional(v.number())
      })),
      sms: v.optional(v.object({
        delivered: v.boolean(),
        deliveredAt: v.optional(v.number()),
        messageId: v.optional(v.string()),
        error: v.optional(v.string()),
        errorAt: v.optional(v.number()),
        retryCount: v.optional(v.number())
      }))
    })),

    createdAt: v.number(),
    scheduledFor: v.optional(v.number()), // For delayed delivery
    expiresAt: v.optional(v.number())
  }).index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "isRead"])
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_type", ["type"])
    .index("by_category", ["category"])
    .index("by_priority", ["priority"])
    .index("by_scheduled", ["scheduledFor"])
    .index("by_batch", ["batchId"])
    .index("by_actor", ["actorUserId"])
    .index("by_created", ["createdAt"]),

  // ✅ User notification settings
  notificationSettings: defineTable({
    userId: v.id("users"),
    notificationType: v.string(),
    enabled: v.boolean(),
    channels: v.object({
      in_app: v.boolean(),
      email: v.boolean(),
      whatsapp: v.boolean(),
      sms: v.boolean(),
      push: v.boolean()
    }),
    quietHours: v.optional(v.object({
      enabled: v.boolean(),
      startTime: v.string(), // "22:00"
      endTime: v.string(), // "08:00"
      timezone: v.string()
    })),
    batchingPreference: v.string(), // 'immediate' | 'batched' | 'digest'
    updatedAt: v.number()
  }).index("by_user", ["userId"])
    .index("by_user_type", ["userId", "notificationType"]),

  // ✅ Notification batches for grouping similar notifications
  notificationBatches: defineTable({
    userId: v.id("users"),
    type: v.string(), // Notification type being batched
    notifications: v.array(v.id("notifications")), // Array of notification IDs in this batch
    batchCount: v.number(),
    category: v.string(),
    priority: v.string(),
    batchingMode: v.string(), // 'batched' | 'digest'
    processed: v.boolean(),
    processedAt: v.optional(v.number()),
    summaryNotificationId: v.optional(v.id("notifications")), // The summary notification created from this batch
    createdAt: v.number(),
    updatedAt: v.number()
  }).index("by_user", ["userId"])
    .index("by_user_type", ["userId", "type"])
    .index("by_processed", ["processed"])
    .index("by_created", ["createdAt"]),

  // ✅ User activity tracking for intelligent timing
  userActivity: defineTable({
    userId: v.id("users"),
    lastActiveAt: v.number(),
    sessionCount: v.number(),
    averageSessionDuration: v.number(), // in milliseconds
    preferredActiveHours: v.array(v.number()), // Hours of day when user is typically active (0-23)
    timezone: v.string(),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index("by_user", ["userId"])
    .index("by_last_active", ["lastActiveAt"]),

  // ✅ Notification events for detailed analytics tracking
  notificationEvents: defineTable({
    notificationId: v.id("notifications"),
    userId: v.id("users"),
    channel: v.string(), // 'in_app' | 'email' | 'whatsapp' | 'sms' | 'push'
    event: v.string(), // 'delivered' | 'viewed' | 'opened' | 'clicked' | 'dismissed' | 'failed'
    timestamp: v.number(),
    metadata: v.object({
      messageId: v.optional(v.string()),
      error: v.optional(v.string()),
      userAgent: v.optional(v.string()),
      ipAddress: v.optional(v.string()),
      source: v.optional(v.string()), // 'notification_center' | 'email' | 'push'
      duration: v.optional(v.number()), // Time spent viewing
      clickTarget: v.optional(v.string()), // What was clicked
      batchId: v.optional(v.string())
    })
  }).index("by_notification", ["notificationId"])
    .index("by_user", ["userId"])
    .index("by_user_timestamp", ["userId", "timestamp"])
    .index("by_channel", ["channel"])
    .index("by_event", ["event"])
    .index("by_timestamp", ["timestamp"]),

  // ✅ Booking Subscribers table
  bookingSubscribers: defineTable({
    userId: v.id("users"),
    jobTitle: v.string(),
    specialization: v.string(),
    sessionPrice: v.number(), // Legacy field - Price in USD for 60-minute session (kept for backward compatibility)
    oneOnOnePrice: v.optional(v.number()), // Price for 1-on-1 sessions per hour
    groupSessionPrice: v.optional(v.number()), // Price for group sessions per person per hour
    aboutUser: v.string(),
    xLink: v.optional(v.string()),
    linkedInLink: v.optional(v.string()),
    offerDescription: v.string(), // What users can learn
    openHours: v.object({
      monday: v.object({ start: v.string(), end: v.string(), available: v.boolean() }),
      tuesday: v.object({ start: v.string(), end: v.string(), available: v.boolean() }),
      wednesday: v.object({ start: v.string(), end: v.string(), available: v.boolean() }),
      thursday: v.object({ start: v.string(), end: v.string(), available: v.boolean() }),
      friday: v.object({ start: v.string(), end: v.string(), available: v.boolean() }),
      saturday: v.object({ start: v.string(), end: v.string(), available: v.boolean() }),
      sunday: v.object({ start: v.string(), end: v.string(), available: v.boolean() })
    }),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  }).index("by_user", ["userId"])
    .index("by_specialization", ["specialization"])
    .index("by_job_title", ["jobTitle"])
    .index("by_active", ["isActive"]),

  // ✅ Bookings table
  bookings: defineTable({
    providerId: v.id("users"), // The service provider
    clientId: v.id("users"), // The person booking
    sessionDate: v.string(), // YYYY-MM-DD format
    sessionTime: v.string(), // HH:MM format
    duration: v.number(), // Duration in minutes (default 60)
    totalAmount: v.number(), // Total price paid
    status: v.string(), // PENDING | CONFIRMED | CANCELLED | COMPLETED
    paymentTxHash: v.optional(v.string()),
    sessionDetails: v.optional(v.string()), // Meeting link or instructions
    confirmationType: v.string(), // AUTOMATIC | MANUAL
    // New fields for 1-to-many bookings
    sessionType: v.string(), // "ONE_ON_ONE" | "ONE_TO_MANY"
    eventId: v.optional(v.id("events")), // Reference to event for 1-to-many bookings
    // LiveKit streaming fields
    liveStreamRoomName: v.optional(v.string()), // LiveKit room name
    liveStreamStatus: v.optional(v.string()), // "NOT_STARTED" | "LIVE" | "ENDED"
    recordingId: v.optional(v.string()), // LiveKit recording ID
    recordingUrl: v.optional(v.string()), // URL to recorded session
    recordingStorageId: v.optional(v.string()), // Convex storage ID for recording
    uploadedToReels: v.optional(v.boolean()), // Whether recording was uploaded to reels
    reelId: v.optional(v.id("reels")), // Reference to created reel
    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  }).index("by_provider", ["providerId"])
    .index("by_client", ["clientId"])
    .index("by_date", ["sessionDate"])
    .index("by_status", ["status"])
    .index("by_provider_date", ["providerId", "sessionDate"])
    .index("by_event", ["eventId"])
    .index("by_session_type", ["sessionType"])
    .index("by_stream_status", ["liveStreamStatus"])
    .index("by_room_name", ["liveStreamRoomName"]),

  // ✅ Events table for 1-to-many bookings
  events: defineTable({
    providerId: v.id("users"), // The service provider creating the event
    title: v.string(), // Event title
    description: v.string(), // Event description
    sessionDate: v.string(), // YYYY-MM-DD format
    sessionTime: v.string(), // HH:MM format
    duration: v.number(), // Duration in minutes
    maxParticipants: v.number(), // Maximum number of participants
    currentParticipants: v.number(), // Current number of bookings
    pricePerPerson: v.number(), // Price per participant
    status: v.string(), // "ACTIVE" | "CANCELLED" | "COMPLETED" | "FULL"
    sessionDetails: v.optional(v.string()), // Meeting link or instructions
    tags: v.optional(v.array(v.string())), // Event tags/categories
    isPublic: v.boolean(), // Whether event is publicly visible
    // LiveKit streaming fields
    liveStreamRoomName: v.optional(v.string()), // LiveKit room name
    liveStreamStatus: v.optional(v.string()), // "NOT_STARTED" | "LIVE" | "ENDED"
    recordingId: v.optional(v.string()), // LiveKit recording ID
    recordingUrl: v.optional(v.string()), // URL to recorded session
    recordingStorageId: v.optional(v.string()), // Convex storage ID for recording
    uploadedToReels: v.optional(v.boolean()), // Whether recording was uploaded to reels
    reelId: v.optional(v.id("reels")), // Reference to created reel
    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  }).index("by_provider", ["providerId"])
    .index("by_date", ["sessionDate"])
    .index("by_status", ["status"])
    .index("by_provider_date", ["providerId", "sessionDate"])
    .index("by_public", ["isPublic"])
    .index("by_tags", ["tags"])
    .index("by_stream_status", ["liveStreamStatus"])
    .index("by_room_name", ["liveStreamRoomName"]),

  // ✅ Booking Settings table
  bookingSettings: defineTable({
    userId: v.id("users"), // Provider's user ID
    confirmationType: v.string(), // AUTOMATIC | MANUAL
    bufferTime: v.number(), // Minutes between sessions (default 15)
    maxAdvanceBooking: v.number(), // Days in advance (default 30)
    cancellationPolicy: v.string(), // Hours before session (default 24)
    sessionInstructions: v.optional(v.string()), // Default meeting instructions
    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  }).index("by_user", ["userId"]),

  // ✅ Chat Conversations table
  chatConversations: defineTable({
    participants: v.array(v.id("users")), // Array of user IDs in the chat
    lastMessageId: v.optional(v.id("chatMessages")), // Reference to the last message
    lastActivity: v.number(), // Timestamp of last message/activity
    isActive: v.boolean(), // Whether the chat is active
    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  }).index("by_participant", ["participants"])
    .index("by_last_activity", ["lastActivity"])
    .index("by_active", ["isActive"]),

  // ✅ Chat Messages table
  chatMessages: defineTable({
    conversationId: v.id("chatConversations"),
    senderId: v.id("users"),
    messageType: v.string(), // "text" | "image" | "emoji"
    content: v.string(), // Message content (text, image storage ID, or emoji)
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    createdAt: v.number()
  }).index("by_conversation", ["conversationId"])
    .index("by_sender", ["senderId"])
    .index("by_conversation_created", ["conversationId", "createdAt"])
    .index("by_read_status", ["isRead"]),

  // ✅ Chat Privacy Settings table
  chatPrivacySettings: defineTable({
    userId: v.id("users"),
    whoCanMessage: v.string(), // "everyone" | "followers" | "following" | "mutual_follows" | "none"
    allowMessagesFromArticles: v.boolean(), // Allow messages from article viewers
    allowMessagesFromBookings: v.boolean(), // Allow messages from booking clients/providers
    autoAcceptFromFollowing: v.boolean(), // Auto-accept conversations from people you follow
    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  }).index("by_user", ["userId"])
});
