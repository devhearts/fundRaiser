# Fundraising Platform Design Guidelines

## Design Approach

**Reference-Based Design**: Inspired by GoFundMe and Kickstarter's trust-building interfaces with emphasis on transparency, progress visualization, and emotional connection. The design prioritizes clarity, credibility, and ease of contribution.

**Core Principle**: Every element should reinforce trust and motivate action through clean presentation, clear progress indicators, and professional polish.

## Color System

**Primary Palette** (Dark & Light Mode):
- **Trust Green**: 142 73% 44% (Primary actions, success states, progress bars)
- **Reliable Blue**: 211 100% 50% (Secondary actions, links, information)
- **Highlight Yellow**: 45 100% 51% (Urgent CTAs, milestones, accent highlights)
- **Light Grey Background**: 210 17% 98% (Page backgrounds, card containers)
- **Dark Grey Text**: 210 11% 15% (Primary text, headings)
- **Teal Success**: 187 69% 42% (Confirmation states, completion indicators)

**Usage Strategy**:
- Green for all primary donation/contribution CTAs to evoke generosity and trust
- Blue for informational elements and secondary actions
- Yellow sparingly for milestone celebrations and urgent deadlines
- Maintain high contrast ratios (4.5:1 minimum) for accessibility

## Typography

**Font Stack**:
- **Primary**: Inter (headings, UI elements, data displays)
- **Secondary**: Open Sans (body text, descriptions, forms)

**Scale & Hierarchy**:
- Hero Headlines: text-5xl to text-6xl, font-bold
- Event Titles: text-3xl to text-4xl, font-semibold
- Section Headers: text-2xl, font-semibold
- Body Text: text-base, font-normal, leading-relaxed
- Small Text/Metadata: text-sm, text-gray-600

## Layout System

**Spacing Primitives**: Use Tailwind units of 4, 6, 8, 12, 16, 20 for consistent rhythm
- Component padding: p-6 to p-8
- Section spacing: py-12 to py-20
- Card gaps: gap-6 to gap-8
- Container max-width: max-w-7xl

**Grid Strategy**:
- Event cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Dashboard tables: Full-width responsive with horizontal scroll on mobile
- Contribution forms: Single column max-w-2xl for focus

## Component Library

### Event Cards
- Elevated cards with shadow-md, rounded-xl corners
- Cover image at top (16:9 ratio), event title overlay with gradient
- Progress bar prominently displayed showing fundraising percentage
- Key metrics: Amount raised, Goal amount, Days remaining
- Quick action buttons for View/Share/Edit
- Status badges (Active/Completed/Upcoming) in top-right corner

### Progress Bars
- Full-width bars with rounded-full styling
- Animated fill showing percentage raised
- Color transitions: Under 50% (blue), 50-90% (green), 90%+ (teal), 100%+ (gradient green-to-teal)
- Display both visual bar and numerical percentage
- Include milestone markers at 25%, 50%, 75%, 100%

### Contribution Forms
- Clean, spacious layout with generous padding
- Large, touch-friendly input fields (h-12 minimum)
- Pre-set amount buttons ($25, $50, $100, $250, Custom)
- Donor information fields with clear labels above inputs
- Privacy toggle for anonymous donations
- Prominent "Make Contribution" button (green, full-width on mobile)

### Admin Dashboard Tables
- Sticky header row with sorting indicators
- Striped rows for readability (even rows slightly shaded)
- Status indicators with color-coded badges
- Inline action buttons (View, Edit, Share, Notify)
- Pagination controls at bottom
- Export/Filter controls in top-right toolbar

### Navigation
- Sticky top navigation with platform logo (left), main nav (center), user/admin (right)
- Primary green CTA button "Create Event" in navigation
- Mobile: Hamburger menu with slide-out drawer
- Breadcrumbs on admin pages for context

## Page-Specific Guidelines

### Event Landing Page (Shareable Link View)
**Hero Section**:
- Large cover image (16:9 aspect ratio, min-height: 400px)
- Event title overlay with semi-transparent dark gradient background
- Share buttons positioned absolutely in top-right
- Countdown timer for events with deadlines

**Content Layout**:
- Two-column layout (lg: 2/3 content, 1/3 contribution sidebar)
- Mobile: Stack with contribution form following description
- Event description with rich text formatting
- Organizer profile card with photo, name, verification badge
- Google Maps embed showing event location (rounded corners, shadow)
- Recent contributions list with donor names (or Anonymous) and amounts

**Contribution Sidebar** (Sticky on desktop):
- White card with strong shadow-lg
- Current progress prominently displayed
- Amount raised vs Goal with large numbers
- Contribution form integrated
- Social share buttons below form

### Event Creation Flow
- Multi-step progress indicator at top
- Steps: Details → Goal & Timeline → Location & Media → Privacy Settings
- Large dropzone for cover image upload with preview
- Rich text editor for description with formatting toolbar
- Google Places autocomplete for location input
- Public/Private toggle with clear explanation of differences
- Preview button showing how event will appear to contributors

### Admin Dashboard
- Overview cards at top showing total raised, active events, pending pledges
- Tabbed interface: All Events | Contributions | Notifications | Reminders
- Filter/search bar with date range picker
- Bulk action controls for multi-select
- Export functionality for reporting

## Images

**Hero Images**:
- Event landing pages feature large hero images (1920x1080 minimum)
- Images show event-related content: community gatherings, cause beneficiaries, or relevant activities
- Use subtle dark gradient overlay (from transparent to rgba(0,0,0,0.5)) for text legibility

**Placeholder Strategy**:
- Default cover images for events without uploads: abstract patterns in brand colors
- Use Unsplash for demo/placeholder images in relevant categories
- Avatar placeholders with initials for donors without photos

**Image Placement**:
- Event cards: Top-aligned cover image
- Landing page: Full-width hero
- Organizer profiles: Circular avatar (80px-120px diameter)
- Admin dashboard: Thumbnail previews (60px square)

## Interaction Patterns

**Hover States**:
- Cards: Lift effect with increased shadow (translate-y-1, shadow-xl)
- Buttons: Slight scale (scale-105) and brightness increase
- Progress bars: Glow effect on hover

**Loading States**:
- Skeleton screens for data tables and event cards
- Animated progress indicators for form submissions
- Optimistic UI updates for contribution submissions

**Animations**: Minimal and purposeful
- Page transitions: Smooth fade-in (300ms)
- Progress bars: Animated fill on load (1s ease-out)
- Notification toasts: Slide in from top-right
- Success confirmations: Subtle scale celebration effect

## Trust & Credibility Elements

- Display verification badges for organizers
- Show recent contribution activity (live feed)
- Include security badges near payment forms
- Clear refund/privacy policy links in footer
- Testimonials/success stories from previous campaigns
- Social proof: "Join X supporters" messaging
- Transparent fee breakdown before contribution submission

This design system creates a professional, trustworthy platform that motivates contributions while maintaining clarity and ease of use across all user flows.