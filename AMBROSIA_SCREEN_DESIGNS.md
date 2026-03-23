# Ambrosia Screen Designs & User Flows

## Table of Contents
1. [Authentication Screens](#1-authentication-screens)
2. [Home & Content Discovery](#2-home--content-discovery)
3. [Content Creation](#3-content-creation)
4. [Booking System](#4-booking-system)
5. [Wallet & Payments](#5-wallet--payments)
6. [Profile & Settings](#6-profile--settings)
7. [Messaging](#7-messaging)
8. [Notifications](#8-notifications)

---

## 1. Authentication Screens

### 1.1 Welcome Screen (First Launch)
**Purpose**: Introduce users to Ambrosia and encourage sign-up

**Layout**:
```
┌─────────────────────────────────────┐
│                                     │
│         [Ambrosia Logo]             │
│                                     │
│    Health & Wellness Community      │
│                                     │
│   [Illustration: Wellness Icons]    │
│                                     │
│  Connect with experts, discover     │
│  premium content, and transform     │
│  your wellness journey              │
│                                     │
│   ┌─────────────────────────────┐   │
│   │   Sign Up with Email        │   │
│   └─────────────────────────────┘   │
│                                     │
│   Already have an account? Sign In  │
│                                     │
└─────────────────────────────────────┘
```

**Design Elements**:
- Gradient background (ambrosia-50 to ambrosia-100)
- Large logo with tagline
- Wellness-themed illustration
- Primary CTA button with gradient
- Text link for existing users

### 1.2 Sign Up Screen
**Purpose**: Collect user email and create account

**Layout**:
```
┌─────────────────────────────────────┐
│  ← Back          Sign Up            │
├─────────────────────────────────────┤
│                                     │
│  Create Your Account                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📧 Email Address            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔒 Password                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔒 Confirm Password         │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Create Account         │   │
│  └─────────────────────────────┘   │
│                                     │
│  By signing up, you agree to our   │
│  Terms of Service and Privacy      │
│  Policy                             │
│                                     │
└─────────────────────────────────────┘
```

**Design Elements**:
- Clean white background
- Input fields with icons
- Password strength indicator
- Primary button (gradient)
- Legal text in small gray font

### 1.3 Interest Selection Screen
**Purpose**: Personalize content recommendations

**Layout**:
```
┌─────────────────────────────────────┐
│  ← Skip          Interests    Next →│
├─────────────────────────────────────┤
│                                     │
│  What are you interested in?        │
│  Select topics to personalize your  │
│  experience                         │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔍 Search interests...      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ 💪   │ │ 🧠   │ │ 🥗   │       │
│  │Fitness│ │Mental│ │Nutri-│       │
│  │      │ │Health│ │tion  │       │
│  └──────┘ └──────┘ └──────┘       │
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ 🧘   │ │ 💊   │ │ 🏃   │       │
│  │ Yoga │ │Chronic│ │Sports│       │
│  │      │ │Disease│ │      │       │
│  └──────┘ └──────┘ └──────┘       │
│                                     │
│  [More categories...]               │
│                                     │
│  Selected: 5 interests              │
│                                     │
└─────────────────────────────────────┘
```

**Design Elements**:
- Grid layout for interest cards
- Icon + label for each interest
- Selected state: accent color border + checkmark
- Search functionality
- Counter showing selected interests
- Skip option for later

---

## 2. Home & Content Discovery

### 2.1 Home Feed (Articles)
**Purpose**: Main content discovery hub

**Layout**:
```
┌─────────────────────────────────────┐
│  Ambrosia        🔔(3)  📥  ⚙️      │
├─────────────────────────────────────┤
│                                     │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐         │
│  │✏️│ │💪│ │🧠│ │🥗│ │🧘│ →       │
│  │Write│Health│Mind│Food│Yoga│      │
│  └──┘ └──┘ └──┘ └──┘ └──┘         │
│                                     │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │ [Author Avatar] Dr. Sarah   │   │
│  │ @drsarah · 2h ago          │   │
│  │                             │   │
│  │ 5 Ways to Improve Your      │   │
│  │ Mental Health Today         │   │
│  │                             │   │
│  │ Discover evidence-based...  │   │
│  │                             │   │
│  │ [Article Image]             │   │
│  │                             │   │
│  │ 💪 Fitness  🧠 Mental Health│   │
│  │                             │   │
│  │ ❤️ 234  💬 45  🔖 12  ↗️   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [Premium Badge] 🔒          │   │
│  │ [Author Avatar] Coach Mike  │   │
│  │ @coachmike · 5h ago        │   │
│  │                             │   │
│  │ Advanced Nutrition Guide    │   │
│  │ for Athletes                │   │
│  │                             │   │
│  │ [Blurred Preview]           │   │
│  │                             │   │
│  │ 💰 $5 USD to unlock         │   │
│  │                             │   │
│  │ 🥗 Nutrition  🏃 Sports     │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
│  🏠  📅  💬  ▶️  💰  👤          │
└─────────────────────────────────────┘
```

**Design Elements**:
- Sticky header with app name and icons
- Horizontal scrolling story-style tags
- Article cards with author info
- Premium content indicator (lock icon + price)
- Engagement metrics (likes, comments, bookmarks)
- Bottom navigation bar
- Pull-to-refresh functionality

### 2.2 Reels Screen
**Purpose**: Short-form video content discovery

**Layout**:
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│                                     │
│         [Video Content]             │
│                                     │
│                                     │
│  @username                    │ ❤️ │
│  Caption text here...         │234 │
│  #fitness #health             │    │
│                               │💬  │
│  🎵 Original Audio            │ 45 │
│                               │    │
│                               │🔖  │
│                               │ 12 │
│                               │    │
│                               │↗️  │
│                               │    │
│                               │⋮   │
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘
│  🏠  📅  💬  ▶️  💰  👤          │
└─────────────────────────────────────┘
```

**Design Elements**:
- Full-screen vertical video
- Swipe up/down to navigate
- Floating engagement buttons (right side)
- Author info overlay (bottom left)
- Auto-play with sound toggle
- Progress indicators (right side dots)
- Floating create button

---

## 3. Content Creation

### 3.1 Write Article Screen
**Purpose**: Create and publish articles

**Layout**:
```
┌─────────────────────────────────────┐
│  ✕ Cancel    New Article    Publish │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Article Title               │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Subtitle (optional)         │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │ Write your article here...  │   │
│  │                             │   │
│  │ [Rich Text Editor]          │   │
│  │                             │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  📷 Add Cover Image                 │
│                                     │
│  🏷️ Add Tags                        │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │Fitness│ │Health│ │ + Add│       │
│  └──────┘ └──────┘ └──────┘       │
│                                     │
│  💰 Monetization                    │
│  ○ Free    ● Premium ($5 USD)      │
│                                     │
│  ⏱️ Estimated read time: 5 min     │
│                                     │
└─────────────────────────────────────┘
```

**Design Elements**:
- Clean writing interface
- Rich text editor with formatting
- Cover image upload
- Tag selection
- Monetization toggle
- Auto-save indicator
- Character/word count

### 3.2 Create Reel Screen
**Purpose**: Record and publish short videos

**Layout**:
```
┌─────────────────────────────────────┐
│  ✕                            ⚙️    │
│                                     │
│                                     │
│         [Camera Preview]            │
│                                     │
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🎵 Add Music                │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🎨 Effects & Filters        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ⏱️ 0:00 / 0:60                     │
│                                     │
│       ⭕ Record                      │
│                                     │
│  🔄 Flip  ⚡ Flash  ⏱️ Timer        │
│                                     │
└─────────────────────────────────────┘
```

**Design Elements**:
- Full-screen camera interface
- Recording timer
- Music selection
- Effects and filters
- Camera controls (flip, flash, timer)
- Recording button (hold to record)
- Gallery access

---

## 4. Booking System

### 4.1 Booking Browser
**Purpose**: Discover and book expert sessions

**Layout**:
```
┌─────────────────────────────────────┐
│  ← Back         Booking              │
├─────────────────────────────────────┤
│                                     │
│  Find Expert Sessions               │
│  Book 1-on-1 or join group events   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔍 Search experts...        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Filters: All ▼  $0-$100 ▼  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 1-on-1 Sessions | Group Events│  │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [Avatar] Dr. Sarah Johnson  │   │
│  │ Nutritionist                │   │
│  │ 🌟 Nutrition & Weight Loss  │   │
│  │                             │   │
│  │ Specialized in plant-based  │   │
│  │ nutrition and sustainable...│   │
│  │                             │   │
│  │ 💰 1-on-1: $80/hr           │   │
│  │ 💰 Group: $40/person/hr     │   │
│  │                             │   │
│  │ ┌──────────┐  ┌──────────┐ │   │
│  │ │Book 1-on-1│  │View Profile│ │   │
│  │ └──────────┘  └──────────┘ │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [Avatar] Coach Mike         │   │
│  │ Fitness Trainer             │   │
│  │ 🌟 Strength & Conditioning  │   │
│  │                             │   │
│  │ 💰 1-on-1: $100/hr          │   │
│  │ 💰 Group: $50/person/hr     │   │
│  │                             │   │
│  │ ┌──────────┐  ┌──────────┐ │   │
│  │ │Book 1-on-1│  │View Profile│ │   │
│  │ └──────────┘  └──────────┘ │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
│  🏠  📅  💬  ▶️  💰  👤          │
└─────────────────────────────────────┘
```

**Design Elements**:
- Search and filter bar
- Toggle between 1-on-1 and group sessions
- Provider cards with avatar and credentials
- Dual pricing display
- Quick action buttons
- Specialization badges
- Rating indicators

### 4.2 Booking Calendar
**Purpose**: Select date and time for session

**Layout**:
```
┌─────────────────────────────────────┐
│  ← Back    Book Session      Next → │
├─────────────────────────────────────┤
│                                     │
│  [Avatar] Dr. Sarah Johnson         │
│  Nutritionist · $80/hr              │
│                                     │
│  Select Date & Time                 │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   March 2026                │   │
│  │ Su Mo Tu We Th Fr Sa        │   │
│  │     1  2  3  4  5  6        │   │
│  │  7  8  9 10 11 12 13        │   │
│  │ 14 15 16 17 18 19 20        │   │
│  │ 21 22 23 24 25 26 27        │   │
│  │ 28 29 30 31                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  Available Time Slots               │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ 9:00 │ │10:00 │ │11:00 │       │
│  │  AM  │ │  AM  │ │  AM  │       │
│  └──────┘ └──────┘ └──────┘       │
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ 2:00 │ │ 3:00 │ │ 4:00 │       │
│  │  PM  │ │  PM  │ │  PM  │       │
│  └──────┘ └──────┘ └──────┘       │
│                                     │
│  Duration: ○ 30min ● 60min ○ 90min │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Add notes (optional)        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Continue to Payment       │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Design Elements**:
- Provider summary at top
- Interactive calendar
- Available time slots grid
- Duration selector
- Notes field
- Clear pricing display
- Confirmation button

### 4.3 Group Event Card
**Purpose**: Display and join group sessions

**Layout**:
```
┌─────────────────────────────────────┐
│  Mindful Meditation Workshop        │
│  🟢 5 spots left                    │
├─────────────────────────────────────┤
│                                     │
│  Join a guided meditation session   │
│  for stress relief and mindfulness  │
│                                     │
│  📅 March 15, 2026 at 6:00 PM      │
│  ⏱️ 60 minutes                      │
│  👥 15/20 participants              │
│  💰 $25/person                      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [Avatar] Sarah Johnson      │   │
│  │ Meditation Instructor       │   │
│  └─────────────────────────────┘   │
│                                     │
│  🏷️ Meditation  Wellness  Stress   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Join Event ($25)       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      View Details           │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Design Elements**:
- Event title with availability badge
- Event description
- Date, time, duration, participant count
- Host information
- Tags for categorization
- Join button with price
- Details button

### 4.4 Provider Dashboard
**Purpose**: Manage bookings and events as an expert

**Layout**:
```
┌─────────────────────────────────────┐
│  ← Back    Provider Dashboard        │
├─────────────────────────────────────┤
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │  5   │ │  12  │ │  3   │       │
│  │Pending│ │Confirmed│ │Events│     │
│  └──────┘ └──────┘ └──────┘       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Overview | 1-on-1 | Events  │   │
│  └─────────────────────────────┘   │
│                                     │
│  Upcoming Sessions                  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🟡 Pending Approval         │   │
│  │ [Avatar] John Doe           │   │
│  │ March 10, 2026 · 2:00 PM    │   │
│  │ 1-on-1 Session · 60 min     │   │
│  │                             │   │
│  │ ┌─────────┐  ┌─────────┐   │   │
│  │ │ Approve │  │ Decline │   │   │
│  │ └─────────┘  └─────────┘   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🟢 Confirmed                │   │
│  │ [Avatar] Jane Smith         │   │
│  │ March 12, 2026 · 10:00 AM   │   │
│  │ 1-on-1 Session · 60 min     │   │
│  │                             │   │
│  │ ┌─────────┐  ┌─────────┐   │   │
│  │ │Join Call│  │ Details │   │   │
│  │ └─────────┘  └─────────┘   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   + Create Group Event      │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Design Elements**:
- Stats overview cards
- Tab navigation
- Booking cards with status indicators
- Action buttons (approve/decline/join)
- Create event button
- Calendar integration

---

## 5. Wallet & Payments

### 5.1 Wallet Balance Screen
**Purpose**: View and manage cryptocurrency wallet

**Layout**:
```
┌─────────────────────────────────────┐
│  ← Back          Wallet              │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │  Your Balance               │   │
│  │                             │   │
│  │  💰 $125.50 USD             │   │
│  │  ≈ 0.0234 CELO              │   │
│  │                             │   │
│  │  Wallet Address:            │   │
│  │  0x742d...8f3a  📋          │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      💵 Fund Wallet         │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      ↗️ Transfer Funds      │   │
│  └─────────────────────────────┘   │
│                                     │
│  Recent Transactions                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ↗️ Sent to @drsarah         │   │
│  │ -$5.00 USD                  │   │
│  │ March 4, 2026 · 2:30 PM     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ↙️ Received from @john      │   │
│  │ +$20.00 USD                 │   │
│  │ March 3, 2026 · 10:15 AM    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔒 Unlocked Premium Content │   │
│  │ -$5.00 USD                  │   │
│  │ March 2, 2026 · 4:45 PM     │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
│  🏠  📅  💬  ▶️  💰  👤          │
└─────────────────────────────────────┘
```

**Design Elements**:
- Balance card with gradient background
- USD and CELO amounts
- Wallet address with copy button
- Primary action buttons
- Transaction history list
- Transaction type icons
- Timestamp for each transaction

### 5.2 Fund Wallet Screen
**Purpose**: Add funds to wallet

**Layout**:
```
┌─────────────────────────────────────┐
│  ← Back      Fund Wallet             │
├─────────────────────────────────────┤
│                                     │
│  Add Funds to Your Wallet           │
│                                     │
│  Send CELO or USD tokens to:        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 0x742d35f8a9b2c1e4d6f8a3b2 │   │
│  │ 8f3a                        │   │
│  │                      📋 Copy│   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │     [QR Code]               │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Instructions:                      │
│  1. Open your crypto wallet app     │
│  2. Send CELO or USD tokens to the  │
│     address above                   │
│  3. Funds will appear in 2-5 minutes│
│                                     │
│  ⚠️ Only send CELO network tokens   │
│                                     │
│  Need help? Contact Support         │
│                                     │
└─────────────────────────────────────┘
```

**Design Elements**:
- Clear instructions
- Wallet address with copy button
- QR code for easy scanning
- Warning message
- Support link
- Clean, minimal design

### 5.3 Paywall Screen
**Purpose**: Purchase premium content

**Layout**:
```
┌─────────────────────────────────────┐
│  ← Back     Premium Content          │
├─────────────────────────────────────┤
│                                     │
│  🔒 Unlock Premium Content          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │ Advanced Nutrition Guide    │   │
│  │ for Athletes                │   │
│  │                             │   │
│  │ by @coachmike               │   │
│  │                             │   │
│  │ [Blurred Preview Image]     │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  What you'll get:                   │
│  ✓ Full article access              │
│  ✓ Downloadable resources           │
│  ✓ Lifetime access                  │
│  ✓ Support the creator              │
│                                     │
│  Price: $5.00 USD                   │
│                                     │
│  Your Balance: $125.50 USD          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Unlock Now ($5.00)        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Fund Wallet               │   │
│  └─────────────────────────────┘   │
│                                     │
│  Seller's Wallet:                   │
│  0x8f3a...2c1e  📋                  │
│                                     │
└─────────────────────────────────────┘
```

**Design Elements**:
- Content preview
- Benefits list
- Price display
- Balance check
- Primary purchase button
- Fund wallet option
- Seller information
- Secure payment indicator

---

## 6. Profile & Settings

### 6.1 Profile Screen
**Purpose**: View and manage user profile

**Layout**:
```
┌─────────────────────────────────────┐
│  Ambrosia        🔔  📥  ⚙️          │
├─────────────────────────────────────┤
│                                     │
│  ┌────┐    ┌──┐  ┌──┐  ┌──┐       │
│  │[📷]│    │25│  │1.2K│ │340│      │
│  │    │    │Posts│ │Followers│ │Following│
│  └────┘    └──┘  └──┘  └──┘       │
│                                     │
│  Dr. Sarah Johnson                  │
│  @drsarah                           │
│                                     │
│  Nutritionist & Wellness Coach      │
│  🌱 Plant-based nutrition expert    │
│                                     │
│  Interests: 💪 Fitness 🧠 Mental    │
│  Health 🥗 Nutrition +3 more        │
│                                     │
│  ┌──────────────┐ ┌──────────────┐ │
│  │ Edit Profile │ │Manage Interests│ │
│  └──────────────┘ └──────────────┘ │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📊 My Comprehensive Interests│   │
│  │                             │   │
│  │ Health Topics (8)           │   │
│  │ Following (340)             │   │
│  │ Content Interactions (156)  │   │
│  │ Bookings & Events (12)      │   │
│  │                             │   │
│  │ View Full Analysis →        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📰 | 🔖 | ❤️ | 👥 | 👤      │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Content Grid/List]                │
│                                     │
└─────────────────────────────────────┘
│  🏠  📅  💬  ▶️  💰  👤          │
└─────────────────────────────────────┘
```

**Design Elements**:
- Profile header with avatar
- Stats row (posts, followers, following)
- Bio section
- Interest tags (collapsible)
- Action buttons
- Comprehensive interests preview
- Tab navigation
- Content grid

### 6.2 Edit Profile Screen
**Purpose**: Update profile information

**Layout**:
```
┌─────────────────────────────────────┐
│  ✕ Cancel   Edit Profile      Save  │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │     [Profile Photo]         │   │
│  │     Change Photo            │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Name                        │   │
│  │ Dr. Sarah Johnson           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Username                    │   │
│  │ @drsarah                    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Bio                         │   │
│  │ Nutritionist & Wellness...  │   │
│  │                             │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│  150/150 characters                 │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Website                     │   │
│  │ https://drsarah.com         │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Location                    │   │
│  │ San Francisco, CA           │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Design Elements**:
- Photo upload with preview
- Text input fields
- Character counter for bio
- Save/cancel buttons
- Form validation
- Auto-save indicator

### 6.3 Comprehensive Interests Screen
**Purpose**: View detailed interest analytics

**Layout**:
```
┌─────────────────────────────────────┐
│  ← Back    My Interests              │
├─────────────────────────────────────┤
│                                     │
│  Your Interest Profile              │
│  Based on your activity and         │
│  preferences                        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🏷️ Health Topics (8)        │   │
│  │                             │   │
│  │ 💪 Fitness                  │   │
│  │ 🧠 Mental Health            │   │
│  │ 🥗 Nutrition                │   │
│  │ 🧘 Yoga & Meditation        │   │
│  │ [+4 more] ▼                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 👥 Social Network (340)     │   │
│  │                             │   │
│  │ Following: 340 people       │   │
│  │ Followers: 1.2K people      │   │
│  │ Network Strength: 85%       │   │
│  │                             │   │
│  │ View Details ▼              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ❤️ Content Interactions     │   │
│  │                             │   │
│  │ Liked Articles: 89          │   │
│  │ Bookmarked: 34              │   │
│  │ Commented: 45               │   │
│  │                             │   │
│  │ Top Topics:                 │   │
│  │ • Nutrition (34)            │   │
│  │ • Fitness (28)              │   │
│  │ • Mental Health (23)        │   │
│  │                             │   │
│  │ View Details ▼              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📅 Bookings & Events (12)   │   │
│  │                             │   │
│  │ Sessions Booked: 8          │   │
│  │ Events Attended: 4          │   │
│  │                             │   │
│  │ Specializations:            │   │
│  │ • Nutrition (5)             │   │
│  │ • Fitness (3)               │   │
│  │                             │   │
│  │ View Details ▼              │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Design Elements**:
- Collapsible sections
- Visual indicators (icons, numbers)
- Progress bars for metrics
- Expandable details
- Category breakdowns
- Analytics visualization

---

## 7. Messaging

### 7.1 Chat List Screen
**Purpose**: View all conversations

**Layout**:
```
┌─────────────────────────────────────┐
│  ← Back        Messages       ✏️    │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔍 Search messages...       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [Avatar] Dr. Sarah          │   │
│  │ Thanks for the session! 🙏  │   │
│  │ 2:30 PM                  ●  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [Avatar] Coach Mike         │   │
│  │ See you tomorrow at 10am    │   │
│  │ Yesterday                   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [Avatar] Jane Smith         │   │
│  │ Great article on nutrition! │   │
│  │ March 2                     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [Avatar] John Doe           │   │
│  │ You: Thanks! 😊             │   │
│  │ March 1                     │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
│  🏠  📅  💬  ▶️  💰  👤          │
└─────────────────────────────────────┘
```

**Design Elements**:
- Search bar
- New message button
- Conversation list
- Avatar, name, preview
- Timestamp
- Unread indicator (dot)
- Swipe actions (archive, delete)

### 7.2 Chat Window
**Purpose**: Send and receive messages

**Layout**:
```
┌─────────────────────────────────────┐
│  ← Back  [Avatar] Dr. Sarah    ⋮    │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Hi! How can I help you?     │   │
│  │                      10:15 AM│   │
│  └─────────────────────────────┘   │
│                                     │
│           ┌─────────────────────┐   │
│           │ I'd like to book a  │   │
│           │ session             │   │
│           │ 10:16 AM            │   │
│           └─────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Great! I have availability  │   │
│  │ tomorrow at 2pm             │   │
│  │                      10:17 AM│   │
│  └─────────────────────────────┘   │
│                                     │
│           ┌─────────────────────┐   │
│           │ Perfect! See you    │   │
│           │ then 👍             │   │
│           │ 10:18 AM            │   │
│           └─────────────────────┘   │
│                                     │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │ + | Type a message...    😊 │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Design Elements**:
- Header with contact info
- Message bubbles (sent/received)
- Timestamps
- Typing indicator
- Input field with emoji picker
- Attachment button
- Send button
- Read receipts

### 7.3 Chat Privacy Settings
**Purpose**: Control who can message you

**Layout**:
```
┌─────────────────────────────────────┐
│  ← Back    Privacy Settings          │
├─────────────────────────────────────┤
│                                     │
│  Who can message you?               │
│                                     │
│  ○ Everyone                         │
│  ● People you follow                │
│  ○ No one                           │
│                                     │
│  Message Requests                   │
│  ┌─────────────────────────────┐   │
│  │ ☑️ Allow message requests   │   │
│  └─────────────────────────────┘   │
│                                     │
│  Blocked Users (3)                  │
│  ┌─────────────────────────────┐   │
│  │ [Avatar] User 1             │   │
│  │ Unblock                     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [Avatar] User 2             │   │
│  │ Unblock                     │   │
│  └─────────────────────────────┘   │
│                                     │
│  Notifications                      │
│  ┌─────────────────────────────┐   │
│  │ ☑️ Message notifications    │   │
│  │ ☑️ Show message preview     │   │
│  │ ☐ Mute all messages         │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Design Elements**:
- Radio buttons for privacy levels
- Toggle switches
- Blocked users list
- Notification preferences
- Clear section headers

---

## 8. Notifications

### 8.1 Notifications Screen
**Purpose**: View all notifications

**Layout**:
```
┌─────────────────────────────────────┐
│  ← Back    Notifications      ⚙️    │
├─────────────────────────────────────┤
│                                     │
│  Today                              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ● [Avatar] Dr. Sarah        │   │
│  │ liked your article          │   │
│  │ "5 Ways to Improve..."      │   │
│  │ 2 hours ago                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ● [Avatar] Coach Mike       │   │
│  │ commented: "Great post!"    │   │
│  │ 4 hours ago                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ● 💰 Payment received       │   │
│  │ $5.00 from @john            │   │
│  │ 5 hours ago                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  Yesterday                          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [Avatar] Jane Smith         │   │
│  │ started following you       │   │
│  │ Yesterday at 3:45 PM        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📅 Booking confirmed        │   │
│  │ Session with Dr. Sarah      │   │
│  │ March 10 at 2:00 PM         │   │
│  │ Yesterday at 10:30 AM       │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
│  🏠  📅  💬  ▶️  💰  👤          │
└─────────────────────────────────────┘
```

**Design Elements**:
- Grouped by date
- Unread indicator (dot)
- Avatar/icon for each type
- Action text
- Timestamp
- Tap to view details
- Swipe to dismiss

### 8.2 Notification Settings
**Purpose**: Manage notification preferences

**Layout**:
```
┌─────────────────────────────────────┐
│  ← Back  Notification Settings       │
├─────────────────────────────────────┤
│                                     │
│  Push Notifications                 │
│  ┌─────────────────────────────┐   │
│  │ ☑️ Enable push notifications│   │
│  └─────────────────────────────┘   │
│                                     │
│  Content Interactions               │
│  ┌─────────────────────────────┐   │
│  │ ☑️ Likes                    │   │
│  │ ☑️ Comments                 │   │
│  │ ☑️ New followers            │   │
│  │ ☑️ Mentions                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  Bookings & Events                  │
│  ┌─────────────────────────────┐   │
│  │ ☑️ Booking confirmations    │   │
│  │ ☑️ Session reminders        │   │
│  │ ☑️ Event updates            │   │
│  └─────────────────────────────┘   │
│                                     │
│  Payments                           │
│  ┌─────────────────────────────┐   │
│  │ ☑️ Payment received         │   │
│  │ ☑️ Payment sent             │   │
│  │ ☑️ Low balance alerts       │   │
│  └─────────────────────────────┘   │
│                                     │
│  Messages                           │
│  ┌─────────────────────────────┐   │
│  │ ☑️ New messages             │   │
│  │ ☐ Message requests          │   │
│  └─────────────────────────────┘   │
│                                     │
│  Quiet Hours                        │
│  ┌─────────────────────────────┐   │
│  │ ☑️ Enable quiet hours       │   │
│  │ From: 10:00 PM              │   │
│  │ To: 7:00 AM                 │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Design Elements**:
- Toggle switches
- Grouped by category
- Time pickers for quiet hours
- Clear labels
- Save automatically

---

## 9. Additional Screens

### 9.1 Search Screen
**Purpose**: Search for content, users, and experts

**Layout**:
```
┌─────────────────────────────────────┐
│  ← Back         Search               │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔍 Search...                │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ All | Articles | Reels |    │   │
│  │ People | Experts            │   │
│  └─────────────────────────────┘   │
│                                     │
│  Recent Searches                    │
│  • nutrition tips                   │
│  • yoga for beginners               │
│  • @drsarah                         │
│                                     │
│  Trending Topics                    │
│  🔥 #MentalHealthAwareness          │
│  🔥 #PlantBasedDiet                 │
│  🔥 #FitnessMotivation              │
│                                     │
│  Suggested Experts                  │
│  ┌─────────────────────────────┐   │
│  │ [Avatar] Dr. Sarah          │   │
│  │ Nutritionist                │   │
│  │ Follow                      │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 9.2 Article Reader
**Purpose**: Read full article content

**Layout**:
```
┌─────────────────────────────────────┐
│  ← Back                    ⋮        │
├─────────────────────────────────────┤
│                                     │
│  [Cover Image]                      │
│                                     │
│  5 Ways to Improve Your             │
│  Mental Health Today                │
│                                     │
│  [Avatar] Dr. Sarah Johnson         │
│  @drsarah · March 4, 2026           │
│  5 min read                         │
│                                     │
│  ❤️ 234  💬 45  🔖 12  ↗️          │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Mental health is crucial for...    │
│                                     │
│  [Article Content]                  │
│                                     │
│  Lorem ipsum dolor sit amet...      │
│                                     │
│  [Inline Images]                    │
│                                     │
│  More content here...               │
│                                     │
│  💪 Fitness  🧠 Mental Health       │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Comments (45)                      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [Avatar] John Doe           │   │
│  │ Great article! Very helpful │   │
│  │ 2h ago  ❤️ 5  💬 Reply      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Write a comment...          │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 9.3 Settings Screen
**Purpose**: App configuration and preferences

**Layout**:
```
┌─────────────────────────────────────┐
│  ← Back         Settings             │
├─────────────────────────────────────┤
│                                     │
│  Account                            │
│  ┌─────────────────────────────┐   │
│  │ Edit Profile              → │   │
│  │ Manage Interests          → │   │
│  │ Privacy & Security        → │   │
│  │ Notifications             → │   │
│  └─────────────────────────────┘   │
│                                     │
│  Provider Settings                  │
│  ┌─────────────────────────────┐   │
│  │ Become an Expert          → │   │
│  │ Provider Dashboard        → │   │
│  │ Booking Settings          → │   │
│  └─────────────────────────────┘   │
│                                     │
│  Wallet & Payments                  │
│  ┌─────────────────────────────┐   │
│  │ Wallet Settings           → │   │
│  │ Transaction History       → │   │
│  │ Payment Methods           → │   │
│  └─────────────────────────────┘   │
│                                     │
│  App Preferences                    │
│  ┌─────────────────────────────┐   │
│  │ Language                  → │   │
│  │ Theme                     → │   │
│  │ Data & Storage            → │   │
│  └─────────────────────────────┘   │
│                                     │
│  Support                            │
│  ┌─────────────────────────────┐   │
│  │ Help Center               → │   │
│  │ Contact Support           → │   │
│  │ Terms of Service          → │   │
│  │ Privacy Policy            → │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Sign Out               │   │
│  └─────────────────────────────┘   │
│                                     │
│  Version 1.0.0                      │
│                                     │
└─────────────────────────────────────┘
```

---

## 10. User Flow Diagrams

### 10.1 Sign Up & Onboarding Flow
```
Welcome Screen
    ↓
Sign Up (Email)
    ↓
Interest Selection
    ↓
Profile Setup
    ↓
Home Feed
```

### 10.2 Content Discovery & Purchase Flow
```
Home Feed
    ↓
Article Card (Premium)
    ↓
Paywall Screen
    ↓
[Sufficient Balance?]
    ├─ Yes → Payment Confirmation → Article Reader
    └─ No → Fund Wallet → Payment Confirmation → Article Reader
```

### 10.3 Booking Flow
```
Booking Browser
    ↓
Provider Card
    ↓
Booking Calendar
    ↓
Select Date & Time
    ↓
Payment Confirmation
    ↓
Booking Confirmed
    ↓
Session Reminder (Notification)
    ↓
Join Video Call
```

### 10.4 Content Creation Flow
```
Home Feed
    ↓
Write Button
    ↓
[Article or Reel?]
    ├─ Article → Write Article → Add Tags → Set Price → Publish
    └─ Reel → Record Video → Add Music → Add Caption → Publish
```

---

*This comprehensive screen design document provides a complete visual and functional blueprint for the Ambrosia platform, ensuring consistency and excellent user experience across all features.*
