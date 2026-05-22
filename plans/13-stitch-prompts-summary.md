# WordZen - Complete Google Stitch Prompts Summary

This document contains all Google Stitch prompts from all 12 phases of the WordZen app development. Use these prompts to generate UI designs in Google Stitch.

---

## Table of Contents

1. [Phase 2: Flashcards](#phase-2-flashcards)
2. [Phase 3: Tests](#phase-3-tests)
3. [Phase 4: Courses](#phase-4-courses)
4. [Phase 5: Social Features](#phase-5-social-features)
5. [Phase 6: Profile & Settings](#phase-6-profile--settings)
6. [Phase 7: Gamification](#phase-7-gamification)
7. [Phase 8: Shop & Monetization](#phase-8-shop--monetization)
8. [Phase 9: Home Screen & Missions](#phase-9-home-screen--missions)
9. [Phase 10: Rankings](#phase-10-rankings)
10. [Phase 11: Onboarding](#phase-11-onboarding)
11. [Phase 12: Polish](#phase-12-polish)

---

## Phase 2: Flashcards

### Prompt 2.1: Flashcard Screen

```
Design a vocabulary flashcard learning screen for a mobile app with these requirements:

LAYOUT:
- Full-screen card centered vertically
- Card takes 80% of screen width
- White card on white background with soft shadow for depth
- Rounded corners (16px)

CARD CONTENT (top to bottom):
1. Word in large bold text (32px, black)
2. Phonetic transcription in small gray text (14px)
3. Translation in medium text (20px, dark gray)
4. Two action buttons at bottom:
   - Star icon (favorite toggle) - outline when inactive, filled gold when active
   - Speaker icon (pronunciation) - plays audio

SWIPE INDICATORS:
- When swiping LEFT: soft green overlay appears with "I Know" text
- When swiping RIGHT: soft red overlay appears with "Don't Know" text
- Overlay opacity increases with swipe distance

ANIMATIONS:
- Card tilts slightly in swipe direction
- Shadow increases during drag
- Card flies off screen when swipe completes
- Next card scales up from 95% to 100%

PROGRESS:
- Small "12 / 50" counter at top of screen
- Minimal, doesn't distract from card

STYLE:
- Minimal white aesthetic
- Physical, tangible card feel
- No buttons for answers - gesture only
- Smooth 60fps animations
```

### Prompt 2.2: Session Complete Screen

```
Design a session completion screen for a vocabulary learning app:

LAYOUT:
- Centered content
- Celebratory but minimal

CONTENT:
1. Success icon or illustration (simple, not overwhelming)
2. "Session Complete!" heading
3. Stats cards in a row:
   - Cards reviewed: 50
   - Accuracy: 78%
   - XP earned: +120

VISUAL STYLE:
- Confetti animation (subtle, 2-3 seconds)
- Green accent for positive stats
- Cards with soft shadows

ACTIONS:
- "Continue Learning" primary button
- "Review Mistakes" secondary button

Keep it clean and motivating without being excessive.
```

---

## Phase 3: Tests

### Prompt 3.1: Test Question Screen

```
Design a vocabulary test question screen for a mobile learning app:

LAYOUT:
- Header with back button and progress "3 / 10"
- Question card at top (40% of screen)
- Four answer option cards below

QUESTION CARD:
- White card with soft shadow
- Question text centered
- Medium font size (18px)
- Generous padding

ANSWER CARDS:
- Full width with margin
- White background, light border
- Option letter (A, B, C, D) on left
- Answer text centered
- 16px border radius
- Touch-friendly height (56px minimum)

STATES:
1. Default: white background, gray border
2. Pressed: slight scale down (98%)
3. Correct: soft green background (#dcfce7), green border, checkmark icon
4. Incorrect: soft red background (#fee2e2), red border, subtle shake animation

PROGRESS:
- Thin progress bar under header
- Fills from left to right
- Indigo color

ANIMATIONS:
- Small animations only
- Correct: gentle pulse
- Incorrect: quick horizontal shake
- Auto-advance after 1.5s with fade transition

STYLE:
- Clean white background
- Minimal distractions
- Focus on question content
```

---

## Phase 4: Courses

### Prompt 4.1: Courses Screen

```
Design a courses screen for a vocabulary learning app:

LAYOUT:
- Header with "Courses" title
- Overall progress bar at top (across all courses)
- Filter chips (difficulty, type, free)
- Two sections: "My Courses" and "Available Courses"

OVERALL PROGRESS:
- Large progress bar
- "126 / 300 units completed"
- Percentage display

COURSE CARD:
- Cover image thumbnail (60x60)
- Course title (bold)
- Difficulty badge + type
- Progress: "12/20 units"
- Progress bar
- Access indicator:
  - Purchased: checkmark
  - Free: "FREE" badge
  - Locked: price in Stars + points option
  - "[2 free units]" label for locked courses

STYLE:
- White background
- Cards with soft shadow
- Clear hierarchy between purchased and available
```

### Prompt 4.2: Course Detail Screen

```
Design a course detail screen:

LAYOUT:
- Cover image hero
- Course title and badges
- Description
- Progress section
- Units list

UNITS LIST:
- Each unit shows:
  - Status icon (✓ complete, ◐ in progress, 🔒 locked)
  - Unit name
  - Cards progress "30/30 cards"
  - Test status "Test: 100%" or "--"
  - Points earned
- Locked units show unlock requirement

PROGRESS:
- Large progress bar
- Points earned from this course
- Units completed count

STYLE:
- Scrollable content
- Clear visual distinction between completed/active/locked units
```

---

## Phase 5: Social Features

### Prompt 5.1: Friends Screen

```
Design a friends screen for a vocabulary learning app:

LAYOUT:
- Header with "Friends" title and add button
- Search bar
- "My Friends" section with online/offline groups
- "Active Competitions" section at bottom

FRIEND CARD:
- Avatar (48px)
- Name and level badge (Beginner/Pro/Master)
- Online status with dot
- Region/city
- Rating points and rank position

COMPETITION CARD:
- Competition icon
- Opponent name
- Time remaining
- Score comparison
- Status indicator

STYLE:
- White background
- Cards with subtle borders
- Green dot for online, gray for offline
- Level badges with colors
```

### Prompt 5.2: Friend Profile Screen

```
Design a friend profile screen:

HERO SECTION:
- Customizable background image
- Large avatar overlapping background
- Name and username
- Region with pin icon
- Level badge

STATS ROW:
- Three cards: Rating, Rank, Level
- Large numbers, small labels

STATISTICS SECTION:
- List of stats with icons:
  - Time spent
  - Cards learned
  - Test accuracy
  - Visit frequency
  - Courses completed

ACTIONS:
- Send Gift button
- Send Octo Coins button
- Start Competition button (primary)

ACTIVITY HISTORY:
- Timeline of activities
- Reactions and comments
- Timestamps
```

---

## Phase 6: Profile & Settings

### Prompt 6.1: Profile Screen

```
Design a user profile screen for a learning app:

LAYOUT:
- Header with settings gear icon
- Avatar section
- Level progress
- Stats grid
- Achievements preview
- Subscription banner

AVATAR SECTION:
- Large centered avatar (96px)
- Name below (bold, 24px)
- "Level 24 • ⭐ 1,250 pts" subtitle
- Progress bar to next level with percentage

STATS GRID:
- 2x2 grid of stat cards
- Each card: icon, large value, small label
- Cards:
  - Time learned (hours)
  - Cards learned (count)
  - Test accuracy (percentage)
  - Visit streak (days)

ACHIEVEMENTS:
- Section header "🏆 Achievements (8/24)"
- Horizontal scroll of achievement icons
- Unlocked: full color
- Locked: grayed out with lock

SUBSCRIPTION BANNER:
- Card with crown icon
- "Premium" or "Free" label
- If premium: renewal date
- If free: "Upgrade" button

STYLE:
- White background
- Stats cards with very light gray background
- Progress bar in indigo
```

---

## Phase 7: Gamification

### Prompt 7.1: Pomodoro Timer Screen

```
Design a Pomodoro focus timer screen for a learning app:

ELEMENTS:
1. Cute octopus illustration (studying pose)
2. Large timer display (48px, bold) "24:37"
3. Circular progress ring
4. Motivational text "Stay focused! 🎯"
5. Pause/Stop control buttons
6. Reward preview "Complete for +25 bonus points"

STYLE:
- Very clean, calming
- White/light background
- Indigo accents
- No harsh colors
```

---

## Phase 8: Shop & Monetization

### Prompt 8.1: Shop Screen

```
Design a shop screen for a vocabulary learning app:

HEADER:
- Balance display showing Octo Coins
- Tab navigation: Coins, Skins, Perks, Premium

COINS TAB:
- 2x2 grid of coin packages
- Each package shows:
  - Coin amount with icon
  - Price in Telegram Stars
  - Bonus amount if any
  - "POPULAR" badge on best value

SKINS TAB:
- Sections: Profile Backgrounds, Avatar Frames, Card Themes
- 3-column grid of skin previews
- Show rarity badge (Common/Rare/Epic/Legendary)
- Price or "Owned" checkmark

PERKS TAB:
- Vertical list of perks
- Icon, name, description
- Duration if applicable
- Price in Octo Coins

PREMIUM TAB:
- Hero section with crown icon
- Feature list with checkmarks
- Monthly and yearly pricing
- "Save X%" on yearly

STYLE:
- White background
- Gold accent for coins
- Purple accent for premium
- Rarity colors for skins
```

---

## Phase 9: Home Screen & Missions

### Prompt 9.1: Home Screen

```
Design a home screen for a vocabulary learning app:

HEADER:
- Octopus logo with "WordZen" text
- Octo Coins balance (gold coin icon + number)
- Rating points (star icon + number)
- Shop cart icon

CONTINUE LEARNING CARD:
- Course and unit name
- Progress bar with card count
- "Continue" button
- Soft shadow, rounded corners

WEEKLY PROGRESS:
- 7 day row (M T W T F S S)
- Checkmarks for completed days
- Half-filled for today
- Empty circles for future
- Streak counter with flame icon

RANKING PREVIEW:
- Three rows: Global, Country, Region
- Position number with flag/globe icons
- Rating points total
- "View All" link

MISSION CARD:
- Game-like progress track
- Octopus character moving along track
- Target flag at end
- Progress bar underneath
- Mission description
- Time remaining
- Reward preview (coins + points)

STYLE:
- White background
- Cards with soft shadows
- Playful but clean design
- Indigo primary color
- Gold for coins, orange for streaks
```

### Prompt 9.2: Mission Selection Screen

```
Design a mission selection screen:

LAYOUT:
- Sections by difficulty: Easy, Medium, Hard
- Mission cards in each section

MISSION CARD:
- Icon representing mission type
- Mission title
- Reward preview (coins + points)
- Time limit
- "Accept" button

DIFFICULTY COLORS:
- Easy: Green accent
- Medium: Orange accent
- Hard: Red/purple accent

STYLE:
- Clean list layout
- Clear reward display
- Time limits prominent
- One-tap acceptance
```

---

## Phase 10: Rankings

### Prompt 10.1: Rankings Screen

```
Design a leaderboard/rankings screen for a learning app:

LAYOUT:
- Header with "Rankings" title
- Category tabs: Global, Country, Region
- Period filter: All Time, Weekly, Monthly
- Top 3 podium section
- Scrollable rankings list
- Fixed footer with user's position

TOP 3 PODIUM:
- Center position for 1st (Gold, tallest)
- Left position for 2nd (Silver)
- Right position for 3rd (Bronze)
- Large avatars with medal overlay
- Name and points below each
- Gold/silver/bronze color accents

RANKING LIST:
- Position number
- Avatar with country flag badge
- Name and level
- Position change indicator (+5, -3, NEW)
- Rating points

POSITION CHANGE:
- Green up arrow with number for improvement
- Red down arrow for drops
- Gray dash for no change
- Purple "NEW" badge for new entries

YOUR POSITION:
- Fixed at bottom of screen
- Highlighted row
- Shows position, change, and points

STYLE:
- White background
- Clear visual hierarchy
- Celebratory feel for top 3
- Easy scanning for rest
```

### Prompt 10.2: Country Selection Modal

```
Design a country selection modal:

LAYOUT:
- Modal header with "Select Country"
- Search input
- Grouped sections: "CIS Countries", "Other"
- List of countries with flags

COUNTRY ROW:
- Flag emoji or icon
- Country name
- Checkmark if selected

STYLE:
- Bottom sheet modal
- Easy scrolling
- Clear selection state
- Quick access to common countries (CIS)
```

---

## Phase 11: Onboarding

### Prompt 11.1: Splash Screen

```
Design a splash screen for a vocabulary learning app:

ELEMENTS:
- Centered octopus mascot illustration
- App name "WordZen" in bold
- Tagline "Learn English with fun"
- Subtle loading indicator

OCTOPUS:
- Friendly, cute design
- Waving one tentacle
- Holding a book with another
- Indigo/purple color tones

ANIMATION:
- Octopus bounces in
- Text fades up
- Smooth transition out

STYLE:
- White/very light background
- Clean, minimal
- Playful but professional
```

### Prompt 11.2: Onboarding Screens

```
Design an onboarding flow for a vocabulary learning app:

LAYOUT:
- Skip button top right
- Illustration area (40% of screen)
- Title and description
- Progress dots
- Primary action button

ILLUSTRATIONS NEEDED:
1. Octopus reading a book (welcome)
2. Flashcard with swipe arrows (how it works)
3. Language/globe icons (language selection)
4. Map with pin (region selection)
5. Octopus celebrating (ready)

LANGUAGE SELECTION:
- Radio button list
- Flag icons next to each
- Clear selection state

REGION SELECTION:
- Two dropdown selects
- Country first, then region
- Flag next to country

STYLE:
- Indigo primary color
- Large, friendly illustrations
- Progress dots (5 steps)
- Single action per screen
```

---

## Phase 12: Polish

### Prompt 12.1: Loading States

```
Design loading state skeletons for a learning app:

SKELETON STYLE:
- Light gray (#f3f4f6) background
- Subtle pulse animation
- Rounded corners matching real elements
- Same dimensions as actual content

VARIANTS:
1. Card skeleton
2. Avatar skeleton (circular)
3. Text skeleton (lines)
4. List skeleton (multiple cards)

ANIMATION:
- Opacity oscillates 0.4 to 0.7
- Duration: 1.5s ease-in-out
```

### Prompt 12.2: Empty States

```
Design empty state illustrations for a learning app:

STYLE:
- Simple, minimal line illustrations
- Soft colors (grays, light indigo)
- Friendly octopus character as mascot
- Not sad or negative feeling

STATES:
1. No search results - octopus with magnifying glass
2. No friends - octopus waving
3. No achievements - octopus reaching for star
4. No courses - octopus with books
5. Error state - confused octopus

LAYOUT:
- Centered illustration (not too large)
- Title below (bold, 18px)
- Description (gray, 14px)
- Optional action button
```

---

## Design System Reference

### Colors

```
Primary: #6366f1 (Indigo)
Success: #22c55e (Green)
Danger: #ef4444 (Red)
Warning: #f59e0b (Orange)
Gold: #eab308 (Coins)

Backgrounds:
- White: #ffffff
- Light Gray: #f3f4f6
- Success Light: #dcfce7
- Danger Light: #fee2e2
```

### Typography

```
Headings: Bold, 24-32px
Body: Regular, 16px
Small: Regular, 14px
Caption: Regular, 12px
```

### Spacing

```
Card Padding: 16px
Card Border Radius: 16px
Button Border Radius: 12px
Section Gap: 24px
```

### Shadows

```
Card Shadow: 0 2px 8px rgba(0,0,0,0.08)
Elevated Shadow: 0 4px 16px rgba(0,0,0,0.12)
```

---

## Quick Reference: All Prompts

| # | Screen | Phase |
|---|--------|-------|
| 2.1 | Flashcard Screen | Phase 2 |
| 2.2 | Session Complete | Phase 2 |
| 3.1 | Test Question | Phase 3 |
| 4.1 | Courses Screen | Phase 4 |
| 4.2 | Course Detail | Phase 4 |
| 5.1 | Friends Screen | Phase 5 |
| 5.2 | Friend Profile | Phase 5 |
| 6.1 | Profile Screen | Phase 6 |
| 7.1 | Pomodoro Timer | Phase 7 |
| 8.1 | Shop Screen | Phase 8 |
| 9.1 | Home Screen | Phase 9 |
| 9.2 | Mission Selection | Phase 9 |
| 10.1 | Rankings Screen | Phase 10 |
| 10.2 | Country Selection | Phase 10 |
| 11.1 | Splash Screen | Phase 11 |
| 11.2 | Onboarding Flow | Phase 11 |
| 12.1 | Loading States | Phase 12 |
| 12.2 | Empty States | Phase 12 |

**Total: 18 Google Stitch Prompts**
