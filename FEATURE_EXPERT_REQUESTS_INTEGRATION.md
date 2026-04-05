# Feature: Expert Requests Integration with Booking Screen

## Overview
Integrated Expert Requests into the Booking Screen so experts can easily discover and apply to opportunities without having to search through circles.

## Problem Solved
Previously, expert requests were only visible within the circle where they were created. This meant:
- Experts had to actively search through circles to find opportunities
- Many experts might miss relevant requests
- The feature was hidden and underutilized

## Solution
Added Expert Requests as a new section in the Booking Screen, below Available Events, making them easily discoverable to all potential experts.

## Implementation

### 1. Backend Query (`convex/expertRequests.ts`)

Created `getAllOpenExpertRequests` query that:
- Returns all open expert requests across all circles
- Includes circle information for context
- Shows requester profile details
- Tracks application count
- Checks if current user already applied
- Shows user's application status if applied
- Supports pagination

```typescript
export const getAllOpenExpertRequests = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Returns all OPEN expert requests with full details
  }
});
```

### 2. Expert Requests List Component (`ExpertRequestsList.tsx`)

A new component that displays expert requests in a card grid:

**Features:**
- Card-based layout matching the booking screen design
- Shows request title, description, budget, and duration
- Displays circle name for context
- Shows application count
- Tags for categorization
- "Apply Now" button for new requests
- "Applied" status for requests user already applied to
- Application modal with cover letter and proposed amount

**Application Modal:**
- Full request details
- Cover letter textarea (required)
- Optional proposed amount (for negotiation)
- Budget and duration display
- Submit/Cancel actions

### 3. Booking Screen Integration (`BookingScreen.tsx`)

Added Expert Requests section:
- Positioned below "Available Events"
- Consistent styling with other sections
- Section header with description
- Uses ExpertRequestsList component

## User Flow

### For Experts (Viewing Requests)
1. Navigate to Booking Screen
2. Scroll past Available Experts and Available Events
3. See "Expert Requests" section
4. Browse all open requests from all circles
5. Click "Apply Now" on interesting requests
6. Fill out application modal
7. Submit application

### For Circle Admins (Creating Requests)
1. Go to Community tab
2. Open their circle
3. Navigate to Expert Requests
4. Create new request
5. Request automatically appears in Booking Screen for all experts

### Application Process
1. Expert sees request in Booking Screen
2. Clicks "Apply Now"
3. Modal opens with request details
4. Expert writes cover letter
5. Optionally proposes different amount
6. Submits application
7. Circle admin reviews in circle's Expert Requests section
8. Admin accepts one application
9. Request status changes to "IN_PROGRESS"

## Data Structure

### Expert Request Card Shows:
- **Title** - Request headline
- **Circle Name** - Which circle posted it
- **Budget** - Amount and currency
- **Duration** - Expected hours (if specified)
- **Description** - What's needed (truncated)
- **Tags** - Categorization (up to 3 shown)
- **Application Count** - How many applied
- **Status** - Applied/Pending/Not Applied

### Application Modal Shows:
- Full request details
- Budget and duration
- Complete description
- Cover letter input
- Proposed amount input (optional)
- Submit/Cancel buttons

## Features

### Discovery
- ✅ All open requests visible in one place
- ✅ No need to search through circles
- ✅ Familiar location (Booking Screen)
- ✅ Consistent with other booking features

### Application
- ✅ One-click apply from card
- ✅ Detailed application modal
- ✅ Cover letter required
- ✅ Optional amount negotiation
- ✅ Clear submission feedback

### Status Tracking
- ✅ Shows if already applied
- ✅ Displays application status
- ✅ Prevents duplicate applications
- ✅ Application count visible

### Context
- ✅ Circle name shown
- ✅ Requester information
- ✅ Tags for categorization
- ✅ Duration and budget clear

## UI/UX

### Layout
- Grid layout (3 columns on desktop, responsive)
- Card-based design matching events
- Hover effects for interactivity
- Clear visual hierarchy

### Colors
- Accent color for budget amounts
- Gray for metadata
- Green for applied status
- Standard button colors

### Responsive
- Mobile-friendly cards
- Touch-friendly buttons
- Scrollable modal
- Adaptive grid

## Permissions

### Who Can See Expert Requests
- ✅ All authenticated users
- ✅ Visible in Booking Screen
- ✅ No circle membership required to view

### Who Can Apply
- ✅ Any authenticated user
- ✅ Must be circle member to apply (enforced by backend)
- ✅ Can only apply once per request
- ✅ Cannot apply to own requests

### Who Can Create
- ✅ Circle creators
- ✅ Circle admins
- ✅ Created within circle context

## Backend Validation

### Query Security
- Authentication required
- Returns only OPEN requests
- Filters by status automatically
- Includes user-specific data (applied status)

### Application Security
- Must be circle member
- Cannot apply twice
- Cannot apply to closed requests
- Cover letter required

## Integration Points

### With Circles
- Requests created in circles
- Applications reviewed in circles
- Circle context maintained
- Member verification enforced

### With Bookings
- Displayed in Booking Screen
- Consistent UI/UX
- Same navigation patterns
- Familiar user experience

## Testing Checklist

### Display
- [x] Expert requests appear in Booking Screen
- [x] Cards show all required information
- [x] Grid layout responsive
- [x] Empty state shows when no requests

### Application
- [x] Apply button opens modal
- [x] Modal shows full details
- [x] Cover letter required
- [x] Proposed amount optional
- [x] Submit creates application
- [x] Success message shown

### Status
- [x] Applied status shows correctly
- [x] Application count updates
- [x] Cannot apply twice
- [x] Status persists across sessions

### Integration
- [x] Requests from all circles shown
- [x] Circle name displayed
- [x] Requester info included
- [x] Tags displayed

## Future Enhancements

### Potential Features
1. **Filtering** - By budget, duration, tags, circle
2. **Sorting** - By date, budget, applications
3. **Search** - Find specific requests
4. **Notifications** - Alert when new requests posted
5. **Saved Requests** - Bookmark interesting requests
6. **Application History** - View all past applications
7. **Recommendations** - Suggest relevant requests
8. **Categories** - Group by expertise area

## Related Files
- `convex/expertRequests.ts` - Backend query
- `src/components/ExpertRequestsList.tsx` - Display component
- `src/components/BookingScreen.tsx` - Integration point
- `src/components/ExpertRequestsView.tsx` - Circle view (existing)

## Impact
- ✅ Expert requests now discoverable
- ✅ Experts don't need to search circles
- ✅ Increased visibility for requests
- ✅ Better user experience
- ✅ Consistent with booking flow
- ✅ Easy application process

## Notes
- Expert requests remain manageable within circles
- Admins review applications in circle context
- This is a discovery feature, not a replacement
- Circle membership still required to apply (backend enforced)
- Maintains separation between circles and bookings while improving discoverability
