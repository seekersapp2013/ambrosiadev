# Quick Fix Guide - Content Not Showing

## Problem
✗ Approved content not showing in feeds
✗ Empty "For You" tab
✗ Empty "Learn" tab

## Solution (3 Steps)

### Step 1: Run Migration
```bash
npx convex run migrations/approveAllExistingContent:run
```

This approves ALL existing content in your database.

### Step 2: Verify Migration
Check the output for:
```
✨ Migration complete!
📊 Summary: { totalUpdated: X }
✅ Successfully approved X items!
```

### Step 3: Test
1. Refresh your app
2. Check "For You" tab → Should show articles and reels
3. Check "Learn" tab → Should show courses
4. Check "Community" tab → Should show circles

## If Still Not Working

### Check 1: Content Status
In Convex dashboard, check an article:
```javascript
{
  status: "PUBLISHED",  // ✅ Must be PUBLISHED
  approvalStatus: "APPROVED",  // ✅ Must be APPROVED or NOT_REQUIRED
  isPublic: true  // ✅ Must be true or undefined
}
```

### Check 2: Run Migration Again
```bash
npx convex run migrations/approveAllExistingContent:run
```
Safe to run multiple times.

### Check 3: Check Browser Console
Look for errors in browser console (F12).

## New Content Not Showing?

### If Approval is ENABLED:
1. Go to Profile → Admin Dashboard
2. Click "Queue" tab
3. Find your content
4. Click "Approve"
5. Content will now show in feed

### If Approval is DISABLED:
Content should show immediately. If not:
1. Check moderation settings
2. Ensure approval is actually disabled for that content type
3. Check browser console for errors

## Quick Commands

```bash
# Run migration (MAIN COMMAND)
npx convex run migrations/approveAllExistingContent:run

# Check Convex logs
npx convex logs

# Deploy latest code
npx convex deploy

# Generate types
npx convex codegen
```

## What Changed

### Feed Queries (STRICT MODE)
```typescript
// OLD (Backward compatible)
approvalStatus === "APPROVED" OR
approvalStatus === "NOT_REQUIRED" OR
approvalStatus === undefined  // ← Removed

// NEW (Strict)
approvalStatus === "APPROVED" OR
approvalStatus === "NOT_REQUIRED"
```

### Approval Process
```typescript
// OLD
✗ Only updated contentApprovals table

// NEW
✅ Updates contentApprovals table
✅ Updates actual content item
✅ Sets status to PUBLISHED
✅ Sets approvalStatus to APPROVED
✅ Notifies followers
```

## Emergency Rollback

If you need to show all content immediately:

1. Go to Admin Dashboard → Settings
2. Disable approval for all content types
3. Run this in Convex dashboard:

```javascript
// Set all content to NOT_REQUIRED
// (Run as internal mutation)
const articles = await ctx.db.query("articles").collect();
for (const article of articles) {
  await ctx.db.patch(article._id, {
    approvalStatus: "NOT_REQUIRED",
    status: "PUBLISHED"
  });
}
```

## Support Checklist

- [ ] Ran migration
- [ ] Verified migration output
- [ ] Checked content status in database
- [ ] Checked browser console
- [ ] Tested with approval disabled
- [ ] Tested with approval enabled
- [ ] Checked moderation settings

## Contact

If still having issues:
1. Check `MIGRATION_APPROVE_ALL_CONTENT.md` for detailed guide
2. Check `STRICT_APPROVAL_IMPLEMENTATION.md` for technical details
3. Check browser console and Convex logs for errors
