# WordZen - Telegram Mini-App Development Plan

## Project Overview

**WordZen** is a vocabulary learning Telegram mini-app featuring gesture-driven flashcards (Tinder-style swipe), social competition, courses with units, and gamified learning experiences. The app focuses on selling courses while providing free content to engage users.

## Core Concept

- Learn English words by swiping: **Left = I know**, **Right = I don't know**
- Tests determine progress and unlock rewards
- Courses contain multiple units (20-30 cards each)
- Monetization through course sales (individual purchase or subscription)
- Social competition with friends and global rankings
- Earn points to get free courses

## Tech Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (minimal white background philosophy)
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Gestures**: @use-gesture/react
- **Telegram SDK**: @telegram-apps/sdk-react
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Navigation Structure

**Bottom Tab Bar (5 tabs):**
1. **Home** - Dashboard, continue learning, weekly progress, missions
2. **Courses** - All courses (purchased & available), overall progress
3. **Friends** - Social features, competitions, friend profiles
4. **Rating** - Global, country, and regional rankings
5. **Profile** - User stats, settings, achievements

## Phase Overview

| Phase | Focus | Status |
|-------|-------|--------|
| **Phase 1** | Project Setup & Core Infrastructure | ✅ Complete |
| **Phase 2** | Flashcard System (Swipe Learning) | Pending |
| **Phase 3** | Tests & Progress Tracking | Pending |
| **Phase 4** | Courses, Units & Content Structure | **UPDATED** |
| **Phase 5** | Social Features (Friends & Competitions) | **UPDATED** |
| **Phase 6** | User Profile & Settings | **UPDATED** |
| **Phase 7** | Gamification (Pomodoro & Extras) | Pending |
| **Phase 8** | Shop & Monetization | **NEW** |
| **Phase 9** | Home Screen & Missions | **NEW** |
| **Phase 10** | Rankings System | **NEW** |
| **Phase 11** | Onboarding & Splash Screen | **NEW** |
| **Phase 12** | Polish, Animations & Final Integration | Pending |

## Monetization Model

1. **Subscription** - Access all courses via Telegram Stars or third-party merchant
2. **Individual Purchase** - Buy courses forever
3. **Octo Coins** - In-app currency for skins, perks, gifts
4. **Free Content** - Some free courses at each level + free units in paid courses
5. **Earn Free Courses** - Complete 2 courses 100% to earn enough points for a 3rd

## Design Principles

1. **Minimal White Background** - Clean, distraction-free interface
2. **Gesture-First** - Swipe interactions (Tinder-style)
3. **Physical Feel** - Cards should feel tangible and responsive
4. **Gamification** - Missions, progress tracking, competitions
5. **Social Motivation** - Friends, rankings, challenges

## Data Models Summary

- **User** - Profile, stats, subscription, Octo Coins, rating points
- **Course** - Multiple units, difficulty, type (IELTS/General)
- **Unit** - 20-30 word cards, progress tracking
- **WordCard** - Word, transcription, translation, favorite status
- **Test** - Questions per unit, 100% completion rewards
- **Friend** - Profile, competitions, activity history
- **Competition** - 1v1 or group, duration, difficulty
- **Shop** - Skins, Octo Coins packages, perks
- **Mission** - Goals with deadlines, rewards
