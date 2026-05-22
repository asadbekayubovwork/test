# Phase 9: Home Screen & Missions (NEW)

## Objectives

- Build comprehensive home screen dashboard
- Create header with logo, coins, rating, and shop access
- Implement "Continue Learning" widget
- Add weekly progress tracking with checkmarks
- Show global ranking preview
- Build missions system with game-like progress
- Create octopus-themed mission tracker

---

## Home Screen Layout

```
┌─────────────────────────────────────┐
│  🐙 WordZen    🪙 520  ⭐ 1,250  🛒 │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │  Continue Learning          │   │
│  │                             │   │
│  │  📚 Essential Vocabulary    │   │
│  │     Unit 5: Animals         │   │
│  │                             │   │
│  │  ████████░░  12/25 cards    │   │
│  │                             │   │
│  │  ┌─────────────────────┐   │   │
│  │  │   Continue →        │   │   │
│  │  └─────────────────────┘   │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Weekly Progress                    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  M   T   W   T   F   S   S  │   │
│  │  ✓   ✓   ✓   ◐   ○   ○   ○  │   │
│  │                             │   │
│  │  🔥 3 day streak!           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Your Ranking                       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🌍 Global: #847            │   │
│  │  🇺🇿 Country: #123          │   │
│  │  📍 Region: #45             │   │
│  │                             │   │
│  │  ⭐ 1,250 rating points     │   │
│  │                  View All → │   │
│  └─────────────────────────────┘   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  🎯 Active Mission                  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │   🐙───────────🏁           │   │
│  │     ████████░░░░            │   │
│  │                             │   │
│  │  Complete "Essential        │   │
│  │  Vocabulary" in 7 days      │   │
│  │                             │   │
│  │  Progress: 12/20 units      │   │
│  │  Time left: 4 days          │   │
│  │                             │   │
│  │  Reward: 🪙 500 + ⭐ 200    │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     Choose New Mission      │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Header Component

```
┌─────────────────────────────────────┐
│  🐙 WordZen    🪙 520  ⭐ 1,250  🛒 │
└─────────────────────────────────────┘

Elements:
- Octopus logo + "WordZen" text
- Octo Coins balance (tappable → shop)
- Rating points display
- Shop icon (opens shop screen)
```

---

## Continue Learning Widget

```typescript
interface ContinueLearningData {
  courseId: string;
  courseTitle: string;
  unitId: string;
  unitTitle: string;
  progress: number;
  totalCards: number;
  learnedCards: number;
}
```

### States

1. **Has progress** - Shows current course/unit with continue button
2. **No progress** - Shows "Start Learning" with course recommendations
3. **All complete** - Celebratory message with suggestions

---

## Weekly Progress Widget

```typescript
interface WeeklyProgress {
  days: {
    date: string;
    dayName: string;
    status: 'complete' | 'partial' | 'empty' | 'future';
    cardsLearned: number;
    testsCompleted: number;
  }[];
  streak: number;
  longestStreak: number;
}
```

### Day States

- ✓ (checkmark) - Goal met
- ◐ (half circle) - Partial progress (today)
- ○ (empty circle) - No progress / future day

---

## Ranking Preview Widget

Shows quick overview of user's ranking across all categories:

```typescript
interface RankingPreview {
  global: { position: number; change: number };
  country: { position: number; change: number; countryName: string };
  region: { position: number; change: number; regionName: string };
  ratingPoints: number;
}
```

---

## Mission System

### Mission Data Model

```typescript
interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'course_completion' | 'cards_learned' | 'tests_perfect' | 'streak' | 'competition';
  target: number;
  progress: number;
  deadline: string;
  rewards: {
    octoCoins: number;
    ratingPoints: number;
    xp: number;
  };
  status: 'active' | 'completed' | 'expired';
  difficulty: 'easy' | 'medium' | 'hard';
}
```

### Available Missions

```
┌─────────────────────────────────────┐
│  ← Choose Mission                   │
│                                     │
│  Easy Missions                      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📚 Learn 50 cards today     │   │
│  │    Reward: 🪙 50 + ⭐ 25    │   │
│  │    Time: 24 hours           │   │
│  │              [Accept]       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🎯 Complete 3 tests         │   │
│  │    Reward: 🪙 75 + ⭐ 50    │   │
│  │    Time: 3 days             │   │
│  │              [Accept]       │   │
│  └─────────────────────────────┘   │
│                                     │
│  Medium Missions                    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔥 7-day learning streak    │   │
│  │    Reward: 🪙 200 + ⭐ 100  │   │
│  │    Time: 7 days             │   │
│  │              [Accept]       │   │
│  └─────────────────────────────┘   │
│                                     │
│  Hard Missions                      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🏆 Complete a course        │   │
│  │    Reward: 🪙 500 + ⭐ 200  │   │
│  │    Time: 14 days            │   │
│  │              [Accept]       │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Mission Progress View (Game-like)

```
┌─────────────────────────────────────┐
│                                     │
│         🎯 Active Mission           │
│                                     │
│    Complete "Essential Vocabulary"  │
│           in 7 days                 │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │  🐙                   🏁    │   │
│  │   ↓                         │   │
│  │  ═══════════════════════   │   │
│  │  ████████████░░░░░░░░░░░   │   │
│  │                             │   │
│  │  12 / 20 units completed    │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Daily checkmarks:                  │
│                                     │
│  Day 1  Day 2  Day 3  Day 4  ...   │
│    ✓      ✓      ✓      ◐          │
│                                     │
│  Time remaining: 4 days 12 hours    │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Rewards on completion:             │
│                                     │
│  🪙 500 Octo Coins                  │
│  ⭐ 200 Rating Points               │
│  ✨ 1000 XP                         │
│                                     │
└─────────────────────────────────────┘
```

---

## Octopus Animation States

The octopus mascot moves along the progress track:

1. **Starting** - Octopus at beginning, excited pose
2. **In Progress** - Octopus walking/swimming along track
3. **Almost There** - Octopus reaching towards flag
4. **Complete** - Octopus celebrating at finish line

---

## Google Stitch Prompt: Home Screen

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

---

## Google Stitch Prompt: Mission Selection

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

## Deliverables

- [ ] Home screen layout
- [ ] Header component with balances
- [ ] Continue learning widget
- [ ] Weekly progress component
- [ ] Day checkmark states
- [ ] Streak display
- [ ] Ranking preview widget
- [ ] Mission card component
- [ ] Mission selection screen
- [ ] Octopus progress animation
- [ ] Mission completion celebration
- [ ] Home Zustand store
- [ ] Mission Zustand store
