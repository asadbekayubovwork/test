# Phase 4: Courses, Units & Content Structure

## Objectives

- Build courses listing screen with purchased and available courses
- Implement course structure with multiple units (20-30 cards each)
- Create unit detail view with progress tracking
- Show overall progress bar across all courses
- Handle free courses and free units in paid courses
- Design course/unit purchase flow

---

## Data Models

### Course

```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'ielts' | 'general';
  units: Unit[];
  totalUnits: number;
  completedUnits: number;
  progress: number; // percentage
  accessType: 'free' | 'purchased' | 'subscription' | 'locked';
  price?: number; // in Telegram Stars or currency
  pointsRequired?: number; // points needed to unlock for free
  isFree: boolean;
}
```

### Unit

```typescript
interface Unit {
  id: string;
  courseId: string;
  title: string;
  order: number;
  cards: WordCard[];
  totalCards: number; // 20-30
  learnedCards: number;
  progress: number;
  testCompleted: boolean;
  testScore: number; // percentage
  pointsEarned: number;
  isFree: boolean; // free unit in paid course
  isLocked: boolean;
}
```

---

## Course Access Rules

1. **Free Courses** - Available at each difficulty level
2. **Free Units** - First 1-2 units free in each paid course
3. **Subscription** - Access all courses via Telegram Stars or merchant
4. **Individual Purchase** - Buy course forever
5. **Points Purchase** - Accumulate points from 2 courses to get 3rd free

---

## Courses Screen Layout

```
┌─────────────────────────────────────┐
│  Courses                            │
│                                     │
│  Overall Progress                   │
│  ████████████░░░░░░░░  42%         │
│  126 / 300 units completed          │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [All] [Beginner] [Inter] [Adv]    │
│  [All] [IELTS] [General] [Free]    │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  My Courses (5)                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📚 Essential Vocabulary     │   │
│  │    Beginner • 12/20 units   │   │
│  │    ████████░░  60%          │   │
│  └─────────────────────────────┘   │
│                                     │
│  Available Courses (15)             │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📚 IELTS Academic          │   │
│  │    Advanced • 0/25 units    │   │
│  │    🔒 ⭐ 299 or 1500 pts    │   │
│  │    [2 free units]           │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Course Detail Screen

```
┌─────────────────────────────────────┐
│  ← Essential Vocabulary             │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Cover Image            │   │
│  └─────────────────────────────┘   │
│                                     │
│  Essential Vocabulary               │
│  🟢 Beginner • General English      │
│                                     │
│  Master the most common English     │
│  words for everyday conversations.  │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Progress: 12/20 units • 60%        │
│  ████████████░░░░░░░░              │
│                                     │
│  Points Earned: 1,200               │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Units                              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ✓ Unit 1: Greetings         │   │
│  │   30/30 cards • Test: 100%  │   │
│  │   +100 points earned        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ◐ Unit 2: Family            │   │
│  │   18/25 cards • Test: --    │   │
│  │   Continue →                │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔒 Unit 3: Food & Drinks    │   │
│  │   Complete Unit 2 to unlock │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Unit Detail Screen

```
┌─────────────────────────────────────┐
│  ← Unit 2: Family                   │
│                                     │
│  Progress: 18/25 cards              │
│  ████████████████░░░░  72%         │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📚  Learn Cards            │   │
│  │      7 cards remaining      │   │
│  │                   Start →   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🎯  Take Test              │   │
│  │      Complete all cards     │   │
│  │      to unlock test         │   │
│  │                   🔒        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Statistics                         │
│                                     │
│  Known cards:     15                │
│  Unknown cards:   3                 │
│  Favorites:       5                 │
│  Review needed:   8                 │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ⭐  View Favorites (5)     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🔄  Review Unknown (3)     │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Purchase Flow

### Locked Course Modal

```
┌─────────────────────────────────────┐
│                            ✕        │
│                                     │
│  🔒 Unlock IELTS Academic           │
│                                     │
│  Get access to all 25 units         │
│  with 500+ vocabulary cards         │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Try 2 free units first!            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │    Try Free Units           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Purchase Options:                  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ⭐ 299 Telegram Stars      │   │
│  │     One-time purchase       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🪙 1,500 Points            │   │
│  │     You have: 1,200 pts     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  👑 Get Subscription        │   │
│  │     Access ALL courses      │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Points System

### Earning Points

- Complete unit test 100% → Earn points based on difficulty
- Beginner unit: 50 points
- Intermediate unit: 75 points
- Advanced unit: 100 points

### Spending Points

- Accumulate points from completing courses
- Use points to unlock new courses
- Example: Complete 2 courses = ~1,500 points = 1 free course

---

## Google Stitch Prompt: Courses Screen

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

---

## Google Stitch Prompt: Course Detail

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

## Deliverables

- [ ] CoursesScreen with overall progress bar
- [ ] Course filters (difficulty, type, free)
- [ ] CourseCard component with all states
- [ ] CourseDetail page with units list
- [ ] UnitCard component
- [ ] UnitDetail page with actions
- [ ] Purchase modal with options
- [ ] Free units indicator
- [ ] Points display and progress
- [ ] Favorites list view
- [ ] Review unknown cards view
- [ ] Courses Zustand store with units
