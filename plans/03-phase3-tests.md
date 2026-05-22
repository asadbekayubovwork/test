# Phase 3: Tests & Progress Tracking

## Objectives

- Build quiz/test system to confirm understanding
- Implement answer cards instead of buttons
- Create progress tracking and feedback animations
- Design reward screen for 100% completion

---

## Components

### 3.1 TestContainer

Manages test flow and state.

```typescript
interface TestContainerProps {
  test: Test;
  onComplete: (score: number) => void;
  onExit: () => void;
}
```

### 3.2 TestQuestion

Displays question with answer options as cards.

```typescript
interface TestQuestionProps {
  question: TestQuestion;
  onAnswer: (optionIndex: number) => void;
  showResult: boolean;
  isCorrect?: boolean;
}
```

### 3.3 AnswerCard

Individual answer option as a tappable card.

```typescript
interface AnswerCardProps {
  text: string;
  index: number;
  selected: boolean;
  correct: boolean;
  showResult: boolean;
  onSelect: () => void;
}
```

### 3.4 TestProgress

Progress indicator showing current position.

```typescript
interface TestProgressProps {
  current: number;
  total: number;
  correctCount: number;
}
```

---

## Test Flow

```
1. Show question at top
2. Display 4 answer cards below
3. User taps a card to select
4. Brief delay (300ms) for suspense
5. Reveal correct/incorrect:
   - Correct: green highlight + small checkmark animation
   - Incorrect: red highlight on selected + green on correct
6. Auto-advance after 1.5 seconds
7. Repeat until all questions answered
8. Show results screen
```

---

## Test Screen Layout

```
┌─────────────────────────────────────┐
│  ← Back                    3 / 10   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │   What is the translation   │   │
│  │   of "ephemeral"?           │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      A. Permanent           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      B. Short-lived    ✓    │   │ ← Green when correct
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      C. Heavy              │   │ ← Red if wrong selection
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      D. Colorful            │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Animation Specifications

### Answer Selection

```typescript
// Card press animation
const pressAnimation = {
  scale: 0.98,
  transition: { duration: 0.1 }
};

// Correct answer reveal
const correctAnimation = {
  backgroundColor: '#dcfce7', // green-100
  borderColor: '#22c55e',    // green-500
  scale: [1, 1.02, 1],
  transition: { duration: 0.3 }
};

// Incorrect answer reveal
const incorrectAnimation = {
  backgroundColor: '#fee2e2', // red-100
  borderColor: '#ef4444',    // red-500
  x: [0, -5, 5, -5, 5, 0],   // shake
  transition: { duration: 0.3 }
};
```

### Progress Bar

```typescript
// Smooth fill animation
const progressAnimation = {
  width: `${(current / total) * 100}%`,
  transition: { duration: 0.3, ease: 'easeOut' }
};
```

---

## Results Screen

### Score Tiers

```typescript
const getScoreTier = (percentage: number) => {
  if (percentage === 100) return 'perfect';
  if (percentage >= 80) return 'excellent';
  if (percentage >= 60) return 'good';
  if (percentage >= 40) return 'needsWork';
  return 'tryAgain';
};
```

### Perfect Score Reward

When user achieves 100%:

```typescript
interface PerfectScoreReward {
  xpBonus: number;        // 2x normal XP
  coinsBonus: number;     // Extra Octo Coins
  achievement?: string;   // Possible achievement unlock
}
```

---

## Question Types

### Type 1: Translation

```typescript
{
  type: 'translation',
  question: 'What is the translation of "ephemeral"?',
  word: 'ephemeral',
  options: ['Permanent', 'Short-lived', 'Heavy', 'Colorful'],
  correctAnswer: 1
}
```

### Type 2: Reverse Translation

```typescript
{
  type: 'reverseTranslation',
  question: 'Which word means "кратковременный"?',
  translation: 'кратковременный',
  options: ['Permanent', 'Ephemeral', 'Heavy', 'Colorful'],
  correctAnswer: 1
}
```

### Type 3: Fill in the Blank

```typescript
{
  type: 'fillBlank',
  question: 'The beauty of cherry blossoms is ___.',
  context: 'The beauty of cherry blossoms is ephemeral.',
  options: ['permanent', 'ephemeral', 'heavy', 'colorful'],
  correctAnswer: 1
}
```

---

## Google Stitch Prompt: Test Question Screen

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

## Deliverables

- [ ] TestContainer component with flow management
- [ ] TestQuestion component with question display
- [ ] AnswerCard component with all states
- [ ] TestProgress component
- [ ] Answer selection animations
- [ ] Correct/incorrect feedback animations
- [ ] Results screen with score display
- [ ] Perfect score reward screen
- [ ] Points animation counter
- [ ] Test Zustand store
- [ ] Review mistakes functionality
