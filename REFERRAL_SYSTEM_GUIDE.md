# Expert Referral System - Implementation Guide

## Overview
The referral system allows healthcare experts to refer patients to other specialists when they need care outside their expertise. The referring expert earns a 10% commission when the patient completes a session with the selected expert.

## User Flow

### 1. Expert Creates Referral (After Completed Session)
**Location:** Booking Management → Provider Bookings → Completed Bookings

**Steps:**
1. Expert views their completed bookings
2. Clicks "Refer Patient" button on a completed booking
3. Fills out referral form:
   - Title (e.g., "Gynecology Consultation Needed")
   - Health Note (private, only visible to selected expert)
   - Search and select minimum 3 experts
4. Submits referral

**Backend:** `convex/referrals.ts` → `createReferral`

### 2. Patient Views Referrals
**Location:** Booking Screen → My Referrals

**Steps:**
1. Patient sees list of received referrals
2. Each referral shows:
   - Title and referring expert info
   - 3+ expert options with profiles and pricing
   - Status (PENDING, ACCEPTED, COMPLETED, DECLINED)
3. Patient can:
   - Select an expert and proceed to booking
   - Decline all suggestions with optional reason

**Backend:** `convex/referrals.ts` → `getPatientReferrals`

### 3. Patient Selects Expert & Books
**Steps:**
1. Patient clicks "Select & Book" on chosen expert
2. System marks referral as ACCEPTED
3. Patient proceeds through normal booking flow:
   - Select date/time from calendar
   - Complete payment
4. Booking is automatically linked to referral

**Backend:** 
- `convex/referrals.ts` → `selectExpertFromReferral`
- `convex/referrals.ts` → `linkBookingToReferral`

### 4. Commission Payment (Automatic)
**Trigger:** When provider stops the session (marks as completed)

**Process:**
1. Session ends and booking status → COMPLETED
2. System checks if booking is linked to referral
3. If yes:
   - Calculate 10% commission from booking amount
   - Add commission to referring expert's wallet
   - Create transaction record
   - Mark referral as COMPLETED with commission paid

**Backend:** `convex/bookings.ts` → `stopSession` (inline commission logic)

### 5. Expert Views Referral Status
**Location:** Booking Screen → Referral Management

**Two Views:**
- **Sent Referrals:** Track referrals you created
  - See patient selection
  - Track commission earned
  - View referral status
  
- **Received Referrals:** Referrals where you were selected
  - View patient info
  - See health notes from referring expert
  - Track booking status

**Backend:** 
- `convex/referrals.ts` → `getReferringExpertReferrals`
- `convex/referrals.ts` → `getSelectedExpertReferrals`

## Database Schema

### Referrals Table
```typescript
{
  referringExpertId: Id<"users">,      // Expert making referral
  patientId: Id<"users">,              // Patient being referred
  title: string,                        // Referral title
  healthNote: string,                   // Private health notes
  suggestedExperts: Id<"users">[],     // 3+ suggested experts
  selectedExpertId?: Id<"users">,      // Expert chosen by patient
  status: "PENDING" | "ACCEPTED" | "COMPLETED" | "DECLINED",
  bookingId?: Id<"bookings">,          // Linked booking
  commissionRate: 0.10,                 // 10% commission
  commissionAmount?: number,            // Calculated commission
  commissionCurrency?: string,          // Currency code
  commissionPaid: boolean,              // Payment status
  commissionTxId?: string,              // Transaction ID
  declineReason?: string,               // If declined
  createdAt: number,
  updatedAt?: number,
  completedAt?: number
}
```

## Key Features

✅ **Privacy:** Health notes only visible to selected expert
✅ **Choice:** Patient must choose from 3+ expert options
✅ **Automatic Commission:** 10% paid automatically when session completes
✅ **Multi-Currency:** Works with all supported wallet currencies
✅ **Tracking:** Full referral lifecycle tracking
✅ **Integrated:** Seamlessly integrated with existing booking system

## API Functions

### Mutations
- `createReferral` - Create new referral (experts only)
- `selectExpertFromReferral` - Patient selects expert
- `declineReferral` - Patient declines referral
- `linkBookingToReferral` - Link booking to referral
- `completeReferralWithCommission` - Pay commission (can be called manually)

### Queries
- `getPatientReferrals` - Get referrals for patient
- `getReferringExpertReferrals` - Get referrals created by expert
- `getSelectedExpertReferrals` - Get referrals where expert was selected
- `getReferralById` - Get single referral with access control

## UI Components

### Created Components
1. **ReferralCreationForm.tsx** - Form to create referrals
2. **PatientReferralsList.tsx** - Patient view of referrals
3. **ExpertReferralsList.tsx** - Expert management view

### Modified Components
1. **BookingScreen.tsx** - Added referral navigation buttons
2. **BookingManagement.tsx** - Added "Refer Patient" button
3. **BookingPaymentFlow.tsx** - Handles referral linking
4. **BookingConfirmation.tsx** - Links booking to referral
5. **bookings.ts** - Auto-completes referral on session end

## Business Rules

1. **Minimum Experts:** Must suggest at least 3 experts
2. **Self-Referral:** Cannot refer patient to yourself
3. **Active Providers:** Only active providers can be suggested
4. **Commission Rate:** Fixed at 10% of booking amount
5. **Payment Timing:** Commission paid when session completes
6. **Privacy:** Health notes only visible to selected expert
7. **Patient Choice:** Patient can decline all suggestions

## Testing Checklist

- [ ] Expert can create referral after completed booking
- [ ] Referral requires minimum 3 experts
- [ ] Patient sees referrals in "My Referrals"
- [ ] Patient can select expert and book session
- [ ] Patient can decline referral
- [ ] Booking links to referral correctly
- [ ] Commission calculates correctly (10%)
- [ ] Commission pays when session completes
- [ ] Health notes only visible to selected expert
- [ ] Expert can track sent referrals
- [ ] Expert can view received referrals
- [ ] Commission shows in wallet transactions

## Troubleshooting

### Referral not showing for patient
- Check referral status is PENDING
- Verify patient ID matches
- Check database indexes

### Commission not paid
- Verify booking status is COMPLETED
- Check referral has commissionAmount set
- Verify wallet exists for referring expert
- Check transaction logs

### Cannot create referral
- Verify user is active provider
- Check minimum 3 experts selected
- Verify experts are active providers
- Check patient exists

## Future Enhancements

- Referral expiration dates
- Referral templates for common conditions
- Bulk referral creation
- Referral analytics dashboard
- Patient feedback on referrals
- Referral acceptance rate tracking
