# WordZen — Project Status

_Last updated: 2026-05-11_

A single-page view of where every phase and every page stands. Cross-references the phase plans in this folder with the actual git history and code.

---

## 1. Phase status

| # | Phase | Status | Notes |
|---|-------|--------|-------|
| 1 | Project Setup & Core Infrastructure | ✅ Done | — |
| 2 | Flashcard System (Swipe Learning) | ✅ Done | Match + Write modes added |
| 3 | Tests & Progress Tracking | ✅ Done | Quiz wired to backend, statistics fixed |
| 4 | Courses, Units & Content | ✅ Done | Library gating in place |
| 5 | Social Features (Friends & Competitions) | 🟡 Partial | Friends pages exist; competitions / search not built |
| 6 | User Profile & Settings | ✅ Done | Subscription badge added in migration |
| 7 | Gamification (Pomodoro & Mini-Games) | 🟡 Partial | Extra games + Pomodoro shipped; Daily Challenge / Word Rush / Octo Memory open |
| 8 | Shop & Monetization | 🔁 Replaced | Folded into Subscription migration (see §3) |
| 9 | Home Screen & Missions | 🟡 Partial | Dashboard done; Missions widget open |
| 10 | Rankings System | ⛔ Not started | Page exists but uses mock data only |
| 11 | Onboarding & Splash Screen | ✅ Done | Country/region selector + i18n |
| 12 | Polish, Animations & Final Integration | 🔄 Ongoing | Continuous |

Legend: ✅ Done · 🟡 Partial · 🔄 Ongoing · ⛔ Not started · 🔁 Replaced/scope-changed · 🚧 In progress

---

## 2. Page-by-page backend wiring

What actually connects to the API vs. still on mock data.

| Page | Backend? | Stores / API used | Mock data still used | Notes |
|------|----------|-------------------|----------------------|-------|
| Home | ✅ | `coursesStore`, `profileStats`, `client` | — | |
| Courses | ✅ | `coursesStore`, `api/courses` | — | |
| CourseDetail | ✅ | `coursesStore`, `favoritesStore`, `api/courses`, `api/favorites` | — | |
| UnitDetail | ✅ | `coursesStore`, `api/courses` | — | |
| Flashcards | ✅ | `coursesStore`, `api/courses` | — | |
| Tests | ✅ | `quizStore`, `api/courses` | — | |
| Match | ✅ | `matchStore` | — | |
| Write | ✅ | `writeStore`, `api/courses` | — | |
| Favorites | ✅ | `favoritesStore`, `api/courses` | — | |
| Statistics | ✅ | `profileStatsStore` | — | Session tracking wired |
| Onboarding | ✅ | `userStore`, `api/client` | — | |
| Login | ✅ | `api/auth` | — | |
| Register | ✅ | `api/auth` | — | |
| Subscription | ✅ | `subscriptionStore`, `usageStore`, `paymentCardsStore` | — | |
| Pomodoro | ✅ | `pomodoroStore` | — | |
| Games | ✅ | `gamesStore` | — | |
| Friends | ✅ | `friendsStore`, `api/friends` | — | Search / competitions not built |
| FriendDetail | ✅ | `friendsStore`, `api/friends` | — | |
| Profile | 🟡 Mixed | `userStore`, `auth`, `client` | `data/achievements` | Achievements still mocked |
| Settings | 🟡 Mixed | `settingsStore` | `data/countries` | Country/region is reference data — likely OK |
| Rankings | ⛔ Mock | `userStore` only | `data/rankings` | No `api/rankings.ts` exists yet |
| Shop | 🔁 Redirect | — | — | 8-line `<Navigate to="/subscription" />` |

---

## 3. Subscription migration (replaces original Phase 8)

Migration is mid-flight: per-course Stars + Click flow has been removed, subscription rail is live. See `memory/project_subscription_migration.md` and `memory/project_open_questions.md`.

| Item | Status | Commit |
|------|--------|--------|
| Telegram Mini App purchase integration | ✅ | `0f1df93` |
| Initial purchase implementation | ✅ | `3b23b75` |
| Click payment integration | ✅ | `a0e3807` (+ fixes `8966543`, `6ffaa6c`, `95bfb8f`, `07e3b10`) |
| Payment service API foundation | ✅ | `f4d70a5` |
| Subscription / usage / payment-card stores | ✅ | `7bc2f79` |
| Subscription page + PaywallBanner + SubscribeModal | ✅ | `0f6535c` |
| Free-tier gating | ✅ | `b39e5a9` |
| Remove deprecated coin/Click course-purchase flow | ✅ | `0cc5b33` |
| SubscriptionSyncer + Profile badge + Russian copy | ✅ | `8673177` |
| `X-Client-Key` header on main API requests | ✅ | `fa87d07` |
| **How packages activate subscriptions** | ⛔ Blocked | Open question |
| Other secondary payment-rail clarifications | ⛔ Blocked | Open question |

---

## 4. Open work (concrete next steps)

| Area | What's needed | Where it lives |
|------|---------------|----------------|
| Rankings | Build `api/rankings.ts` + store; swap mock import in `pages/Rankings/index.tsx` | Phase 10 |
| Achievements | Decide: backend endpoint, or keep client-computed against session data | Phase 6 / Profile |
| Social — competitions | Friends search across Telegram, 1v1 + group/battle-royale, activity history | Phase 5 |
| Missions widget | Weekly progress with checkmarks on Home dashboard | Phase 9 |
| Mini-games | Daily Challenge, Word Rush, Octo Memory | Phase 7 |
| Subscription unblock | Resolve "how packages activate subscriptions" | `memory/project_open_questions.md` |
| Polish | Loading / empty / error states across new pages | Phase 12 |

---

## 5. Phase → key commits (audit trail)

Use these to dive deeper with `git show <sha>`.

| Phase | Key commits |
|-------|-------------|
| 1 Setup | `8ed184b` |
| 2 Flashcards | `dde862f`, `1a653ef` |
| 3 Tests / Progress | `64dedf0`, `48fcbf6`, `a2f71da`, `1506b51`, `ed590e7` |
| 4 Courses | `4849137`, `f4a072f`, `f08300a`, `2ffbd10`, `10df46b` |
| 6 Profile | `a6811cd`, `8673177` |
| 7 Gamification (partial) | `7343c68` |
| 9 Home | `739d61d`, `8aa656b`, `01524b9`, `79d912c`, `5e9e51d` |
| 11 Onboarding | `235dbf7`, `bb98ed4`, `6545382`, `db5e6f3`, `1bed2b3`, `893aca7`, `e351521`, `6288bea` |
| 12 Polish / Infra | `ba683de`, `f3f50b2`, `b9cfa0d`, `1693659`, `020256d`, `0230e65` _(image/media + Telegram WebView session-flush fixes)_ |

---

## How to keep this file healthy

- Move rows between sections as work changes state — don't let "Open" rot.
- When a page flips from mock → backend, change its row in §2 from 🟡/⛔ to ✅ and clear the "Mock data still used" cell.
- When a phase scope changes (like Phase 8 → subscription), mark it 🔁 in §1 and add a one-liner in the relevant section explaining the swap.
- Quick re-audit: `git log --oneline --since="<date>"` for what shipped, then `grep -r "lib/data" src/pages` to find pages still on mocks.
