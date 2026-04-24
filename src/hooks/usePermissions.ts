import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// Hook to get current user's roles
export function useUserRoles() {
  const roles = useQuery(api.moderation.getMyRoles);
  return roles || [];
}

// Hook to check if user has a specific permission
export function useHasPermission(permission: string) {
  const roles = useUserRoles();
  
  if (!roles || roles.length === 0) {
    return false;
  }

  return roles.some((role: any) => role.permissions.includes(permission));
}

// Hook to check if user can approve a specific content type
export function useCanApprove(contentType: string) {
  const roles = useUserRoles();
  
  if (!roles || roles.length === 0) {
    return false;
  }

  return roles.some((role: any) => role.canApprove.includes(contentType));
}

// Hook to check if user is primary admin
export function useIsPrimaryAdmin() {
  const isPrimaryAdmin = useQuery(api.moderation.amIPrimaryAdmin);
  return isPrimaryAdmin || false;
}

// Hook to check if user is admin (primary admin or has admin role)
export function useIsAdmin() {
  const isAdmin = useQuery(api.moderation.amIAdmin);
  return isAdmin || false;
}

// Hook to check if user is moderator (has any moderation role)
export function useIsModerator() {
  const isModerator = useQuery(api.moderation.amIModerator);
  return isModerator || false;
}

// Hook to get user's permissions (aggregated from all roles)
export function useUserPermissions() {
  const roles = useUserRoles();
  
  if (!roles || roles.length === 0) {
    return [];
  }

  const permissions = new Set<string>();
  roles.forEach((role: any) => {
    role.permissions.forEach((p: string) => permissions.add(p));
  });

  return Array.from(permissions);
}

// Hook to get moderation queue count
export function useModerationQueueCount(contentType?: string) {
  const count = useQuery(
    api.moderationActions.getModerationQueueCount,
    contentType ? { contentType } : {}
  );
  return count || 0;
}

// Hook to get all pending content for current user
export function useMyPendingContent() {
  const pendingContent = useQuery(api.moderationQueries.getAllMyPendingContent);
  return pendingContent || {
    articles: [],
    reels: [],
    circles: [],
    expertRequests: [],
    bookingSubscriber: null,
    totalPending: 0,
  };
}
