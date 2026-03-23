# Ambrosia Design System & UI/UX Documentation

## 1. Color Scheme

### Primary Colors
```css
--color-primary: #BF1A65        /* Deep Rose - Main brand color */
--color-accent: #BF1A65         /* Deep Rose - Interactive elements */
--color-primary-light: #ec4899  /* Pink 500 - Hover states */
--color-primary-dark: #9d174d   /* Pink 800 - Active states */
```

### Secondary Colors
```css
--color-secondary: #8B5CF6      /* Purple 500 - Secondary actions */
--color-secondary-light: #A78BFA /* Purple 400 - Highlights */
--color-secondary-dark: #6D28D9  /* Purple 700 - Depth */
```

### Neutral Colors
```css
--color-background: #fce7f3     /* Ambrosia 100 - Main background */
--color-surface: #FFFFFF        /* White - Cards, modals */
--color-surface-alt: #F9FAFB    /* Gray 50 - Alternative surfaces */
--color-border: #E5E7EB         /* Gray 200 - Borders */
--color-divider: #D1D5DB        /* Gray 300 - Dividers */
```

### Text Colors
```css
--color-text-primary: #1F2937   /* Gray 800 - Primary text */
--color-text-secondary: #6B7280 /* Gray 500 - Secondary text */
--color-text-tertiary: #9CA3AF  /* Gray 400 - Tertiary text */
--color-text-inverse: #FFFFFF   /* White - Text on dark backgrounds */
```

### Semantic Colors
```css
--color-success: #10B981        /* Green 500 - Success states */
--color-success-light: #D1FAE5  /* Green 100 - Success backgrounds */
--color-warning: #F59E0B        /* Amber 500 - Warning states */
--color-warning-light: #FEF3C7  /* Amber 100 - Warning backgrounds */
--color-error: #EF4444          /* Red 500 - Error states */
--color-error-light: #FEE2E2    /* Red 100 - Error backgrounds */
--color-info: #3B82F6           /* Blue 500 - Info states */
--color-info-light: #DBEAFE     /* Blue 100 - Info backgrounds */
```

### Gradient Colors
```css
--gradient-primary: linear-gradient(135deg, #BF1A65 0%, #ec4899 100%)
--gradient-secondary: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)
--gradient-accent: linear-gradient(135deg, #BF1A65 0%, #d946ef 100%)
--gradient-wellness: linear-gradient(135deg, #10B981 0%, #3B82F6 100%)
--gradient-premium: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)
```

## 2. Typography

### Font Family
```css
--font-primary: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
--font-heading: 'Roboto', sans-serif
--font-mono: 'Roboto Mono', 'Courier New', monospace
```

### Font Sizes
```css
--text-xs: 0.75rem      /* 12px - Captions, labels */
--text-sm: 0.875rem     /* 14px - Small text */
--text-base: 1rem       /* 16px - Body text */
--text-lg: 1.125rem     /* 18px - Large body */
--text-xl: 1.25rem      /* 20px - Small headings */
--text-2xl: 1.5rem      /* 24px - Medium headings */
--text-3xl: 1.875rem    /* 30px - Large headings */
--text-4xl: 2.25rem     /* 36px - Extra large headings */
--text-5xl: 3rem        /* 48px - Hero text */
```

### Font Weights
```css
--font-light: 300
--font-regular: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

### Line Heights
```css
--leading-tight: 1.25
--leading-normal: 1.5
--leading-relaxed: 1.7
--leading-loose: 2
```

## 3. Spacing System

### Base Unit: 4px (0.25rem)

```css
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-5: 1.25rem   /* 20px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-10: 2.5rem   /* 40px */
--space-12: 3rem     /* 48px */
--space-16: 4rem     /* 64px */
--space-20: 5rem     /* 80px */
--space-24: 6rem     /* 96px */
```

## 4. Border Radius

```css
--radius-sm: 0.375rem    /* 6px - Small elements */
--radius-md: 0.5rem      /* 8px - Buttons, inputs */
--radius-lg: 0.75rem     /* 12px - Cards */
--radius-xl: 1rem        /* 16px - Large cards */
--radius-2xl: 1.5rem     /* 24px - Modals */
--radius-full: 9999px    /* Full circle */
```

## 5. Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
--shadow-accent: 0 4px 12px rgba(191, 26, 101, 0.3)
```

## 6. Animation & Transitions

```css
--transition-fast: 150ms ease-in-out
--transition-base: 200ms ease-in-out
--transition-slow: 300ms ease-in-out
--transition-slower: 500ms ease-in-out

--ease-in: cubic-bezier(0.4, 0, 1, 1)
--ease-out: cubic-bezier(0, 0, 0.2, 1)
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
```

## 7. Breakpoints

```css
--breakpoint-sm: 640px    /* Mobile landscape */
--breakpoint-md: 768px    /* Tablet */
--breakpoint-lg: 1024px   /* Desktop */
--breakpoint-xl: 1280px   /* Large desktop */
--breakpoint-2xl: 1536px  /* Extra large desktop */
```

## 8. Component Patterns

### Buttons

#### Primary Button
```css
background: var(--gradient-primary)
color: white
padding: 12px 24px
border-radius: var(--radius-lg)
font-weight: var(--font-medium)
box-shadow: var(--shadow-accent)
transition: var(--transition-base)

hover: transform: translateY(-2px), shadow: var(--shadow-xl)
active: transform: translateY(0)
```

#### Secondary Button
```css
background: white
color: var(--color-primary)
border: 2px solid var(--color-primary)
padding: 12px 24px
border-radius: var(--radius-lg)
font-weight: var(--font-medium)
transition: var(--transition-base)

hover: background: var(--color-primary), color: white
```

#### Ghost Button
```css
background: transparent
color: var(--color-text-secondary)
padding: 12px 24px
border-radius: var(--radius-lg)
transition: var(--transition-base)

hover: background: var(--color-surface-alt)
```

### Cards

#### Standard Card
```css
background: white
border-radius: var(--radius-xl)
padding: var(--space-6)
box-shadow: var(--shadow-md)
border: 1px solid var(--color-border)
transition: var(--transition-base)

hover: box-shadow: var(--shadow-xl), transform: translateY(-4px)
```

#### Premium Card (Gated Content)
```css
background: linear-gradient(135deg, #FEF3C7 0%, #FEE2E2 100%)
border: 2px solid var(--color-warning)
border-radius: var(--radius-xl)
padding: var(--space-6)
position: relative

::before: content: "🔒", position: absolute, top-right
```

### Input Fields

```css
background: white
border: 2px solid var(--color-border)
border-radius: var(--radius-lg)
padding: 12px 16px
font-size: var(--text-base)
transition: var(--transition-base)

focus: border-color: var(--color-primary), outline: none, box-shadow: 0 0 0 3px rgba(191, 26, 101, 0.1)
error: border-color: var(--color-error)
```

### Badges & Tags

```css
background: var(--color-primary)
color: white
padding: 4px 12px
border-radius: var(--radius-full)
font-size: var(--text-xs)
font-weight: var(--font-medium)
```

## 9. Icon System

### Icon Sizes
```css
--icon-xs: 12px
--icon-sm: 16px
--icon-md: 20px
--icon-lg: 24px
--icon-xl: 32px
--icon-2xl: 48px
```

### Icon Library
- Font Awesome 6.4.0 (Primary)
- Lucide React (Secondary)

### Common Icons
- Home: `fa-home`
- Calendar: `fa-calendar-alt`
- Messages: `fa-comment`
- Reels: `fa-play-circle`
- Wallet: `fa-wallet`
- Profile: `fa-user-circle`
- Notifications: `fa-bell`
- Settings: `fa-cog`
- Search: `fa-search`
- Heart/Like: `fa-heart`
- Bookmark: `fa-bookmark`
- Share: `fa-share`
- Lock (Premium): `fa-lock`
- Video: `fa-video`
- Article: `fa-newspaper`

## 10. Design Principles

### Modern Health & Wellness Aesthetic
1. **Clean & Minimal**: Reduce visual clutter, focus on content
2. **Soft & Approachable**: Use rounded corners, gentle shadows
3. **Trustworthy**: Professional color palette with medical credibility
4. **Energetic**: Vibrant accents that inspire action
5. **Accessible**: High contrast ratios, clear typography

### Mobile-First Approach
- Design for 375px width minimum
- Touch targets minimum 44x44px
- Thumb-friendly navigation at bottom
- Swipe gestures for reels and content
- Progressive enhancement for larger screens

### Content Hierarchy
1. **Primary**: Main content (articles, reels, bookings)
2. **Secondary**: Engagement metrics (likes, comments, views)
3. **Tertiary**: Metadata (timestamps, tags, author info)

### Interaction Patterns
- **Tap**: Primary actions (like, bookmark, follow)
- **Long Press**: Secondary actions (share, report)
- **Swipe**: Navigation (reels, stories)
- **Pull to Refresh**: Update content feeds
- **Infinite Scroll**: Content discovery

## 11. Accessibility Standards

### WCAG 2.1 Level AA Compliance
- Color contrast ratio minimum 4.5:1 for normal text
- Color contrast ratio minimum 3:1 for large text
- Focus indicators visible on all interactive elements
- Keyboard navigation support
- Screen reader compatibility
- Alternative text for images
- Semantic HTML structure

### Touch Targets
- Minimum size: 44x44px
- Spacing between targets: 8px minimum
- Clear visual feedback on interaction

## 12. Responsive Grid System

### Mobile (< 640px)
- Single column layout
- Full-width cards
- Bottom navigation
- Collapsible sections

### Tablet (640px - 1024px)
- 2-column grid for cards
- Side navigation option
- Expanded content areas

### Desktop (> 1024px)
- 3-4 column grid for cards
- Persistent side navigation
- Multi-panel layouts
- Hover interactions

## 13. Loading States

### Skeleton Screens
```css
background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)
background-size: 200% 100%
animation: shimmer 1.5s infinite
```

### Spinners
```css
border: 3px solid var(--color-border)
border-top-color: var(--color-primary)
border-radius: var(--radius-full)
animation: spin 1s linear infinite
```

### Progress Bars
```css
background: var(--color-border)
height: 4px
border-radius: var(--radius-full)

::after: background: var(--gradient-primary), transition: width 300ms
```

## 14. Empty States

### Design Pattern
- Large icon (48-64px) in muted color
- Clear heading explaining the state
- Supportive description text
- Primary action button (when applicable)
- Illustration or graphic (optional)

### Examples
- No articles: Newspaper icon + "Write your first article" CTA
- No bookmarks: Bookmark icon + "Save content to see it here"
- No followers: Users icon + "Share great content"

## 15. Error States

### Design Pattern
- Error icon in red
- Clear error message
- Suggested action or solution
- Retry button
- Support link (for critical errors)

### Toast Notifications
```css
background: white
border-left: 4px solid [semantic-color]
border-radius: var(--radius-lg)
padding: var(--space-4)
box-shadow: var(--shadow-xl)
animation: slide-in-right 300ms
```

---

*This design system ensures consistency, accessibility, and a modern user experience across the Ambrosia platform.*
