# Design Guidelines: Toshkent Sartaroshxona Telegram Mini App

## Design Approach
**Reference-Based Approach** drawing from Telegram Mini Apps native patterns combined with service booking platforms (Airbnb, Booking.com). This creates a familiar, trustworthy booking experience within Telegram's ecosystem.

**Key Principles:**
- Telegram-native aesthetics: Clean, efficient, mobile-optimized
- Trust-building visual hierarchy for service bookings
- Quick interaction patterns for on-the-go booking
- Cultural appropriateness for Uzbek market

## Typography
**Font Stack:** System fonts for optimal Telegram Mini App performance
- Primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- Supports Uzbek Cyrillic perfectly

**Type Scale:**
- Headers (Barbershop names): text-2xl font-bold (24px)
- Section titles: text-lg font-semibold (18px)
- Body text (services, reviews): text-base (16px)
- Captions (timestamps, metadata): text-sm (14px)
- Buttons/CTAs: text-base font-medium

## Layout System
**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8
- Component padding: p-4, p-6
- Card spacing: gap-4, space-y-6
- Section margins: my-6, my-8

**Container Strategy:**
- Max width: max-w-md (optimized for mobile screens)
- Side padding: px-4 (consistent breathing room)
- Full-width cards with rounded corners: rounded-2xl

## Component Library

### Navigation
**Bottom Tab Bar** (Fixed position)
- 3 tabs: Bosh sahifa | Yozilish | Profil
- Icon + label format
- Active state with accent indicator
- Height: h-16 with safe area padding

### Barbershop Cards
**Featured Card Layout:**
- Two-image gallery at top (rounded-t-2xl, 2:3 aspect ratio grid)
- Shop name + star rating badge (floating on image with backdrop blur)
- Service tags as horizontal pills below images
- Review snippet preview (1-2 lines)
- "Ko'proq ko'rish" CTA button

### Booking Interface
**Time Slot Picker:**
- Calendar widget (week view, horizontal scroll)
- Time grid (2-column layout for morning/afternoon)
- Selected state with filled accent background
- Available/booked visual distinction

**Confirmation Card:**
- Summary layout: Shop photo + details
- Selected service/time highlighted
- "Band qilish" primary CTA (full-width, large touch target)

### Barber Dashboard
**Booking Request Cards:**
- Customer info header (name, time requested)
- Service details body
- Dual action buttons: ✅ Qabul / ❌ Rad (side-by-side, equal width)
- Status badges (Kutilmoqda, Qabul qilindi, Rad etildi)

### Review Components
**Star Rating Input:**
- 5 interactive stars (large touch targets, min 44x44px)
- Text area below for comments
- Character count indicator

**Review Display:**
- Star rating + user name + timestamp header
- Review text (max 3 lines, expandable)
- Helpful/not helpful micro-interactions (optional)

### Status Indicators
- Badge design: rounded-full, px-3, py-1
- Kutilmoqda: amber/yellow tone
- Qabul qilindi: green tone
- Rad etildi: red tone

## Images
**Hero Images:** None - Telegram Mini Apps prioritize speed over large heroes

**Barbershop Images (Critical):**
- 2 images per shop (exterior/interior or styling samples)
- Aspect ratio: 4:3 or 1:1
- Placement: Top of shop cards in 2-column grid
- Grid gap: gap-2 between images
- Fallback: Placeholder with shop initials

**Image Treatment:**
- Rounded corners: rounded-xl
- Subtle shadow for depth: shadow-md
- Lazy loading for performance

## Animations
**Minimal, purposeful only:**
- Tab switching: Simple fade transition (150ms)
- Booking confirmation: Success checkmark animation (300ms)
- Card interactions: Scale on tap (0.98 transform, 100ms)
- NO scroll animations, NO parallax effects

## Layout Specifics

**Home Screen:**
- Welcome header with user name
- Shop cards in vertical stack (space-y-4)
- Infinite scroll pagination

**Shop Detail:**
- Sticky header with back button + shop name
- Image gallery at top
- Tabbed content: Xizmatlar | Sharhlar
- Fixed CTA: "Yozilish" button

**Profile Screen:**
- User info card
- Booking history list (chronological, grouped by status)
- Settings/logout options

**Critical Requirements:**
- All interactive elements minimum 44x44px touch target
- Loading states for all async operations
- Empty states with helpful messaging in Uzbek
- Error handling with user-friendly Uzbek messages
- Offline indicator when network unavailable