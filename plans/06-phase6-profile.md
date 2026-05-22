# Phase 6: User Profile & Settings (UPDATED)

## Objectives

- Build comprehensive user profile page
- Display all user statistics and achievements
- Create settings page with all options
- Implement subscription info display
- Add support connection feature
- Include detailed analytics view

---

## Profile Screen Layout

```
┌─────────────────────────────────────┐
│  ← Profile              ⚙️ Settings │
│                                     │
│           ┌──────────┐              │
│           │  Avatar  │              │
│           └──────────┘              │
│                                     │
│            John Smith               │
│           Level 24 • ⭐ 1,250       │
│                                     │
│  ████████████████░░░░  80% to 25   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  📊 Statistics                      │
│                                     │
│  ┌─────────┐ ┌─────────┐           │
│  │ ⏱️ Time │ │ 📚 Cards │           │
│  │  42h    │ │  1,240   │           │
│  └─────────┘ └─────────┘           │
│                                     │
│  ┌─────────┐ ┌─────────┐           │
│  │ 🎯 Acc  │ │ 🔥 Streak│           │
│  │  78%    │ │  12 days │           │
│  └─────────┘ └─────────┘           │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  🏆 Achievements (8/24)             │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │ 🌟 │ │ 📖 │ │ 🔥 │ │ ➕ │      │
│  └────┘ └────┘ └────┘ └────┘      │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Subscription                       │
│  ┌─────────────────────────────┐   │
│  │ 👑 Premium                  │   │
│  │ Renews: March 15, 2024      │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Settings Screen Layout

```
┌─────────────────────────────────────┐
│  ← Settings                         │
│                                     │
│  Account                            │
│  ─────────────────────────────────  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 👤 Name & Avatar            → │   │
│  │    Used in rankings, friends │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📍 Region                   → │   │
│  │    California, USA           │   │
│  └─────────────────────────────┘   │
│                                     │
│  Learning                           │
│  ─────────────────────────────────  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🌐 Translation Language     → │   │
│  │    Russian                   │   │
│  └─────────────────────────────┘   │
│                                     │
│  Preferences                        │
│  ─────────────────────────────────  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔔 Notifications         🔘 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔊 Sound Effects         🔘 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🚪 Logout                    │   │
│  └─────────────────────────────┘   │
│                                     │
│       Version 1.0.0 (Build 42)     │
│                                     │
└─────────────────────────────────────┘
```

---

## Google Stitch Prompt: Profile Screen

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

## Deliverables

- [ ] ProfileScreen page component
- [ ] Avatar with level badge component
- [ ] Level progress bar
- [ ] StatsCard component
- [ ] Stats grid layout
- [ ] AchievementCard component
- [ ] Achievements horizontal scroll
- [ ] Achievement detail modal
- [ ] SubscriptionBanner component
- [ ] SettingsScreen page component
- [ ] SettingsItem component
- [ ] Language selection modal
- [ ] Edit profile screen
- [ ] Logout confirmation
- [ ] Settings Zustand store

---

## Additional Features (NEW)

### Support Connection

```
+-------------------------------------+
|  <- Support                         |
|                                     |
|  Need help?                         |
|                                     |
|  +-----------------------------+    |
|  |  Message Support        ->  |    |
|  |  Response within 24 hours   |    |
|  +-----------------------------+    |
|                                     |
|  +-----------------------------+    |
|  |  Telegram Channel       ->  |    |
|  |  @wordzen_news              |    |
|  +-----------------------------+    |
|                                     |
|  +-----------------------------+    |
|  |  FAQ                    ->  |    |
|  |  Common questions           |    |
|  +-----------------------------+    |
|                                     |
|  Version 1.0.0                      |
+-------------------------------------+
```

### Detailed Analytics

```
+-------------------------------------+
|  <- My Statistics                   |
|                                     |
|  This Week                          |
|  +-----------------------------+    |
|  |  Cards Learned: 125         |    |
|  |  Tests Completed: 8         |    |
|  |  Accuracy: 87%              |    |
|  |  Time Spent: 4h 32m         |    |
|  +-----------------------------+    |
|                                     |
|  All Time                           |
|  +-----------------------------+    |
|  |  Total Cards: 1,240         |    |
|  |  Total Tests: 56            |    |
|  |  Best Streak: 23 days       |    |
|  |  Courses Completed: 3       |    |
|  +-----------------------------+    |
|                                     |
|  Weekly Activity Chart              |
|  [Bar chart showing daily activity] |
+-------------------------------------+
```

### Extended Settings

```typescript
interface ExtendedSettings {
  // Account
  name: string;
  avatar: string;
  country: string;
  region: string;

  // Learning
  translationLanguage: 'uz' | 'ru' | 'kz';
  dailyGoal: number; // cards per day
  reminderTime: string | null;

  // Preferences
  notifications: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;

  // Privacy
  showInRankings: boolean;
  allowFriendRequests: boolean;
}
```

### Additional Deliverables

- [ ] SupportScreen component
- [ ] Telegram channel link integration
- [ ] FAQ accordion component
- [ ] AnalyticsScreen with charts
- [ ] Weekly activity bar chart
- [ ] Daily goal setting
- [ ] Reminder time picker
- [ ] Privacy settings section
