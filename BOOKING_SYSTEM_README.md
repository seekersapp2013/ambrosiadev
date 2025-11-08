# Enhanced Booking System - 1-on-1 & Group Sessions

## Overview

The booking system has been enhanced to support two types of sessions:

1. **1-on-1 Sessions**: Private sessions between a user and an expert
2. **Group Events**: Sessions where multiple users can join (1-to-many)

## Key Features

### For Providers (Experts)
- **Dual Pricing Structure**: Set different rates for 1-on-1 vs group sessions
- **Event Creation**: Create group events with custom pricing, participant limits, and scheduling
- **Provider Dashboard**: Comprehensive dashboard to manage both session types
- **Availability Management**: Set weekly schedules and availability hours
- **Booking Management**: Approve/decline bookings, manage event participants

### For Users (Clients)
- **Browse Both Session Types**: Unified interface to discover 1-on-1 sessions and group events
- **Advanced Filtering**: Filter by specialization, job title, price range, and search terms
- **Event Discovery**: Find upcoming group events with available spots
- **Booking Interface**: Easy booking flow for both session types

## Components

### 1. ProviderSubscription.tsx
Enhanced provider registration with dual pricing:
- `oneOnOnePrice`: Hourly rate for private sessions
- `groupSessionPrice`: Per-person hourly rate for group sessions
- Backward compatibility with existing `sessionPrice` field

### 2. ProviderDashboard.tsx
Comprehensive provider management interface:
- **Overview**: Stats for pending bookings, confirmed sessions, active events
- **1-on-1 Sessions**: Manage individual bookings
- **Group Events**: Create and manage group sessions
- **Settings**: Update profile and pricing

### 3. EventCreation.tsx
Create group events with:
- Event title and description
- Date, time, and duration
- Maximum participants and pricing
- Tags and visibility settings
- Session instructions

### 4. BookingBrowser.tsx
Unified discovery interface:
- Toggle between 1-on-1 providers and group events
- Advanced filtering and search
- Provider profiles with both pricing tiers
- Event cards with participant info

### 5. BookingSystem.tsx
Main integration component with navigation between browse and provider views

## Database Schema Updates

### bookingSubscribers Table
Added new optional fields:
- `oneOnOnePrice`: Price for 1-on-1 sessions per hour
- `groupSessionPrice`: Price for group sessions per person per hour
- Maintains `sessionPrice` for backward compatibility

### Existing Tables Enhanced
- **bookings**: Added `sessionType` and `eventId` fields for group bookings
- **events**: Comprehensive event management with participant tracking
- **bookingSettings**: Provider preferences for booking confirmation

## Backend Functions

### Enhanced Functions
- `createSubscriber` & `updateSubscriber`: Support dual pricing
- `createEventBooking`: Handle group session bookings
- `getProviderAvailability`: Check availability for both session types
- `getPublicEvents`: Discover available group events

### New Event Functions
- `createEvent`: Create group events
- `updateEvent`: Modify event details
- `cancelEvent`: Cancel events and notify participants
- `getEventById`: Get detailed event information

## Usage

### Setting Up as a Provider

1. **Register as Provider**:
   ```tsx
   import { ProviderSubscription } from './components/ProviderSubscription';
   
   // Component handles both new registration and updates
   <ProviderSubscription 
     onBack={() => {}} 
     onSuccess={() => {}} 
   />
   ```

2. **Access Provider Dashboard**:
   ```tsx
   import { ProviderDashboard } from './components/ProviderDashboard';
   
   <ProviderDashboard onBack={() => {}} />
   ```

### Browsing and Booking Sessions

```tsx
import { BookingBrowser } from './components/BookingBrowser';

<BookingBrowser onBack={() => {}} />
```

### Complete Integration

```tsx
import { BookingSystem } from './components/BookingSystem';

// Provides full navigation between browse and provider views
<BookingSystem />
```

## Pricing Strategy

### Recommended Pricing Structure
- **1-on-1 Sessions**: Premium pricing for personalized attention
- **Group Sessions**: 50-70% of 1-on-1 rate to attract more participants
- **Example**: If 1-on-1 is $100/hr, group sessions could be $50-70/person/hr

### Revenue Benefits
- **Providers**: Can serve more clients simultaneously with group sessions
- **Platform**: Increased booking volume and revenue opportunities
- **Users**: More affordable access to expert knowledge through group sessions

## Key Improvements

1. **Flexible Pricing**: Providers can optimize revenue with different pricing strategies
2. **Scalability**: Group sessions allow experts to serve multiple clients efficiently  
3. **Discovery**: Enhanced browsing experience for both session types
4. **Management**: Comprehensive dashboard for providers to manage all bookings
5. **Backward Compatibility**: Existing providers continue to work seamlessly

## Next Steps

1. **Payment Integration**: Implement payment processing for both session types
2. **Calendar Integration**: Add calendar sync for better scheduling
3. **Video Conferencing**: Integrate meeting links for sessions
4. **Reviews & Ratings**: Add feedback system for both session types
5. **Analytics**: Provider analytics for session performance and revenue tracking

## Technical Notes

- All new fields are optional to maintain backward compatibility
- TypeScript interfaces updated to support dual pricing
- Database indexes optimized for efficient querying
- Error handling and validation for all new features
- Responsive design for mobile and desktop usage