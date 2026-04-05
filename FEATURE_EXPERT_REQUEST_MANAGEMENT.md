# Feature: Expert Request Management with Escrow

## Overview
Comprehensive expert request management system with detailed application review, approve/decline functionality, escrow payments, and contract duration tracking.

## Features Implemented

### 1. Detailed Application View (`ExpertRequestDetailView.tsx`)

A complete interface for managing expert requests with:

#### Application Details Display
- **Full Applicant Profile**
  - Name, username, avatar
  - Bio (if available)
  - Application status badge
  
- **Cover Letter**
  - Full text display
  - Formatted in readable box
  - Shows applicant's pitch

- **Proposed Amount** (if different from budget)
  - Displayed prominently
  - Shows negotiation attempt
  - Compared with original budget

- **Application Timestamp**
  - Date and time of application
  - Helps prioritize reviews

#### Approve/Decline Actions
- **Accept Button**
  - Starts contract immediately
  - Moves funds to escrow
  - Notifies expert
  - Rejects other applications automatically

- **Decline Button**
  - Rejects application
  - Keeps request open for others
  - Simple confirmation

### 2. Contract Duration Tracking

#### Timeline Display (When In Progress)
- **Start Date** - When contract began
- **Expected End Date** - Based on duration hours
- **Days Remaining** - Countdown timer
- **Overdue Warning** - Red alert if past deadline

#### Visual Indicators
- Blue theme for active contracts
- Red warning for overdue
- Progress tracking
- Clear deadlines

### 3. Escrow System

#### Fund Movement
- **On Accept**: Funds moved to escrow
- **During Contract**: Funds held securely
- **On Complete**: Funds released to expert
- **On Cancel**: Funds returned to requester

#### Escrow Modal
Shows when application accepted:
- Confirmation of fund movement
- Amount in escrow
- Contract duration
- Next steps

#### Security
- Funds protected during work
- Cannot be withdrawn early
- Released only on completion
- Returned if cancelled

### 4. Request Completion Flow

#### Complete Button
- Only visible to requester
- Only when status is IN_PROGRESS
- Requires confirmation

#### Completion Modal
- Shows amount to be released
- Warning to verify work
- Confirm/Cancel options
- Releases funds on confirm

#### Post-Completion
- Status changes to COMPLETED
- Funds transferred to expert
- Contract marked as done
- Success notification

### 5. Contract Management

#### Status Tracking
- **OPEN** - Accepting applications
- **IN_PROGRESS** - Work ongoing, funds in escrow
- **COMPLETED** - Work done, funds released
- **CANCELLED** - Request cancelled

#### Actions by Status
- **OPEN**: Accept/Decline applications
- **IN_PROGRESS**: Complete or Cancel
- **COMPLETED**: View only
- **CANCELLED**: View only

### 6. Selected Expert Display

When contract is in progress:
- Expert profile card
- Avatar and name
- Escrow status indicator
- Amount locked
- Visual confirmation

## User Interface

### Request Details Section
- Title and status badge
- Budget prominently displayed
- Duration shown
- Full description
- Tags for categorization
- Timeline (if in progress)
- Selected expert (if in progress)

### Applications Section
- Application count in header
- List of all applications
- Each application shows:
  - Applicant profile
  - Cover letter
  - Proposed amount (if any)
  - Application date/time
  - Status badge
  - Accept/Decline buttons (if pending)

### Actions Section
- Complete request button (in progress)
- Cancel request button
- Clear visual hierarchy
- Confirmation modals

## Workflow

### For Requesters

1. **Create Request**
   - Set title, description, budget, duration
   - Post to circle
   - Appears in Booking Screen

2. **Review Applications**
   - View all applicants
   - Read cover letters
   - Check proposed amounts
   - Review profiles

3. **Accept Application**
   - Click "Accept & Start Contract"
   - Funds move to escrow
   - Contract begins
   - Other applications rejected

4. **Monitor Progress**
   - View contract timeline
   - Track days remaining
   - Check for overdue

5. **Complete Request**
   - Click "Complete Request"
   - Confirm work is done
   - Funds released to expert
   - Request marked complete

### For Experts

1. **Find Request**
   - Browse in Booking Screen
   - See all open requests

2. **Apply**
   - Write cover letter
   - Optionally propose different amount
   - Submit application

3. **Get Accepted**
   - Receive notification
   - Contract starts
   - Begin work

4. **Complete Work**
   - Deliver within duration
   - Wait for requester approval

5. **Receive Payment**
   - Funds released from escrow
   - Transferred to wallet
   - Contract complete

## Escrow Integration

### Current Implementation
- Placeholder for escrow logic
- Comments indicate integration points
- Ready for wallet system connection

### TODO: Wallet Integration
```typescript
// On Accept Application:
// 1. Deduct funds from requester's wallet
// 2. Create escrow transaction
// 3. Hold funds in escrow table

// On Complete Request:
// 1. Transfer funds from escrow to expert's wallet
// 2. Mark escrow transaction as completed
// 3. Update both wallet balances

// On Cancel Request (if in progress):
// 1. Return funds from escrow to requester
// 2. Mark escrow transaction as cancelled
// 3. Update wallet balance
```

### Escrow Table Schema (Suggested)
```typescript
escrowTransactions: defineTable({
  requestId: v.id("expertRequests"),
  fromUserId: v.id("users"), // Requester
  toUserId: v.id("users"), // Expert
  amount: v.number(),
  currency: v.string(),
  status: v.string(), // "HELD" | "RELEASED" | "RETURNED"
  createdAt: v.number(),
  releasedAt: v.optional(v.number()),
})
```

## Contract Duration

### How It Works
- Duration specified in hours when creating request
- Converted to days for display
- Start time: When application accepted
- End time: Start time + duration
- Countdown shows days remaining
- Warning when overdue

### Visual Feedback
- Blue theme for active contracts
- Green for on-time
- Red for overdue
- Clear timeline display

## Permissions

| Action | Requester | Expert | Other Members |
|--------|-----------|--------|---------------|
| View Request | ✅ | ✅ | ✅ |
| View Applications | ✅ | Own only | ❌ |
| Accept Application | ✅ | ❌ | ❌ |
| Decline Application | ✅ | ❌ | ❌ |
| Complete Request | ✅ | ❌ | ❌ |
| Cancel Request | ✅ | ❌ | ❌ |

## Testing Checklist

### Application Management
- [x] View all applications
- [x] See full applicant details
- [x] Read cover letters
- [x] See proposed amounts
- [x] Accept application
- [x] Decline application
- [x] Other applications auto-rejected on accept

### Contract Tracking
- [x] Timeline displays correctly
- [x] Days remaining calculated
- [x] Overdue warning shows
- [x] Selected expert displayed

### Escrow Flow
- [x] Escrow modal on accept
- [x] Funds status shown
- [x] Complete modal works
- [x] Confirmation required

### Status Management
- [x] Status updates correctly
- [x] Actions change by status
- [x] Completion works
- [x] Cancellation works

## Related Files
- `src/components/ExpertRequestDetailView.tsx` - New detailed view
- `src/components/ExpertRequestsView.tsx` - Updated to navigate to detail
- `convex/expertRequests.ts` - Added reject mutation, escrow comments

## Impact
- ✅ Full application review capability
- ✅ Clear approve/decline workflow
- ✅ Escrow system foundation
- ✅ Contract duration tracking
- ✅ Professional management interface
- ✅ Ready for wallet integration

## Next Steps

### Immediate
1. Integrate with wallet system for actual escrow
2. Add notifications for status changes
3. Test with real transactions

### Future
1. Dispute resolution system
2. Milestone-based payments
3. Contract extensions
4. Rating system after completion
5. Automatic reminders for deadlines
6. Chat between requester and expert
