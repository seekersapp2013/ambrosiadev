// Permission constants for the moderation system
export const PERMISSIONS = {
  APPROVE_ARTICLES: 'approve_articles',
  APPROVE_REELS: 'approve_reels',
  APPROVE_CIRCLES: 'approve_circles',
  APPROVE_EXPERTS: 'approve_experts',
  APPROVE_BOOKING_SUBSCRIBERS: 'approve_booking_subscribers',
  DELETE_CONTENT: 'delete_content',
  BAN_USERS: 'ban_users',
  MANAGE_ROLES: 'manage_roles',
  VIEW_REPORTS: 'view_reports',
  ASSIGN_ADMINS: 'assign_admins',
  MANAGE_MODERATION_SETTINGS: 'manage_moderation_settings',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Content types that can require approval
export const CONTENT_TYPES = {
  ARTICLES: 'articles',
  REELS: 'reels',
  CIRCLES: 'circles',
  EXPERT_REQUESTS: 'expertRequests',
  BOOKING_SUBSCRIBERS: 'bookingSubscribers',
} as const;

export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];

// Approval statuses
export const APPROVAL_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  NOT_REQUIRED: 'NOT_REQUIRED',
} as const;

export type ApprovalStatus = typeof APPROVAL_STATUS[keyof typeof APPROVAL_STATUS];

// Moderation action types
export const MODERATION_ACTIONS = {
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  DELETE: 'DELETE',
  BAN: 'BAN',
  UNBAN: 'UNBAN',
  ASSIGN_ROLE: 'ASSIGN_ROLE',
  REMOVE_ROLE: 'REMOVE_ROLE',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  CREATE_ROLE: 'CREATE_ROLE',
  DELETE_ROLE: 'DELETE_ROLE',
} as const;

export type ModerationAction = typeof MODERATION_ACTIONS[keyof typeof MODERATION_ACTIONS];

// Ban types
export const BAN_TYPES = {
  TEMPORARY: 'TEMPORARY',
  PERMANENT: 'PERMANENT',
} as const;

export type BanType = typeof BAN_TYPES[keyof typeof BAN_TYPES];

// Helper function to get all permissions as an array
export const getAllPermissions = (): Permission[] => {
  return Object.values(PERMISSIONS);
};

// Helper function to get all content types as an array
export const getAllContentTypes = (): ContentType[] => {
  return Object.values(CONTENT_TYPES);
};

// Permission descriptions for UI
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  [PERMISSIONS.APPROVE_ARTICLES]: 'Can approve or reject article submissions',
  [PERMISSIONS.APPROVE_REELS]: 'Can approve or reject reel submissions',
  [PERMISSIONS.APPROVE_CIRCLES]: 'Can approve or reject circle creation requests',
  [PERMISSIONS.APPROVE_EXPERTS]: 'Can approve or reject expert request submissions',
  [PERMISSIONS.APPROVE_BOOKING_SUBSCRIBERS]: 'Can approve or reject users becoming experts/providers',
  [PERMISSIONS.DELETE_CONTENT]: 'Can delete any content (articles, reels, circles, etc.)',
  [PERMISSIONS.BAN_USERS]: 'Can ban or unban users from the platform',
  [PERMISSIONS.MANAGE_ROLES]: 'Can create, edit, and delete moderation roles',
  [PERMISSIONS.VIEW_REPORTS]: 'Can view moderation reports and analytics',
  [PERMISSIONS.ASSIGN_ADMINS]: 'Can assign other users as administrators',
  [PERMISSIONS.MANAGE_MODERATION_SETTINGS]: 'Can configure which features require approval',
};

// Content type display names
export const CONTENT_TYPE_NAMES: Record<ContentType, string> = {
  [CONTENT_TYPES.ARTICLES]: 'Articles',
  [CONTENT_TYPES.REELS]: 'Reels',
  [CONTENT_TYPES.CIRCLES]: 'Circles',
  [CONTENT_TYPES.EXPERT_REQUESTS]: 'Expert Requests',
  [CONTENT_TYPES.BOOKING_SUBSCRIBERS]: 'Expert Profiles',
};
