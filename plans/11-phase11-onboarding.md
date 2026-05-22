# Phase 11: Onboarding & Splash Screen (NEW)

## Objectives

- Create engaging splash screen with octopus mascot
- Build multi-step onboarding flow
- Collect user preferences (language, region)
- Explain app features
- Smooth transition to main app

---

## Splash Screen

### Design

```
+-------------------------------------+
|                                     |
|                                     |
|                                     |
|           +-------------+           |
|           |     OCTO    |           |
|           |   MASCOT    |           |
|           |   WAVING    |           |
|           +-------------+           |
|                                     |
|             WordZen                 |
|                                     |
|        Learn English with fun       |
|                                     |
|                                     |
|            [Loading...]             |
|                                     |
|                                     |
+-------------------------------------+
```

### Animation Sequence

1. Octopus fades in with bounce
2. "WordZen" text slides up
3. Tagline fades in
4. Loading indicator appears
5. Transition to onboarding (first time) or home (returning user)

---

## Onboarding Flow

### Step 1: Welcome

```
+-------------------------------------+
|                            Skip     |
|                                     |
|           +-------------+           |
|           |   OCTOPUS   |           |
|           |   READING   |           |
|           +-------------+           |
|                                     |
|        Welcome to WordZen!          |
|                                     |
|   Learn English vocabulary with     |
|   swipe gestures and fun games      |
|                                     |
|                                     |
|            o o o o o                |
|                                     |
|      +---------------------+        |
|      |       Next          |        |
|      +---------------------+        |
|                                     |
+-------------------------------------+
```

### Step 2: How It Works

```
+-------------------------------------+
|                            Skip     |
|                                     |
|      +------------------------+     |
|      |                        |     |
|      |   CARD WITH ARROWS     |     |
|      |   <- KNOW | DON'T ->   |     |
|      |                        |     |
|      +------------------------+     |
|                                     |
|         Swipe to Learn              |
|                                     |
|   Swipe LEFT if you know the word   |
|   Swipe RIGHT if you don't know     |
|                                     |
|            o o o o o                |
|                                     |
|      +---------------------+        |
|      |       Next          |        |
|      +---------------------+        |
|                                     |
+-------------------------------------+
```

### Step 3: Choose Translation Language

```
+-------------------------------------+
|                            Skip     |
|                                     |
|     Choose Your Language            |
|                                     |
|     Select the language for         |
|     translations                    |
|                                     |
|  +-----------------------------+    |
|  |  O'zbek tili            [x] |    |
|  +-----------------------------+    |
|                                     |
|  +-----------------------------+    |
|  |  Rus tili / Russkiy     [ ] |    |
|  +-----------------------------+    |
|                                     |
|  +-----------------------------+    |
|  |  Qozoq tili / Kazakh    [ ] |    |
|  +-----------------------------+    |
|                                     |
|            o o o o o                |
|                                     |
|      +---------------------+        |
|      |       Next          |        |
|      +---------------------+        |
|                                     |
+-------------------------------------+
```

### Step 4: Select Your Region

```
+-------------------------------------+
|                            Skip     |
|                                     |
|     Where are you from?             |
|                                     |
|     This helps us show you local    |
|     rankings and competitions       |
|                                     |
|  Country:                           |
|  +-----------------------------+    |
|  |  Uzbekistan              \/ |    |
|  +-----------------------------+    |
|                                     |
|  Region:                            |
|  +-----------------------------+    |
|  |  Tashkent City           \/ |    |
|  +-----------------------------+    |
|                                     |
|            o o o o o                |
|                                     |
|      +---------------------+        |
|      |       Next          |        |
|      +---------------------+        |
|                                     |
+-------------------------------------+
```

### Step 5: Ready to Start

```
+-------------------------------------+
|                                     |
|                                     |
|           +-------------+           |
|           |   OCTOPUS   |           |
|           | CELEBRATING |           |
|           +-------------+           |
|                                     |
|         You're all set!             |
|                                     |
|   Start with a free course and      |
|   earn points to unlock more!       |
|                                     |
|                                     |
|            o o o o o                |
|                                     |
|      +---------------------+        |
|      |    Start Learning    |       |
|      +---------------------+        |
|                                     |
+-------------------------------------+
```

---

## Translation Languages

### Primary Languages

1. **O'zbek tili (Uzbek)**
   - Latin script
   - Primary target audience

2. **Russkiy (Russian)**
   - Cyrillic script
   - Common in CIS region

3. **Qazaq tili (Kazakh)**
   - Latin/Cyrillic
   - Growing user base

### Future Languages (Phase 2)
- Tajik
- Kyrgyz
- Turkmen

---

## Onboarding Data Model

```typescript
interface OnboardingData {
  translationLanguage: 'uz' | 'ru' | 'kz';
  country: string;
  region: string;
  completedAt: string | null;
  skipped: boolean;
}

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  illustration: string;
  action?: 'select_language' | 'select_region';
}
```

---

## Skip Logic

- User can skip at any step
- If skipped, use defaults:
  - Language: Russian (most common)
  - Country: Auto-detect from Telegram or default to Uzbekistan
  - Region: None (only global rankings)
- Can change later in Settings

---

## Returning User Flow

```
App Launch
    |
    v
Check localStorage for 'onboarding_complete'
    |
    +---> Yes: Show splash briefly -> Home screen
    |
    +---> No: Show splash -> Onboarding flow
```

---

## Google Stitch Prompt: Splash Screen

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

---

## Google Stitch Prompt: Onboarding Screens

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

## Telegram Data Integration

When opening in Telegram, auto-fill available data:

```typescript
// From Telegram SDK
const telegramUser = {
  firstName: string;
  lastName: string;
  languageCode: string; // 'ru', 'uz', etc.
  photoUrl: string;
};

// Auto-fill logic:
// - Name: Use Telegram name
// - Language: Map languageCode to our options
// - Avatar: Use Telegram photo
```

---

## Deliverables

- [ ] SplashScreen component
- [ ] Splash animation sequence
- [ ] OnboardingScreen component
- [ ] OnboardingStep component
- [ ] LanguageSelector component
- [ ] RegionSelector component (country + region)
- [ ] Progress dots indicator
- [ ] Skip functionality
- [ ] Onboarding completion tracking
- [ ] Telegram data auto-fill
- [ ] Returning user detection
- [ ] Transition animations between steps
- [ ] Onboarding Zustand store
