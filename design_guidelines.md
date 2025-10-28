# Campus Crush - Design Guidelines (Compacted)

## Design Approach & Principles

**Inspirations**: Tinder (card interactions), Instagram (profile grids), Duolingo (gamification/leaderboards), Spotify (charts)

**Core Principles**:
1. **Mobile-First**: Thumb-friendly interactions, bottom navigation
2. **Gamification**: Visual feedback, progress indicators, rewards
3. **Privacy**: Minimalist cards, no personal data exposure
4. **Social Energy**: Vibrant, youthful, professional

## Typography

**Fonts** (Google Fonts):
- **Display**: Clash Display/Sora (700, 800) - Headlines, leaderboard numbers
- **Primary**: Inter (400-700) - All UI text

**Hierarchy**:
- Hero headlines: `text-5xl/7xl font-bold` (display)
- Page titles: `text-4xl font-bold` (display)
- Section headers: `text-2xl/3xl font-semibold`
- Leaderboard ranks: `text-6xl/8xl` (display)
- Profile names: `text-xl font-semibold`
- Rating scores: `text-4xl/5xl font-bold` (display)
- Body: `text-base font-normal`
- Labels: `text-sm font-medium uppercase tracking-wide`

## Layout & Spacing

**Spacing Scale**: 2, 4, 6, 8, 12, 16, 24
- Micro: `p-2 gap-2`
- Standard: `p-4 gap-4 m-6`
- Sections: `p-8 py-12/16`
- Major sections: `py-24`

**Grid Breakpoints**:
- Mobile: Single column, `max-w-lg`
- Tablet: `md:grid-cols-2`
- Desktop: `lg:grid-cols-3 xl:grid-cols-4`

**Containers**:
- Full-width: `w-full max-w-7xl mx-auto px-4`
- Content: `max-w-6xl`
- Profile cards: `max-w-sm`

## Color System

**Brand Colors**:
- Primary: Vibrant purple/pink gradient (`from-purple-600 to-pink-600`)
- Secondary: Coral/orange accents
- Success: Green (`green-500`)
- Error: Red (`red-500`)
- Warning: Amber (`amber-500`)

**Neutrals**:
- Background: `bg-gray-50` (light), `bg-gray-900` (dark)
- Cards: `bg-white` with `shadow-xl`
- Text: `text-gray-900` (primary), `text-gray-600` (secondary), `text-gray-400` (muted)
- Borders: `border-gray-200`

## Components

### Navigation

**Desktop Header**:
```html
<nav class="fixed top-0 w-full h-16 backdrop-blur-lg shadow-sm">
  <!-- Logo left, nav center, profile right -->
</nav>
```

**Mobile Bottom Nav**:
```html
<nav class="fixed bottom-0 w-full h-16 bg-white border-t">
  <!-- 4-5 icons with active state -->
</nav>
```

### Profile Cards

**Rating Card** (Tinder-style):
```html
<div class="aspect-[3/4] rounded-3xl shadow-xl hover:shadow-2xl">
  <img class="w-full h-full object-cover rounded-3xl">
  <div class="absolute inset-0 bg-gradient-to-t from-black/60">
    <!-- Name, college overlay at bottom -->
  </div>
</div>
```

**Grid Card** (Discovery):
```html
<div class="aspect-square rounded-2xl overflow-hidden hover:scale-105 transition">
  <!-- Square image, hover overlay -->
</div>
```

**Grid Spacing**: `gap-4/6`

### Leaderboard

**Top 3 Podium**:
- Rank 1: Center, larger (`size-24` photo), crown icon
- Ranks 2-3: Flanking, smaller (`size-16/20`)
- Circular photos with border

**Ranked List** (4-10):
```html
<div class="flex items-center py-4 px-6 border-b hover:bg-gray-50">
  <span class="text-3xl font-bold w-12">#4</span>
  <img class="size-12 rounded-full mx-4">
  <div class="flex-1">
    <p class="font-semibold">Name</p>
  </div>
  <span class="text-2xl font-bold">8.7</span>
</div>
```

### Rating Interface

**Score Buttons** (1-10):
```html
<div class="flex flex-wrap gap-2">
  <button class="min-h-12 px-6 rounded-full text-2xl font-bold 
                 hover:scale-105 active:scale-95">
    7
  </button>
</div>
```

**Quick Rate** (Floating):
```html
<button class="w-14 h-14 rounded-full text-xl font-bold shadow-lg">
  10
</button>
```

### Forms

**Input Fields**:
```html
<div>
  <label class="block text-sm font-medium mb-2">Email</label>
  <input class="w-full h-12 rounded-lg border px-4 
                focus:ring-2 focus:ring-purple-500">
  <p class="text-sm text-red-500 mt-1">Error message</p>
</div>
```

**Submit Buttons**:
```html
<button class="w-full md:w-auto h-14 px-8 rounded-lg 
               bg-gradient-to-r from-purple-600 to-pink-600 
               text-white font-semibold hover:shadow-lg">
  Submit
</button>
```

### Stats Cards

```html
<div class="p-6 rounded-xl bg-white shadow-lg">
  <p class="text-sm uppercase tracking-wide text-gray-500">Total Ratings</p>
  <p class="text-5xl font-bold mt-2">1,234</p>
</div>
```

### Badges

**Verification**:
```html
<div class="absolute top-2 right-2 size-6 rounded-full 
            bg-blue-500 text-white flex items-center justify-center">
  ✓
</div>
```

**Rank Badge**: Medal icons for top 3, glow effect for #1

### Modals

**Structure**:
```html
<div class="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center">
  <div class="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
    <button class="absolute top-4 right-4 size-10">✕</button>
    <!-- Content -->
  </div>
</div>
```

## Page Layouts

### Landing Page

**Hero** (100vh):
- Desktop: Split (50/50) - headline left, image right
- Mobile: Stacked
- Headline: `text-6xl font-bold max-w-2xl`
- CTA: Large buttons `h-14 px-8`

**How It Works** (3-4 steps):
- Desktop: Horizontal timeline with connecting lines
- Mobile: Vertical stack
- Step numbers: `text-6xl opacity-20` (display font)

**Features Grid**: 3-col desktop → 2-col tablet → 1-col mobile
- Icons: `size-12`, padding: `p-6`

**Testimonials**: 3-column carousel
- Circular photos: `size-16`
- Quote: `text-lg italic`

**Footer**: 4-column → stacked mobile

### Dashboard

**Layout**:
- Desktop: Left sidebar (`w-64`) + center (`max-w-4xl`) + optional right (`w-80`)
- Mobile: Bottom nav, full-width content

**Discovery View**:
- Card stack or grid of 10
- Filter chips at top
- "Next 10" button at bottom

**Profile Page**:
- Hero: Cover + large photo (`size-32`)
- Stats row: 3-4 stat cards
- Activity feed below

### Admin

**Dashboard**: 4-column metrics → charts → quick actions

**Report Queue**: Table/card list with filters and bulk actions

## Images

**Requirements**:
- Hero: 1920x1080+, diverse students, campus setting, natural lighting
- Icons: Consistent style (Heroicons/Font Awesome), duotone or outlined
- Features: 6-8 matching icons, `size-12`
- Trust: Security illustrations (shield, lock, checkmark)
- Testimonials: Diverse student headshots, circular crop

## Interactions & Animations

**Use Sparingly** - Essential only:
- Rating submit: `scale-105` + fade (200ms)
- Card swipe: Smooth transform
- Leaderboard: Stagger entries (100ms delay)
- Modal: Fade + scale (300ms)
- Button press: `active:scale-95`
- Loading: Simple spinner only

**NO**: Page transitions, decorative motion, auto-play, skeleton screens

## Accessibility (WCAG AA)

**Required**:
- All inputs: Proper labels + `aria-label` for icon buttons
- Touch targets: Minimum `h-11` (44px)
- Focus states: `ring-2 ring-offset-2` on all interactive elements
- Keyboard: Full navigation support, logical tab order
- Contrast: WCAG AA compliant
- Error messages: `aria-describedby` linking
- Images: Meaningful alt text
- Screen readers: ARIA labels for icons

**Consistent Patterns**:
- Form inputs: `h-12`
- Buttons: Same padding scale (`px-4/6/8`)
- Cards: Same `rounded-xl/2xl/3xl` scale
- Focus/active states: Consistent across all elements

## Quick Reference

**Common Classes**:
- Cards: `rounded-2xl shadow-xl hover:shadow-2xl`
- Buttons: `h-12 px-6 rounded-lg font-semibold hover:scale-105 active:scale-95`
- Inputs: `h-12 rounded-lg border focus:ring-2 focus:ring-purple-500`
- Container: `max-w-7xl mx-auto px-4`
- Section: `py-16 md:py-24`
- Grid: `grid gap-6 md:grid-cols-2 lg:grid-cols-3`