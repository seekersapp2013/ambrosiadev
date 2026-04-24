# Approval Workflow Fix

## Issue
Approved articles were not showing in the feed (For You, Learn tabs) after being approved by moderators.

## Root Cause
When content was approved via `moderationActions.approveContent()`, the system was only updating the `contentApprovals` table but NOT updating the actual content item (article, reel, etc.) itself. This meant:

1. Articles remained in "DRAFT" status instead of "PUBLISHED"
2. Articles had `approvalStatus: "PENDING"` instead of "APPROVED"
3. Feed queries filtered out these articles because they weren't marked as approved

## Fix Applied

### 1. Updated `convex/moderationActions.ts` - `approveContent` mutation

**Added logic to update the actual content items:**

```typescript
// For Articles:
- Set status to "PUBLISHED"
- Set publishedAt timestamp
- Set approvalStatus to "APPROVED"
- Add approvedBy, approvedByRole, approvedAt fields
- Notify followers about the new content

// For Reels:
- Set approvalStatus to "APPROVED"
- Add approvedBy, approvedByRole, approvedAt fields
- Notify followers about the new content

// For Circles:
- Set approvalStatus to "APPROVED"
- Add approval metadata

// For Expert Requests:
- Set status to "OPEN" (from "PENDING")
- Set approvalStatus to "APPROVED"

// For Booking Subscribers:
- Set isActive to true
- Set approvalStatus to "APPROVED"
```

### 2. Updated `convex/moderationActions.ts` - `rejectContent` mutation

**Added logic to update rejected content:**

```typescript
// For all content types:
- Set approvalStatus to "REJECTED"
- Add rejectionReason field
- For articles: Keep in DRAFT status
- For expert requests: Set status to "CANCELLED"
- For booking subscribers: Set isActive to false
```

### 3. Added Follower Notifications

When content is approved, the system now:
1. Finds all followers of the content creator
2. Sends NEW_CONTENT notifications to each follower
3. This ensures followers are notified when approved content is published

## How It Works Now

### Content Creation Flow:
1. User creates content (article/reel/etc.)
2. System checks if approval is required
3. If YES:
   - Content status = "DRAFT" (for articles) or initial status
   - approvalStatus = "PENDING"
   - Creates contentApprovals record
4. If NO:
   - Content status = "PUBLISHED" (for articles)
   - approvalStatus = "NOT_REQUIRED"
   - Notifies followers immediately

### Approval Flow:
1. Moderator approves content
2. System updates contentApprovals table
3. **NEW:** System updates the actual content item:
   - Changes status to PUBLISHED (articles)
   - Sets approvalStatus to APPROVED
   - Adds approval metadata
4. **NEW:** Notifies all followers
5. Content now appears in feed

### Feed Query Logic:
The feed queries filter for:
```typescript
status === "PUBLISHED" AND (
  approvalStatus === "APPROVED" OR
  approvalStatus === "NOT_REQUIRED" OR
  approvalStatus === undefined  // backward compatibility
)
```

## Testing Checklist

- [x] Create article with approval required
- [x] Article shows as PENDING in moderation queue
- [x] Approve article
- [x] Article status changes to PUBLISHED
- [x] Article approvalStatus changes to APPROVED
- [x] Article appears in feed
- [x] Followers receive notification
- [x] Disable approval requirement
- [x] Create new article
- [x] Article publishes immediately with NOT_REQUIRED status
- [x] Article appears in feed
- [x] Re-enable approval requirement
- [x] System works correctly

## Backward Compatibility

The system maintains backward compatibility by:
1. Checking for `approvalStatus === undefined` in feed queries
2. This ensures old content (created before moderation system) still shows
3. New content will always have an approvalStatus set

## Files Modified

1. `convex/moderationActions.ts`
   - Updated `approveContent` mutation
   - Updated `rejectContent` mutation
   - Added follower notifications
   - Added internal API import

## Result

✅ Approved content now appears in feed immediately
✅ Followers are notified when content is approved
✅ Content without approval requirement works seamlessly
✅ Rejected content is properly marked
✅ System maintains backward compatibility
