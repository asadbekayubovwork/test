# Phase 8: Shop & Monetization (NEW)

## Objectives

- Build shop accessible from home screen header
- Implement Octo Coins purchase system
- Create skins/covers marketplace
- Enable subscription management
- Handle Telegram Stars and third-party payments

---

## Data Models

### OctoCoins Package

```typescript
interface CoinPackage {
  id: string;
  amount: number;
  price: number; // in Telegram Stars
  bonus?: number; // bonus coins
  isPopular?: boolean;
  discount?: number; // percentage
}
```

### Skin/Cover

```typescript
interface Skin {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  type: 'profile_background' | 'card_theme' | 'avatar_frame';
  price: number; // in Octo Coins
  isPurchased: boolean;
  isEquipped: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}
```

### Subscription

```typescript
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  features: string[];
  priceMonthly: number; // Telegram Stars
  priceYearly: number;
  discount?: number;
}
```

### Perk

```typescript
interface Perk {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number; // Octo Coins
  duration?: number; // hours, null = permanent
  type: 'xp_boost' | 'coin_boost' | 'streak_freeze' | 'hint_pack';
}
```

---

## Shop Entry (Home Header)

```
┌─────────────────────────────────────┐
│  🐙 WordZen    🪙 520  ⭐ 1,250  🛒 │
│                                     │
└─────────────────────────────────────┘
```

- Logo + App name on left
- Octo Coins balance
- Rating points
- Shop icon (opens shop)

---

## Shop Main Screen

```
┌─────────────────────────────────────┐
│  ← Shop                             │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🪙 Your Balance: 520       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [Coins] [Skins] [Perks] [Premium] │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Buy Octo Coins                     │
│                                     │
│  ┌─────────┐ ┌─────────┐           │
│  │  🪙 100 │ │  🪙 500 │           │
│  │  ⭐ 49  │ │  ⭐ 199 │           │
│  │         │ │ POPULAR │           │
│  └─────────┘ └─────────┘           │
│                                     │
│  ┌─────────┐ ┌─────────┐           │
│  │ 🪙 1000 │ │ 🪙 2500 │           │
│  │  ⭐ 349 │ │  ⭐ 799 │           │
│  │ +100    │ │ +500    │           │
│  │ bonus   │ │ bonus   │           │
│  └─────────┘ └─────────┘           │
│                                     │
└─────────────────────────────────────┘
```

---

## Skins Tab

```
┌─────────────────────────────────────┐
│  ← Shop                             │
│                                     │
│  [Coins] [Skins] [Perks] [Premium] │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Profile Backgrounds                │
│                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐
│  │ 🌅     │ │ 🌌     │ │ 🏔️     │
│  │ Sunset │ │ Galaxy │ │Mountain│
│  │ 🪙 200 │ │ 🪙 500 │ │ ✓ Owned│
│  │  RARE  │ │  EPIC  │ │        │
│  └─────────┘ └─────────┘ └─────────┘
│                                     │
│  Avatar Frames                      │
│                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐
│  │ 🔵     │ │ 🟡     │ │ 💎     │
│  │  Blue  │ │  Gold  │ │Diamond │
│  │ 🪙 150 │ │ 🪙 300 │ │🪙 1000 │
│  │ COMMON │ │  RARE  │ │LEGEND  │
│  └─────────┘ └─────────┘ └─────────┘
│                                     │
│  Card Themes                        │
│                                     │
│  ┌─────────┐ ┌─────────┐           │
│  │ 🎨     │ │ 🌙     │           │
│  │ Pastel │ │  Dark  │           │
│  │ 🪙 250 │ │ 🪙 250 │           │
│  └─────────┘ └─────────┘           │
│                                     │
└─────────────────────────────────────┘
```

---

## Perks Tab

```
┌─────────────────────────────────────┐
│  ← Shop                             │
│                                     │
│  [Coins] [Skins] [Perks] [Premium] │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Boost Your Learning                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ⚡ 2x XP Boost              │   │
│  │    Double XP for 24 hours   │   │
│  │                    🪙 100   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🪙 2x Coin Boost            │   │
│  │    Double coins for 24h     │   │
│  │                    🪙 150   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ❄️ Streak Freeze            │   │
│  │    Protect your streak      │   │
│  │    for 1 day                │   │
│  │                    🪙 50    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 💡 Hint Pack (10)           │   │
│  │    Get hints in tests       │   │
│  │                    🪙 75    │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Premium Tab (Subscription)

```
┌─────────────────────────────────────┐
│  ← Shop                             │
│                                     │
│  [Coins] [Skins] [Perks] [Premium] │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│         👑 WordZen Premium          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │  ✓ Access ALL courses       │   │
│  │  ✓ Unlimited tests          │   │
│  │  ✓ No ads                   │   │
│  │  ✓ Exclusive skins          │   │
│  │  ✓ Priority support         │   │
│  │  ✓ 2x daily rewards         │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Monthly                    │   │
│  │  ⭐ 299 / month             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Yearly               SAVE  │   │
│  │  ⭐ 2,499 / year       30%  │   │
│  │  = ⭐ 208 / month           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Current: Free Plan                 │
│                                     │
└─────────────────────────────────────┘
```

---

## Purchase Flow

### Coin Purchase

```
┌─────────────────────────────────────┐
│                            ✕        │
│                                     │
│        🪙 Buy 500 Octo Coins        │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│           ⭐ 199 Stars              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     Pay with Telegram       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Alternative payment:               │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     Pay $4.99 (Card)        │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Skin Purchase

```
┌─────────────────────────────────────┐
│                            ✕        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │    [Preview Image]          │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│         🌌 Galaxy Background        │
│         EPIC                        │
│                                     │
│  Stand out with this stunning       │
│  galaxy-themed profile background   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Your balance: 🪙 520               │
│  Price: 🪙 500                      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     Purchase for 🪙 500     │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Google Stitch Prompt: Shop Screen

```
Design a shop screen for a vocabulary learning app:

HEADER:
- Balance display showing Octo Coins
- Tab navigation: Coins, Skins, Perks, Premium

COINS TAB:
- 2x2 grid of coin packages
- Each package shows:
  - Coin amount with icon
  - Price in Telegram Stars
  - Bonus amount if any
  - "POPULAR" badge on best value

SKINS TAB:
- Sections: Profile Backgrounds, Avatar Frames, Card Themes
- 3-column grid of skin previews
- Show rarity badge (Common/Rare/Epic/Legendary)
- Price or "Owned" checkmark

PERKS TAB:
- Vertical list of perks
- Icon, name, description
- Duration if applicable
- Price in Octo Coins

PREMIUM TAB:
- Hero section with crown icon
- Feature list with checkmarks
- Monthly and yearly pricing
- "Save X%" on yearly

STYLE:
- White background
- Gold accent for coins
- Purple accent for premium
- Rarity colors for skins
```

---

## Deliverables

- [ ] Shop screen with tabs
- [ ] Coin packages grid
- [ ] Purchase flow with Telegram Stars
- [ ] Alternative payment integration
- [ ] Skins marketplace
- [ ] Skin preview modal
- [ ] Perks store
- [ ] Perk activation flow
- [ ] Premium subscription page
- [ ] Subscription management
- [ ] Balance display component
- [ ] Shop Zustand store
- [ ] Transaction history
