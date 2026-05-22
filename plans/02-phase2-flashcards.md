# Phase 2: Flashcard System (Core Learning)

## Objectives

- Build the core flashcard component with physical feel
- Implement swipe gestures (left = know, right = don't know)
- Add favorite and pronunciation features
- Create smooth animations and visual feedback

---

## Components

### 2.1 FlashcardDeck

Container managing the card stack and swipe state.

```typescript
interface FlashcardDeckProps {
  cards: WordCard[];
  onCardSwipe: (cardId: string, known: boolean) => void;
  onComplete: () => void;
}
```

### 2.2 Flashcard

Individual card with word, transcription, translation.

```typescript
interface FlashcardProps {
  card: WordCard;
  onSwipeLeft: () => void;   // Know
  onSwipeRight: () => void;  // Don't know
  onFavorite: () => void;
  onPronounce: () => void;
}
```

### 2.3 SwipeIndicator

Visual feedback showing swipe direction.

```typescript
interface SwipeIndicatorProps {
  direction: 'left' | 'right' | null;
  intensity: number;  // 0-1 based on swipe progress
}
```

---

## Swipe Behavior Specification

### Gesture Detection

```typescript
// Using @use-gesture/react
const bind = useDrag(({ movement: [mx], velocity, direction: [dx] }) => {
  // Threshold for completing swipe: 100px or velocity > 0.5
  const trigger = Math.abs(mx) > 100 || velocity > 0.5;

  if (trigger) {
    if (dx > 0) {
      // Swipe right → Don't know (red)
      handleDontKnow();
    } else {
      // Swipe left → Know (green)
      handleKnow();
    }
  }
});
```

### Visual Feedback

- **Swipe Left (Know)**: Soft green overlay fades in, intensity based on swipe distance
- **Swipe Right (Don't Know)**: Soft red overlay fades in
- **Card rotation**: Subtle tilt following finger
- **Card shadow**: Increases during drag

### Animation Specs

```typescript
// Card exit animation
const exitAnimation = {
  x: direction === 'left' ? -500 : 500,
  opacity: 0,
  rotate: direction === 'left' ? -20 : 20,
  transition: { duration: 0.3, ease: 'easeOut' }
};

// Next card enter animation
const enterAnimation = {
  scale: [0.95, 1],
  opacity: [0, 1],
  transition: { duration: 0.2 }
};
```

---

## Card Layout

```
┌─────────────────────────────────────┐
│                                     │
│         WORD (large, bold)          │
│                                     │
│       /trænˈskrɪpʃən/ (small)       │
│                                     │
│        Translation (medium)         │
│                                     │
│                                     │
│    ┌─────────┐    ┌─────────┐      │
│    │   ⭐️    │    │   🔊    │      │
│    │Favorite │    │  Play   │      │
│    └─────────┘    └─────────┘      │
│                                     │
└─────────────────────────────────────┘
```

---

## State Management

### Cards Store (Zustand)

```typescript
interface CardsStore {
  currentDeck: WordCard[];
  currentIndex: number;
  knownCards: string[];
  unknownCards: string[];
  favorites: string[];

  // Actions
  swipeCard: (cardId: string, known: boolean) => void;
  toggleFavorite: (cardId: string) => void;
  resetDeck: () => void;
  loadDeck: (courseId: string) => void;
}
```

---

## Audio Pronunciation

```typescript
const playPronunciation = async (audioUrl: string) => {
  const audio = new Audio(audioUrl);
  await audio.play();
};

// With loading state
const [isPlaying, setIsPlaying] = useState(false);

const handlePronounce = async () => {
  setIsPlaying(true);
  await playPronunciation(card.audioUrl);
  setIsPlaying(false);
};
```

---

## Progress Indicator

Shows remaining cards in deck.

```typescript
interface DeckProgressProps {
  current: number;
  total: number;
}

// Visual: small dots or fraction display
// "12 / 50"
```

---

## Session Summary

After completing a deck:

```typescript
interface SessionSummary {
  totalCards: number;
  knownCount: number;
  unknownCount: number;
  accuracy: number;
  xpEarned: number;
  newFavorites: number;
}
```

---

## Google Stitch Prompt: Flashcard Screen

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

---

## Google Stitch Prompt: Session Complete Screen

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

## Deliverables

- [ ] FlashcardDeck component with stack management
- [ ] Flashcard component with all content
- [ ] Swipe gesture handling with @use-gesture
- [ ] Visual swipe indicators (green/red overlays)
- [ ] Card animations (tilt, shadow, exit, enter)
- [ ] Favorite toggle functionality
- [ ] Audio pronunciation playback
- [ ] Progress indicator
- [ ] Session summary screen
- [ ] Cards Zustand store
