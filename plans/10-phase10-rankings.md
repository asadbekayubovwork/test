# Phase 10: Rankings System (NEW)

## Objectives

- Build comprehensive ranking/leaderboard system
- Implement three ranking categories: Global, Country, Regional
- Focus on CIS countries (Uzbekistan, Kazakhstan, Russia, etc.)
- Create ranking preview widget for home screen
- Show position changes and trends

---

## Ranking Categories

### 1. Global Rankings
- All users worldwide
- Based on total rating points
- Updated in real-time

### 2. Country Rankings
- Filter by country
- CIS countries focus:
  - Uzbekistan
  - Kazakhstan
  - Russia
  - Tajikistan
  - Kyrgyzstan
  - Turkmenistan
  - Azerbaijan
  - Belarus
  - Moldova
  - Armenia
  - Georgia
  - Ukraine

### 3. Regional Rankings
- Filter by region/city within country
- Example: Tashkent, Samarkand, Bukhara, etc.

---

## Ranking Data Model

```typescript
interface RankingEntry {
  userId: string;
  user: {
    name: string;
    avatar: string;
    level: number;
    country: string;
    countryFlag: string;
    region: string;
  };
  position: number;
  previousPosition: number;
  change: 'up' | 'down' | 'same' | 'new';
  changeAmount: number;
  ratingPoints: number;
  weeklyPoints: number;
}

interface RankingFilter {
  type: 'global' | 'country' | 'region';
  period: 'all_time' | 'weekly' | 'monthly';
  country?: string;
  region?: string;
}
```

---

## Rankings Screen Layout

```
+-------------------------------------+
|  <- Rankings                        |
|                                     |
|  [Global] [Country] [Region]        |
|                                     |
|  Period: [All Time] [Weekly] [Month]|
|                                     |
|  ---------------------------------  |
|                                     |
|           TOP 3 PODIUM              |
|                                     |
|        [2nd]  [1st]  [3rd]         |
|         Ag    Gold    Br           |
|                                     |
|  ---------------------------------  |
|                                     |
|  4.  Avatar  Name       +12   1,450 |
|      |-flag  Level 24        pts    |
|                                     |
|  5.  Avatar  Name       +5    1,380 |
|      |-flag  Level 22        pts    |
|                                     |
|  ...                                |
|                                     |
|  ---------------------------------  |
|                                     |
|  YOUR POSITION (fixed footer)       |
|  #847 | +15 | 1,250 pts            |
|                                     |
+-------------------------------------+
```

---

## Top 3 Podium Design

```
              +--------+
              |  GOLD  |
              | Avatar |
              |  Name  |
              | 2,450  |
+--------+    +--------+    +--------+
| SILVER |                  | BRONZE |
| Avatar |                  | Avatar |
|  Name  |                  |  Name  |
| 2,230  |                  | 2,100  |
+--------+                  +--------+
```

---

## Country Selection Modal

```
+-------------------------------------+
|  Select Country              X      |
|                                     |
|  Search countries...                |
|                                     |
|  CIS Countries                      |
|  ---------------------------------  |
|  |-uz  Uzbekistan                   |
|  |-kz  Kazakhstan                   |
|  |-ru  Russia                       |
|  |-tj  Tajikistan                   |
|  |-kg  Kyrgyzstan                   |
|  |-tm  Turkmenistan                 |
|  |-az  Azerbaijan                   |
|  |-by  Belarus                      |
|  |-md  Moldova                      |
|  |-am  Armenia                      |
|  |-ge  Georgia                      |
|  |-ua  Ukraine                      |
|                                     |
|  Other Countries                    |
|  ---------------------------------  |
|  ...                                |
+-------------------------------------+
```

---

## Region Selection (Based on Country)

### Uzbekistan Regions Example
- Tashkent City
- Tashkent Region
- Samarkand
- Bukhara
- Fergana
- Andijan
- Namangan
- Khorezm
- Kashkadarya
- Surkhandarya
- Navoi
- Jizzakh
- Syrdarya
- Republic of Karakalpakstan

---

## Position Change Indicators

```typescript
interface PositionChange {
  direction: 'up' | 'down' | 'same' | 'new';
  amount: number;
}

// Display:
// +12 (green, arrow up)
// -5 (red, arrow down)
// -- (gray, no change)
// NEW (purple badge for new entries)
```

---

## Google Stitch Prompt: Rankings Screen

```
Design a leaderboard/rankings screen for a learning app:

LAYOUT:
- Header with "Rankings" title
- Category tabs: Global, Country, Region
- Period filter: All Time, Weekly, Monthly
- Top 3 podium section
- Scrollable rankings list
- Fixed footer with user's position

TOP 3 PODIUM:
- Center position for 1st (Gold, tallest)
- Left position for 2nd (Silver)
- Right position for 3rd (Bronze)
- Large avatars with medal overlay
- Name and points below each
- Gold/silver/bronze color accents

RANKING LIST:
- Position number
- Avatar with country flag badge
- Name and level
- Position change indicator (+5, -3, NEW)
- Rating points

POSITION CHANGE:
- Green up arrow with number for improvement
- Red down arrow for drops
- Gray dash for no change
- Purple "NEW" badge for new entries

YOUR POSITION:
- Fixed at bottom of screen
- Highlighted row
- Shows position, change, and points

STYLE:
- White background
- Clear visual hierarchy
- Celebratory feel for top 3
- Easy scanning for rest
```

---

## Google Stitch Prompt: Country Selection

```
Design a country selection modal:

LAYOUT:
- Modal header with "Select Country"
- Search input
- Grouped sections: "CIS Countries", "Other"
- List of countries with flags

COUNTRY ROW:
- Flag emoji or icon
- Country name
- Checkmark if selected

STYLE:
- Bottom sheet modal
- Easy scrolling
- Clear selection state
- Quick access to common countries (CIS)
```

---

## Deliverables

- [ ] RankingsScreen page component
- [ ] Category tabs (Global/Country/Region)
- [ ] Period filter (All Time/Weekly/Monthly)
- [ ] Top3Podium component
- [ ] RankingListItem component
- [ ] Position change indicators
- [ ] UserPositionFooter fixed component
- [ ] CountrySelectionModal
- [ ] RegionSelectionModal
- [ ] CIS countries data
- [ ] Regions by country data
- [ ] Rankings Zustand store
- [ ] Ranking preview widget (for home screen)
