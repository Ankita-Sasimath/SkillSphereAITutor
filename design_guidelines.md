# Design Guidelines: AI Skill Assessment & Training Platform (Futuristic Glassmorphism Edition)

## Design Approach

**Selected Approach:** Material Design 3 adapted for Glassmorphism Aesthetic  
**Justification:** Utility-focused educational platform requiring clarity and data visualization, now elevated with futuristic glass-style UI for immersive, modern experience.

**Design Principles:**
- **Glass-Forward:** Transparent cards with frosted backdrop blur as primary surface treatment
- **Depth Through Layers:** Z-axis depth via parallax floating elements and layered glass panels
- **Neon Accents:** Strategic cyan/electric blue highlights for interactivity and focus
- **Readability Priority:** High contrast white text on black ensures content clarity despite visual effects

---

## Typography

**Font Stack:**
- **Primary:** Space Grotesk (via Google Fonts) - futuristic, geometric sans-serif for UI
- **Display:** Orbitron - sci-fi aesthetic for major headings

**Hierarchy:**
- **Hero/Page Titles:** Orbitron Bold, text-5xl (mobile: text-4xl), white with subtle cyan glow
- **Section Headers:** Orbitron Medium, text-3xl (mobile: text-2xl), white
- **Card Titles:** Space Grotesk SemiBold, text-xl, white
- **Body Text:** Space Grotesk Regular, text-base, leading-relaxed, white/gray-200
- **Labels:** Space Grotesk Medium, text-sm, gray-300
- **Metadata:** Space Grotesk Regular, text-xs, gray-400

---

## Layout System

**Spacing Primitives:** Tailwind units **2, 4, 6, 8, 12, 16**
- Glass card padding: `p-6` or `p-8`
- Section spacing: `py-16` to `py-24`
- Grid gaps: `gap-6`
- Form spacing: `space-y-4`

**Background Treatment:**
- Pure black base (`bg-black`)
- Fixed 3D parallax layer with floating academic elements (books, pencils, notebooks at varying depths)
- Elements positioned at z-depths: near (-100px), mid (0), far (+100px) for parallax effect
- Subtle particle effects (dots/lines) suggesting digital connectivity

**Container Widths:**
- App wrapper: `max-w-7xl mx-auto px-6`
- Content sections: `max-w-6xl`
- Centered content: `max-w-3xl`

---

## Glassmorphism Specifications

**Standard Glass Card:**
- Background: `rgba(255, 255, 255, 0.05)` with `backdrop-filter: blur(20px)`
- Border: `1px solid rgba(255, 255, 255, 0.1)`
- Border radius: `rounded-2xl`
- Shadow: Subtle dark shadow for depth separation

**Interactive Glass Elements:**
- Hover: Increase background opacity to `rgba(255, 255, 255, 0.08)` + cyan border glow
- Active/Selected: `rgba(0, 255, 255, 0.1)` background tint
- Focus: Neon cyan outline glow (2px)

**Neon Accent Colors:**
- Primary Cyan: `#00FFFF` (rgb(0, 255, 255))
- Electric Blue: `#0080FF` (rgb(0, 128, 255))
- Apply as: borders, button backgrounds, icons, progress indicators, hover glows

---

## Component Library

### Navigation

**Sidebar (Desktop):**
- Fixed left sidebar (280px width) with glass treatment
- Logo at top with cyan accent glow
- Nav items as glass pills with icon + label
- Hover: Pop effect (scale-105) + cyan left border glow
- Active: Stronger cyan background tint

**Top Bar (Mobile):**
- Fixed glass header with hamburger menu
- Slide-out glass drawer from left

### Hero Section

**Pre-Login Landing:**
- Full-viewport hero with centered content
- Background: Large abstract tech/AI visualization (neural networks, digital brain, holographic interfaces)
- Image treatment: Slight blur with cyan/blue color grading overlay
- Foreground: Glass card container with:
  - Orbitron headline with cyan gradient text
  - Space Grotesk tagline in white
  - Dual CTA buttons (primary: solid cyan glow button, secondary: glass outline button)
  - Buttons have blurred backgrounds when over image

### Dashboard

**Stats Cards (4-grid on desktop):**
- Glass cards with large metric numbers
- Neon cyan icon indicators
- Subtle hover lift + glow

**Progress Visualization:**
- Circular progress rings with cyan/blue gradient fills
- Glass container backgrounds
- Animated fill transitions
- Line charts with cyan stroke and gradient area fill
- Grid lines in subtle white (10% opacity)

**Course Recommendation Cards:**
- Horizontal glass cards with 16:9 thumbnail left (200px)
- Thumbnail has glass border frame
- Right content: title, metadata, difficulty badge (glass pill with cyan accent)
- CTA: Solid cyan glow button

### Quiz Interface

**Question Container:**
- Central glass panel (max-w-3xl)
- Large question text in white
- Multiple choice: Glass option cards with full-card clickable areas
- Selected state: Cyan border glow + tinted background
- Progress dots at bottom (cyan fills for completed)
- Navigation: Glass buttons with cyan on hover

**Results Screen:**
- Large circular score display with animated cyan ring
- Glass badge for skill classification
- Topic breakdown in glass cards with cyan progress bars
- Prominent glass CTA button with glow

### AI Chat Mentor

**Launcher:**
- Fixed bottom-right glass bubble (70px) with cyan pulsing glow
- Floating shadow for depth

**Chat Panel:**
- Expands to glass modal (mobile) or 400px docked sidebar (desktop)
- Message bubbles:
  - User: Glass with cyan tint, right-aligned
  - AI: Glass with blue tint, left-aligned
- Input: Glass textarea with cyan focus glow
- Quick suggestion chips: Small glass pills with cyan borders

### Forms

**Multi-step Onboarding:**
- Glass stepper with cyan active step indicators
- Each step: Central glass card (max-w-2xl)
- Domain selection: Glass chip toggles with cyan selected state
- Input fields: Glass style with cyan underline on focus
- Error states: Red glow border

---

## Animations

**Parallax Background:**
- Floating elements move subtly on mouse movement (mousemove tracking)
- Depth-based speed: Near elements move faster, far elements slower
- Elements rotate slowly (360° over 60s)

**UI Interactions:**
- Glass card hover: Lift (translateY -4px) + cyan glow (duration-300)
- Button hover: Intense cyan glow expansion
- Progress animations: Smooth fills (duration-700)
- Page transitions: Fade with slight scale (duration-200)
- NO scroll animations

---

## Images

**Hero Image:**
- Full-width futuristic AI/tech visualization (neural networks, holographic interfaces, digital learning space)
- Color palette: Dark blues, cyans, purples
- Overlay with radial gradient from black edges for vignette effect

**Course Thumbnails:**
- 16:9 ratio with glass frame borders
- Tech/educational themed imagery
- Consistent dark aesthetic with pops of color

**Background Elements:**
- SVG/PNG academic icons (books, pencils, notebooks, graduation caps) with glass/translucent treatment
- Positioned at varying screen positions and z-depths

**Empty States:**
- Minimal line-art illustrations in cyan/white on glass cards

---

## Accessibility

- White text on black ensures WCAG AAA contrast
- Cyan accents maintain minimum 4.5:1 against black
- Glass cards have subtle borders for shape definition
- All interactive elements: 44px minimum touch targets
- Focus indicators: Cyan glow outlines
- Reduced motion option disables parallax for accessibility