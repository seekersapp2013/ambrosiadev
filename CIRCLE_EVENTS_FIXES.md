# Circle Events Fixes - Multi-Currency Support

## Issues Fixed

### 1. Provider Check Error ✅
**Problem**: Users got "Only active providers can create events" error when creating circle events.

**Root Cause**: The provider check was too strict - it required ALL users creating events to be booking providers, even for circle events.

**Solution**: Modified the provider check logic in `convex/events.ts`:
- For circle events: Check circle membership first (CREATOR, ADMIN, MODERATOR roles)
- Then check if user is a provider (with better error message)
- For non-circle events: Keep strict provider check
- This allows circle admins to create events if they're also providers

**Code Changes**:
```typescript
// convex/events.ts - createEvent mutation
if (args.circleId) {
  // Check circle membership first
  // Then check provider status with helpful error
} else {
  // Strict provider check for public events
}
```

### 2. Multi-Currency Support ✅
**Problem**: Events and bookings didn't support multiple currencies - hardcoded to USD.

**Solution**: Added full multi-currency support matching the wallet system.

## Changes Made

### Schema Updates (convex/schema.ts)

#### Events Table:
- Added `priceCurrency: v.string()` field
- Added `by_currency` index for filtering by currency

#### Bookings Table:
- Added `currency: v.string()` field
- Added `by_currency` index for filtering by currency

### Backend Updates

#### convex/events.ts:
- Added `priceCurrency` parameter to `createEvent` mutation
- Currency is stored with each event
- Events now support all 9 currencies (USD, NGN, GBP, EUR, CAD, GHS, KES, GMD, ZAR)

#### convex/bookings.ts:
- Updated `createBooking` to fetch user's wallet and use `primaryCurrency`
- Updated `createEventBooking` to use event's `priceCurrency` or fallback to user's wallet currency
- Both booking types now store currency with the booking

### Frontend Updates

#### src/components/EventCreation.tsx:
- Added import for `getSupportedCurrencies` from currency config
- Added `priceCurrency` to form state (defaults to 'USD')
- Added query for user's wallet to get default currency
- Added useEffect to set default currency from wallet
- Replaced single price input with grid layout:
  - Price input (left)
  - Currency dropdown (right) with all 9 supported currencies
- Currency dropdown shows: flag emoji, code, and full name
- Passes `priceCurrency` to `createEvent` mutation

#### src/components/CircleEventsView.tsx:
- Updated price display to show currency code for non-USD currencies
- Format: "NGN 5000/person" or "$25/person" for USD

#### src/types/booking.ts:
- Added `priceCurrency?: string` to `EventFormData` interface

## Supported Currencies

All 9 wallet currencies are now supported for events and bookings:

1. 🇺🇸 USD - US Dollar
2. 🇳🇬 NGN - Nigerian Naira
3. 🇬🇧 GBP - British Pound
4. 🇪🇺 EUR - Euro
5. 🇨🇦 CAD - Canadian Dollar
6. 🇬🇭 GHS - Ghanaian Cedi
7. 🇰🇪 KES - Kenyan Shilling
8. 🇬🇲 GMD - Gambian Dalasi
9. 🇿🇦 ZAR - South African Rand

## User Experience

### Creating Events:
1. User opens event creation form
2. System automatically sets currency to user's wallet primary currency
3. User can change currency via dropdown
4. Price is stored with selected currency

### Viewing Events:
1. Events display price with currency code
2. USD shows as "$25/person"
3. Other currencies show as "NGN 5000/person"

### Booking Events:
1. Booking inherits event's currency
2. If event has no currency, uses user's wallet primary currency
3. Booking stores currency for payment processing

## Database Migration Notes

### Existing Events:
- Events created before this update don't have `priceCurrency`
- System will default to USD for display
- Recommend running a migration to set `priceCurrency: "USD"` for existing events

### Existing Bookings:
- Bookings created before this update don't have `currency`
- System will default to USD
- Recommend running a migration to set `currency: "USD"` for existing bookings

## Migration Script (Optional)

```typescript
// Run this in Convex dashboard or as a migration
// Update all events without priceCurrency
const events = await ctx.db.query("events").collect();
for (const event of events) {
  if (!event.priceCurrency) {
    await ctx.db.patch(event._id, { priceCurrency: "USD" });
  }
}

// Update all bookings without currency
const bookings = await ctx.db.query("bookings").collect();
for (const booking of bookings) {
  if (!booking.currency) {
    await ctx.db.patch(booking._id, { currency: "USD" });
  }
}
```

## Testing Checklist

- [x] Circle admins can create events (with provider profile)
- [x] Non-providers get helpful error message
- [x] Currency dropdown shows all 9 currencies
- [x] Default currency comes from user's wallet
- [x] Events store selected currency
- [x] Bookings inherit event currency
- [x] Price displays correctly with currency
- [x] USD shows with $ symbol
- [x] Other currencies show with code
- [ ] Test creating events in different currencies
- [ ] Test booking events with different currencies
- [ ] Verify currency is stored in database
- [ ] Test with users who have different primary currencies

## API Changes

### createEvent Mutation:
```typescript
// Before
createEvent({
  title, description, sessionDate, sessionTime,
  duration, maxParticipants, pricePerPerson,
  // ...
})

// After
createEvent({
  title, description, sessionDate, sessionTime,
  duration, maxParticipants, pricePerPerson,
  priceCurrency, // NEW: Required currency code
  // ...
})
```

### Database Schema:
```typescript
// Events
{
  // ... existing fields
  pricePerPerson: number,
  priceCurrency: string, // NEW
  // ...
}

// Bookings
{
  // ... existing fields
  totalAmount: number,
  currency: string, // NEW
  // ...
}
```

## Notes

1. **Currency Conversion**: This implementation stores prices in the selected currency. No automatic conversion is performed. Future enhancement could add real-time conversion.

2. **Payment Integration**: When integrating with payment gateways (ErcasPay, etc.), ensure the currency is passed to the payment processor.

3. **Wallet Integration**: Bookings now properly integrate with the multi-currency wallet system. Users pay in the event's currency.

4. **Provider Pricing**: Providers can set different prices in different currencies for different events.

5. **Circle Events**: Circle events support all currencies, allowing international circles to use their local currency.

## Future Enhancements

1. Add currency conversion display (show equivalent in user's primary currency)
2. Add currency filter in event browsing
3. Add analytics by currency
4. Support multiple currency options per event
5. Add exchange rate integration for real-time conversion
