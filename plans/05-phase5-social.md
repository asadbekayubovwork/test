# Phase 5: Social Features (Friends & Competitions)

## Objectives

- Build friends list with search across Telegram
- Create friend profile view with detailed info
- Implement competition system (1v1 and group/battle royale)
- Add friend activity history
- Enable gifting (Octo Coins and gifts)
- Show friend invitations for non-users

---

## Data Models

### Friend

```typescript
interface Friend {
  id: string;
  telegramId: string;
  name: string;
  username: string;
  avatar: string;
  backgroundImage?: string; // purchasable
  level: 'beginner' | 'intermediate' | 'advanced' | 'pro' | 'master';
  region: string;
  country: string;
  ratingPoints: number;
  rankPosition: number;
  lastActive: string;
  isOnline: boolean;
  stats: UserStats;
  isFriend: boolean;
}
```

### Competition

```typescript
interface Competition {
  id: string;
  type: '1v1' | 'group';
  participants: string[]; // user IDs
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: 'day' | 'week';
  startedAt: string;
  endsAt: string;
  scores: Record<string, number>;
  winnerId?: string;
  status: 'pending' | 'active' | 'completed';
  rewardMultiplier: number; // 2x for winners
}
```

### ActivityHistory

```typescript
interface ActivityItem {
  id: string;
  type: 'friend_added' | 'competition_started' | 'competition_won' | 'gift_sent' | 'gift_received';
  userId: string;
  targetUserId?: string;
  competitionId?: string;
  timestamp: string;
  reactions: Reaction[];
  comments: Comment[];
}

interface Reaction {
  userId: string;
  emoji: string;
  timestamp: string;
}

interface Comment {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
}
```

---

## Friends Screen Layout

```
┌─────────────────────────────────────┐
│  Friends                   [+ Add]  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔍 Search friends...        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  My Friends (24)                    │
│                                     │
│  Online (3)                         │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 👤 Sarah Chen        Pro    │   │
│  │    🟢 Online • Tokyo        │   │
│  │    ⭐ 15,420 pts  #1        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 👤 Mike Johnson    Advanced │   │
│  │    🟢 5 min ago • New York  │   │
│  │    ⭐ 14,890 pts  #2        │   │
│  └─────────────────────────────┘   │
│                                     │
│  Offline (21)                       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 👤 Alex Brown     Beginner  │   │
│  │    ⚪ 2 hours ago • Berlin  │   │
│  │    ⭐ 3,200 pts  #456       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Active Competitions (2)            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ⚔️ vs Mike • 2d left        │   │
│  │    You: 450  Mike: 320      │   │
│  │    You're winning! 🔥        │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Friend Profile Screen

```
┌─────────────────────────────────────┐
│  ← Profile                          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │    Background Image         │   │ ← Purchasable skin
│  │    (customizable)           │   │
│  │                             │   │
│  │      ┌──────────┐          │   │
│  │      │  Avatar  │          │   │
│  │      └──────────┘          │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│          Sarah Chen                 │
│          @sarahchen                 │
│          📍 Tokyo, Japan            │
│          🏆 Pro Level               │
│                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐
│  │ Rating  │ │  Rank   │ │ Level   │
│  │ 15,420  │ │   #1    │ │  Pro    │
│  └─────────┘ └─────────┘ └─────────┘
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Statistics                         │
│  ┌─────────────────────────────┐   │
│  │ ⏱️ Time: 120h               │   │
│  │ 📚 Cards: 3,450             │   │
│  │ 🎯 Accuracy: 92%            │   │
│  │ 📅 Frequency: Daily         │   │
│  │ 📖 Courses: 8 completed     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Actions                            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🎁  Send Gift              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🪙  Send Octo Coins        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ⚔️  Start Competition      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Activity History                   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🏆 Won competition vs You   │   │
│  │    2 days ago               │   │
│  │    👍 5  💬 2               │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🤝 Became friends           │   │
│  │    1 week ago               │   │
│  │    👍 3                     │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Add Friend Flow

### Search Screen

```
┌─────────────────────────────────────┐
│  ← Add Friend                       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔍 Search by username...    │   │
│  └─────────────────────────────┘   │
│                                     │
│  Search results:                    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 👤 @john_doe               │   │
│  │    John Doe • New York      │   │
│  │              [Add Friend]   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Not on WordZen?                    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📤  Invite via Telegram    │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Competition Setup Modal

```
┌─────────────────────────────────────┐
│                            ✕        │
│                                     │
│        ⚔️ Start Competition         │
│        with Sarah Chen              │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Mode                               │
│  ┌──────────┐ ┌──────────┐         │
│  │   1v1    │ │  Group   │         │
│  └──────────┘ └──────────┘         │
│                                     │
│  Duration                           │
│  ┌──────────┐ ┌──────────┐         │
│  │  1 Day   │ │  1 Week  │         │
│  └──────────┘ └──────────┘         │
│                                     │
│  Difficulty                         │
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │Beginner│ │ Inter  │ │Advanced│  │
│  └────────┘ └────────┘ └────────┘  │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  🏆 Winner gets 2x rating points!   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     Start Competition       │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Group Competition (Battle Royale)

```
┌─────────────────────────────────────┐
│  ← Group Competition                │
│                                     │
│  Battle Royale • Ends in 3d 12h     │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Leaderboard                        │
│                                     │
│  🥇 Sarah Chen      1,250 pts      │
│  🥈 You             1,100 pts ←    │
│  🥉 Mike Johnson      980 pts      │
│  4. Alex Brown        750 pts      │
│  5. Emma Wilson       620 pts      │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Your Progress                      │
│                                     │
│  Cards learned: 45                  │
│  Tests completed: 3                 │
│  Points earned: 1,100               │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     Continue Learning       │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Send Gift Modal

```
┌─────────────────────────────────────┐
│                            ✕        │
│                                     │
│        🎁 Send Gift                 │
│        to Sarah Chen                │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│  │ 🌟  │ │ 🎉  │ │ 🔥  │ │ 💎  │  │
│  │ 10  │ │ 25  │ │ 50  │ │ 100 │  │
│  └─────┘ └─────┘ └─────┘ └─────┘  │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Or send Octo Coins                 │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🪙  Amount: [___100___]    │   │
│  │      Your balance: 520      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │        Send Gift            │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Google Stitch Prompt: Friends Screen

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

---

## Google Stitch Prompt: Friend Profile

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

## Deliverables

- [ ] FriendsScreen with search and sections
- [ ] FriendCard with online status and level
- [ ] FriendProfile page with all info
- [ ] Add friend search flow
- [ ] Invite non-users via Telegram
- [ ] CompetitionSetup modal
- [ ] Competition types (1v1 and group)
- [ ] Competition detail/leaderboard
- [ ] Send gift modal
- [ ] Send Octo Coins flow
- [ ] Activity history with reactions/comments
- [ ] Competition results and rewards
- [ ] Social Zustand store
