# Phase 7: Gamification (Pomodoro & Mini-Games)

## Objectives

- Build Pomodoro focus timer with rewards
- Implement Daily Challenge mini-game
- Create Word Rush speed game
- Design Octo Memory matching game

---

## Part A: Pomodoro Mode

### Pomodoro Screen Layout

```
┌─────────────────────────────────────┐
│  ← Pomodoro                         │
│                                     │
│           ┌───────────┐             │
│           │   🐙      │             │
│           │ studying  │             │
│           └───────────┘             │
│                                     │
│              24:37                  │
│                                     │
│        ┌───────────────────┐        │
│        │████████████░░░░░░ │        │
│        └───────────────────┘        │
│                                     │
│        Stay focused! 🎯             │
│                                     │
│     ┌──────────┐ ┌──────────┐      │
│     │   ⏸️     │ │   ⏹️     │      │
│     │  Pause   │ │   Stop   │      │
│     └──────────┘ └──────────┘      │
│                                     │
│  🎁 Complete for +25 bonus points   │
│                                     │
└─────────────────────────────────────┘
```

### Duration Options
- 25 minutes → +25 bonus points
- 50 minutes → +60 bonus points

---

## Part B: Mini-Games

### Game 1: Daily Challenge

- 5 random words per day
- Same for all users (seeded by date)
- Daily mini-ranking
- Rewards consistency

### Game 2: Word Rush

- 60-second timer
- Rapid translation selection
- Focus on speed
- Rewards Octo Coins based on score

### Game 3: Octo Memory

- Card matching game
- Word ↔ translation pairs
- Trains visual recall
- Calm pace, no timer pressure

---

## Daily Challenge Layout

```
┌─────────────────────────────────────┐
│  ← Daily Challenge       1 / 5      │
│                                     │
│  Today's Words • Feb 3, 2024        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │    What does "ephemeral"    │   │
│  │         mean?               │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      A. Permanent           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      B. Short-lived         │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      C. Expensive           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      D. Invisible           │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Word Rush Layout

```
┌─────────────────────────────────────┐
│  Word Rush                    ⏱️ 47 │
│                                     │
│  Score: 18                          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │        EPHEMERAL            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌───────────┐  ┌───────────┐      │
│  │ Permanent │  │Short-lived│      │
│  └───────────┘  └───────────┘      │
│                                     │
│  ┌───────────┐  ┌───────────┐      │
│  │ Expensive │  │ Invisible │      │
│  └───────────┘  └───────────┘      │
│                                     │
│  ████████████████░░░░░░░░░░░░░░    │
│                                     │
└─────────────────────────────────────┘
```

---

## Octo Memory Layout

```
┌─────────────────────────────────────┐
│  ← Octo Memory           Moves: 12  │
│                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│  │ ??? │ │ephm-│ │ ??? │ │ ??? │   │
│  │     │ │eral │ │     │ │     │   │
│  └─────┘ └─────┘ └─────┘ └─────┘   │
│                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│  │кратк│ │ ??? │ │ ??? │ │ ??? │   │
│  │овре-│ │     │ │     │ │     │   │
│  └─────┘ └─────┘ └─────┘ └─────┘   │
│                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│  │ ??? │ │ ??? │ │ ✓   │ │ ✓   │   │
│  │     │ │     │ │     │ │     │   │
│  └─────┘ └─────┘ └─────┘ └─────┘   │
│                                     │
│  Pairs found: 2 / 8                 │
│                                     │
└─────────────────────────────────────┘
```

---

## Google Stitch Prompt: Pomodoro Timer Screen

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

## Deliverables

- [ ] PomodoroScreen page component
- [ ] PomodoroTimer circular display
- [ ] Duration selector
- [ ] Session complete screen
- [ ] Octopus study illustration states
- [ ] GamesScreen selection page
- [ ] Daily Challenge game component
- [ ] Daily mini-leaderboard
- [ ] Word Rush game component
- [ ] Word Rush timer and scoring
- [ ] Octo Memory game component
- [ ] Card flip animations
- [ ] Memory match logic
- [ ] Game results screens
- [ ] Personal best tracking
- [ ] Games Zustand store
