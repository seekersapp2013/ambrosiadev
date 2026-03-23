# Multi-Currency Wallet Implementation Phases

## Overview
This document outlines the comprehensive implementation plan for adding multi-currency support to the existing wallet system with phone-based country detection, primary currency selection, PIN security, and exchange rate integration.

## Supported Currencies
- **USD** - US Dollar
- **NGN** - Nigerian Naira  
- **GBP** - British Pound
- **EUR** - Euro
- **CAD** - Canadian Dollar
- **GHS** - Ghanaian Cedi
- **KES** - Kenyan Shilling
- **GMD** - Gambian Dalasi
- **ZAR** - South African Rand

## Key Requirements
- **Country Detection**: Phone number-based using libphonenumber-js
- **Primary Currency Selection**: Dedicated selection screen with country-based defaults
- **PIN Security**: Required for all withdrawals
- **Multi-Currency Deposits**: All 9 currencies supported
- **NGN-Only Withdrawals**: Restricted to NGN with PIN verification
- **Exchange Rate Integration**: Real-time conversion for cross-currency transactions

---

## Phase 1: Database Schema Extension

### Objective
Restructure the database to support multiple currencies, PIN security, and phone-based country detection.

### Tasks
- [ ] Modify `wallets` table schema for flexible currency balance structure
- [ ] Add `primaryCurrency` field to track user's default currency
- [ ] Add `pinHash` field for secure PIN storage using bcrypt
- [ ] Add phone number country detection fields
- [ ] Replace individual balance fields with `balances` object/map
- [ ] Create migration scripts to convert existing wallet data
- [ ] Add currency metadata table for exchange rates

### Database Schema Changes

#### Updated Profiles Table
```typescript
profiles: {
  userId: v.id("users"),
  username: v.string(),
  name: v.optional(v.string()),
  bio: v.optional(v.string()),
  avatar: v.optional(v.string()),
  phoneNumber: v.string(), // Required for country detection
  phoneCountryCode: v.string(), // Extracted from phone (+234, +1, etc.)
  detectedCountry: v.string(), // Country code from phone (NG, US, etc.)
  pinHash: v.string(), // Bcrypt hashed PIN for withdrawals
  interests: v.optional(v.array(v.string())),
  createdAt: v.number(),
  updatedAt: v.optional(v.number())
}
```

#### Updated Wallets Table
```typescript
wallets: {
  userId: v.id("users"),
  primaryCurrency: v.string(), // Based on phone country detection
  phoneCountryDetected: v.boolean(), // Whether country was detected from phone
  balances: v.object({
    USD: v.number(), NGN: v.number(), GBP: v.number(),
    EUR: v.number(), CAD: v.number(), GHS: v.number(),
    KES: v.number(), GMD: v.number(), ZAR: v.number()
  }),
  createdAt: v.number(),
  updatedAt: v.optional(v.number())
}
```

### Deliverables
- Updated database schema files
- Migration scripts for existing data
- Data validation scripts

---

## Phase 2: Phone Number Country Detection & Primary Currency Selection

### Objective
Implement phone number-based country detection with dedicated currency selection screen.

### Tasks
- [ ] Integrate libphonenumber-js for phone number parsing and country detection
- [ ] Build dedicated primary currency selection screen
- [ ] Implement country-to-currency default mapping
- [ ] Create currency selection UI with all 9 supported currencies
- [ ] Build PIN setup UI during user registration
- [ ] Implement secure PIN hashing using bcrypt (12 salt rounds)
- [ ] Add phone number validation and formatting
- [ ] Build PIN verification system for sensitive operations

### Key Components

#### Phone Country Detection Service
```typescript
class PhoneCountryDetectionService {
  detectCountryFromPhone(phoneNumber: string): {
    country: string;
    currency: string;
    countryCode: string;
    isValid: boolean;
  }
}
```

#### PIN Security Service
```typescript
class PINService {
  async hashPIN(pin: string): Promise<string>
  async verifyPIN(pin: string, hashedPIN: string): Promise<boolean>
  async changePIN(oldPIN: string, newPIN: string, currentHash: string): Promise<string>
}
```

#### Registration Wizard Steps
1. **Basic Information**: Username, email, password
2. **Phone Number Entry**: Phone input with validation
3. **Primary Currency Selection**: Currency grid with country-based default
4. **PIN Setup**: Secure PIN creation with confirmation
5. **Confirmation**: Review and complete registration

### Deliverables
- Phone number detection service
- PIN security service
- Multi-step registration wizard
- Currency selection component
- PIN setup and verification components

---

## Phase 3: Exchange Rate API Integration

### Objective
Integrate real-time exchange rates for cross-currency conversions at point of sale.

### Tasks
- [ ] Primary API Setup: Integrate ExchangeRate-API.com with API key management
- [ ] Fallback API Setup: Implement Frankfurter.dev as backup (no API key needed)
- [ ] Rate Caching: Cache exchange rates to minimize API calls and improve performance
- [ ] Conversion Logic: Build currency conversion utilities for point-of-sale transactions
- [ ] Rate Display: Show exchange rates and converted amounts in UI
- [ ] Error Handling: Graceful fallback when exchange rate APIs are unavailable

### API Services

#### Primary API: ExchangeRate-API.com
- **Free Tier**: 1,500 requests/month, updates every 24 hours
- **Paid Plans**: From $9.99/month for 100,000 requests with hourly updates
- **Features**: 160+ currencies, reliable uptime
- **Accuracy**: Indicative midpoint rates, suitable for e-commerce

#### Fallback API: Frankfurter.dev
- **Completely Free**: No API key required, unlimited requests
- **Features**: 30+ major currencies, daily updates at 16:00 CET
- **Source**: European Central Bank data
- **Limitation**: Fewer currencies, EUR-centric

### Exchange Rate Service Implementation
```typescript
class ExchangeRateService {
  async getExchangeRate(from: string, to: string): Promise<number>
  async convertCurrency(amount: number, from: string, to: string): Promise<{
    convertedAmount: number;
    exchangeRate: number;
    timestamp: number;
  }>
}
```

### Deliverables
- Exchange rate service with primary/fallback APIs
- Rate caching mechanism
- Currency conversion utilities
- Real-time conversion UI components

---

## Phase 4: Backend API Refactoring with PIN Verification

### Objective
Update all wallet-related backend functions for multi-currency with PIN-protected withdrawals.

### Tasks
- [ ] Refactor `createWallet.ts` to initialize all currency balances and set primary currency
- [ ] Update `getWalletBalance.ts` to return all balances with primary currency highlight
- [ ] Modify `depositFunds.ts` to support all 9 currencies
- [ ] Update `withdrawFunds.ts` to require PIN verification and restrict to NGN only
- [ ] Enhance `transferFunds.ts` to handle transfers in any supported currency
- [ ] Add PIN verification endpoints
- [ ] Add cross-currency payment processing with real-time conversion
- [ ] Update transaction validation for new currency rules

### Key Backend Functions

#### PIN-Protected Withdrawal
```typescript
export const withdrawFunds = mutation({
  args: {
    amount: v.number(),
    currency: v.string(),
    pin: v.string(), // User-provided PIN for verification
  },
  handler: async (ctx, args) => {
    // 1. Authenticate user
    // 2. Restrict to NGN only
    // 3. Verify PIN against stored hash
    // 4. Process withdrawal
  }
});
```

#### Cross-Currency Payment Processing
```typescript
async function processPayment(
  contentPrice: number, 
  contentCurrency: string, 
  userPrimaryCurrency: string
) {
  if (contentCurrency === userPrimaryCurrency) {
    // Same currency - direct payment
  } else {
    // Cross-currency conversion needed
    // 1. Get real-time exchange rate
    // 2. Show conversion confirmation
    // 3. Process payment with converted amount
  }
}
```

### Deliverables
- Updated wallet mutation functions
- PIN verification endpoints
- Cross-currency payment processing
- Enhanced transaction validation

---

## Phase 5: Frontend Multi-Currency Interface with PIN Protection

### Objective
Update UI components for phone-based registration, PIN-protected withdrawals, and conversion display.

### Tasks
- [ ] Update registration form with phone number and PIN setup
- [ ] Build PIN verification modals for withdrawals
- [ ] Update `UnifiedWallet.tsx` to highlight primary currency
- [ ] Modify `WalletManagement.tsx` with currency-specific deposit forms
- [ ] Implement PIN-protected withdrawal UI (NGN only)
- [ ] Add real-time conversion display for cross-currency transactions
- [ ] Build conversion confirmation modals for point-of-sale
- [ ] Update transaction history with currency filtering and conversion details

### Key UI Components

#### PIN Verification Modal
```typescript
function PINVerificationModal({ 
  isOpen, 
  onClose, 
  onVerify 
}: {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (pin: string) => Promise<void>;
})
```

#### Currency Converter Display
```typescript
function CurrencyConverter({ 
  amount, 
  fromCurrency, 
  toCurrency 
}: {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
})
```

#### Payment Confirmation Modal
```typescript
function PaymentConfirmation({ 
  contentPrice, 
  contentCurrency, 
  userCurrency, 
  conversion 
}: PaymentConfirmationProps)
```

### Deliverables
- Enhanced registration wizard
- PIN verification components
- Multi-currency wallet interface
- Real-time conversion displays
- Payment confirmation modals

---

## Phase 6: Currency Configuration & Validation

### Objective
Implement robust currency management with phone-based detection and PIN security.

### Tasks
- [ ] Create comprehensive currency configuration
- [ ] Add deposit validation for all 9 currencies
- [ ] Implement withdrawal validation (NGN only with PIN)
- [ ] Add currency formatting utilities
- [ ] Create currency-specific transaction limits
- [ ] Implement phone number-based currency suggestions
- [ ] Add exchange rate validation and error handling
- [ ] Implement rate caching and refresh strategies

### Currency Configuration
```typescript
const SUPPORTED_CURRENCIES = {
  USD: { symbol: '$', decimals: 2, name: 'US Dollar', deposits: true, withdrawals: false },
  NGN: { symbol: '₦', decimals: 2, name: 'Nigerian Naira', deposits: true, withdrawals: true },
  GBP: { symbol: '£', decimals: 2, name: 'British Pound', deposits: true, withdrawals: false },
  EUR: { symbol: '€', decimals: 2, name: 'Euro', deposits: true, withdrawals: false },
  CAD: { symbol: 'C$', decimals: 2, name: 'Canadian Dollar', deposits: true, withdrawals: false },
  GHS: { symbol: '₵', decimals: 2, name: 'Ghanaian Cedi', deposits: true, withdrawals: false },
  KES: { symbol: 'KSh', decimals: 2, name: 'Kenyan Shilling', deposits: true, withdrawals: false },
  GMD: { symbol: 'D', decimals: 2, name: 'Gambian Dalasi', deposits: true, withdrawals: false },
  ZAR: { symbol: 'R', decimals: 2, name: 'South African Rand', deposits: true, withdrawals: false }
};
```

### Deliverables
- Currency configuration system
- Validation utilities
- Formatting functions
- Transaction limit management

---

## Phase 7: User Onboarding & Experience

### Objective
Create smooth onboarding flow with phone-based country detection and PIN setup.

### Tasks
- [ ] Build phone number input and validation flow
- [ ] Create PIN setup and confirmation screens
- [ ] Add currency education tooltips
- [ ] Implement currency switching for deposits
- [ ] Add PIN security education and best practices
- [ ] Create currency balance overview dashboard
- [ ] Add conversion rate transparency and education
- [ ] Implement conversion history tracking

### Enhanced Onboarding Flow
1. **Phone Number Entry**: User enters phone number with country code
2. **Country Detection**: System detects country and shows detection result
3. **Primary Currency Selection**: Dedicated screen with country-based default
4. **PIN Setup**: User creates secure 4-6 digit PIN with confirmation
5. **Currency Confirmation**: User reviews selected primary currency
6. **Wallet Creation**: Initialize wallet with all currency balances
7. **Security Tutorial**: Explain PIN usage and security best practices

### Deliverables
- Enhanced onboarding wizard
- Currency education materials
- PIN security tutorials
- Balance overview dashboard

---

## Phase 8: Migration & Data Integrity

### Objective
Safely migrate existing users to new phone-based and PIN-protected system.

### Tasks
- [ ] Create migration scripts for existing users
- [ ] Prompt existing users to add phone number and set PIN
- [ ] Set default primary currency based on existing balance or manual selection
- [ ] Initialize new currency balances to zero
- [ ] Validate data integrity post-migration
- [ ] Update existing transactions for consistency
- [ ] Test rollback procedures

### Migration Strategy
1. **Existing User Detection**: Identify users without phone/PIN
2. **Mandatory Update Flow**: Prompt users to complete profile
3. **Data Migration**: Convert existing USD/NGN balances to new structure
4. **Validation**: Ensure data integrity and consistency
5. **Rollback Plan**: Prepare rollback procedures if needed

### Deliverables
- Migration scripts
- User update prompts
- Data validation tools
- Rollback procedures

---

## Phase 9: Testing & Quality Assurance

### Objective
Comprehensive testing of phone detection, PIN security, and currency restrictions.

### Tasks
- [ ] Test phone number parsing and country detection across different formats
- [ ] Test PIN hashing and verification security
- [ ] Validate multi-currency deposit functionality
- [ ] Test PIN-protected withdrawal restrictions
- [ ] Test exchange rate API integration and fallback mechanisms
- [ ] Test cross-currency conversion accuracy and performance
- [ ] Test PIN brute-force protection and rate limiting
- [ ] Performance testing with phone validation and API calls
- [ ] Security testing for PIN storage and verification

### Testing Categories

#### Security Testing
- PIN hashing and verification
- Brute-force protection
- Rate limiting
- API key security

#### Functional Testing
- Phone number validation
- Country detection accuracy
- Currency conversion accuracy
- Withdrawal restrictions

#### Performance Testing
- API response times
- Rate caching effectiveness
- Database query optimization
- UI responsiveness

### Deliverables
- Test suites for all components
- Security audit reports
- Performance benchmarks
- Bug reports and fixes

---

## Phase 10: Documentation & Deployment

### Objective
Document new features and deploy with monitoring.

### Tasks
- [ ] Update API documentation with phone detection and PIN requirements
- [ ] Create user guides for phone-based registration and PIN security
- [ ] Document PIN security best practices and policies
- [ ] Document exchange rate API usage and fallback procedures
- [ ] Prepare deployment scripts
- [ ] Monitor PIN verification attempts and security metrics
- [ ] Monitor exchange rate API usage and costs
- [ ] Gather user feedback on phone detection accuracy and PIN usability

### Documentation Requirements
- API documentation updates
- User guides and tutorials
- Security policies
- Deployment procedures
- Monitoring and alerting setup

### Deliverables
- Complete documentation suite
- Deployment scripts
- Monitoring dashboards
- User feedback collection system

---

## Phase 11: Monitoring & Optimization

### Objective
Monitor system performance and optimize based on real-world usage.

### Tasks
- [ ] Set up monitoring for exchange rate API usage and costs
- [ ] Monitor PIN verification success/failure rates
- [ ] Track phone number detection accuracy
- [ ] Monitor currency conversion performance
- [ ] Analyze user behavior and preferences
- [ ] Optimize API caching strategies
- [ ] Implement cost optimization measures
- [ ] Gather and analyze user feedback

### Key Metrics to Monitor
- Exchange rate API usage and costs
- PIN verification attempts and success rates
- Phone number detection accuracy
- Currency conversion frequency
- User registration completion rates
- System performance and response times

### Deliverables
- Monitoring dashboards
- Performance optimization reports
- Cost analysis and optimization
- User behavior analytics

---

## Success Criteria

### Technical Success Criteria
- [ ] All 9 currencies supported for deposits
- [ ] NGN-only withdrawals with PIN protection working
- [ ] Phone-based country detection accuracy > 95%
- [ ] Exchange rate API uptime > 99%
- [ ] PIN verification security meets industry standards
- [ ] System performance maintained under load

### User Experience Success Criteria
- [ ] Registration completion rate > 90%
- [ ] User satisfaction with currency selection process
- [ ] Minimal support tickets related to PIN issues
- [ ] Positive feedback on conversion transparency
- [ ] Smooth migration for existing users

### Business Success Criteria
- [ ] Increased user engagement with multi-currency features
- [ ] Reduced support burden through better UX
- [ ] Cost-effective exchange rate API usage
- [ ] Compliance with security best practices
- [ ] Scalable architecture for future currencies

---

## Risk Mitigation

### Technical Risks
- **Exchange Rate API Failures**: Implement robust fallback mechanisms
- **PIN Security Vulnerabilities**: Follow industry best practices for hashing and storage
- **Phone Number Validation Issues**: Comprehensive testing across different formats
- **Performance Degradation**: Implement caching and optimization strategies

### Business Risks
- **User Adoption**: Provide clear education and smooth onboarding
- **Regulatory Compliance**: Ensure compliance with financial regulations
- **Cost Overruns**: Monitor API usage and implement cost controls
- **Security Breaches**: Implement comprehensive security measures and monitoring

### Mitigation Strategies
- Comprehensive testing at each phase
- Gradual rollout with feature flags
- Monitoring and alerting systems
- Regular security audits
- User feedback collection and iteration

---

## Conclusion

This comprehensive implementation plan provides a structured approach to adding multi-currency support with phone-based country detection, PIN security, and exchange rate integration. Each phase builds upon the previous one, ensuring a robust, secure, and user-friendly multi-currency wallet system.

The plan prioritizes security, user experience, and scalability while maintaining cost-effectiveness and compliance with best practices. Regular monitoring and optimization ensure the system continues to meet user needs and business objectives.