# Siply - Water Tracker App Design

## Overview
Siply is a minimal, one-tap water tracking mobile app for iOS and Android. Users log water via custom containers, track daily goals, and review analytics. The UI follows a calm water palette with Reanimated micro-interactions (Me+-inspired logging flow).

## Design Philosophy
- **Fast**: One-tap logging from horizontal quick-add chips
- **Effortless**: Bottom sheets for custom amounts and container editing
- **Satisfying**: Toast feedback, animated progress ring, haptics
- **Minimal**: Hero metric, elevated cards, reduced borders
- **Clean**: Rounded cards, soft blues, simple typography

## Screen List

### 1. Home Screen (Dashboard)
- Header: "Today" + date
- **HydrationHero**: SVG progress ring (animated fill) + large remaining amount or "Goal complete"
- Secondary line: consumed / goal
- Subtle "Undo last sip" link (not a full-width destructive button)
- **ContainerQuickAdd**: Horizontal scroll chips (emoji, name, amount); dashed "Custom" opens log sheet
- **LogTimeline**: Animated entries (fade/slide in), delete per row
- **ToastBanner**: "Sip logged", "Goal completed!" after actions

### 2. Containers Screen
- Two-column card grid with emoji, name, capacity, edit/delete
- **ContainerFormSheet**: Bottom sheet (emoji grid, name, capacity stepper)
- Toast on create/update/delete

### 3. Analytics Screen (tab: Stats)
- **SegmentedControl**: Day / Week / Month / Year
- **AnimatedBarChart**: Spring-animated bars, goal color coding
- **StatCard** summary rows
- Day view: entry list

### 4. Settings Screen
- **SettingsSection** groups: Daily goal (presets + custom ml), Units (segmented ml/oz), Appearance (segmented light/dark), About
- Tip card at bottom

## Primary User Flows

### Flow 1: Log Water (Main Action)
1. Open app → Home
2. Tap quick-add chip OR Custom → LogSheet → confirm amount
3. Ring animates, toast appears, timeline entry animates in

### Flow 2: Create Custom Container
1. Containers tab → + button
2. Bottom sheet form → save
3. Chip appears on Home quick-add row

### Flow 3: Undo
1. Tap "Undo last sip" on hero card
2. Entry removed, ring animates back, toast confirms

## Color Tokens (`theme.config.js`)

| Token | Light | Dark |
|-------|-------|------|
| primary | #3B9FD9 | #5BB8E8 |
| accent | #7DD3FC | #38BDF8 |
| background | #F8FAFC | #0F1419 |
| surface | #FFFFFF | #1A2229 |
| surfaceElevated | #FFFFFF | #232D36 |
| ringTrack | #E0F2FE | #1E3A4F |
| success | #10B981 | #34D399 |

## Shared Components (`components/hydration/`)

| Component | Role |
|-----------|------|
| HydrationProgressRing | SVG arc + Reanimated stroke |
| HydrationHero | Ring + hero copy + undo |
| ContainerQuickAdd | Horizontal chips |
| LogSheet | Custom amount bottom sheet |
| LogTimeline | Animated log list |
| ToastBanner | Ephemeral feedback |
| SegmentedControl | Animated pill selector |
| BottomSheet | Slide-up modal shell |
| ContainerFormSheet | Container CRUD form |
| AnimatedBarChart | Analytics bars |
| StatCard | Metric display |
| SettingsSection / SettingsRow | Grouped settings |

## Animations & Feedback

- Container tap: scale spring + light haptic + ring spring + toast
- Timeline: FadeInDown + Layout
- Goal reached: success haptic + green toast
- Undo/delete: medium/light haptic + toast
- Chart bars: spring height on period change
- Segmented control: sliding indicator spring

## Microcopy

- "Sip logged", "Tiny win", "Hydration boost", "Nice sip" (random on log)
- "Goal completed!" (on reaching daily goal)
- "Goal complete" / "Nice, you hydrated!" (hero when done)

## Tab Bar

- Slimmer bar, elevated surface background, 24px icons
- Labels: Home, Containers, Stats, Settings

## Future Enhancements

- Hydration reminders
- Streaks and achievements
- Widgets
- Health app sync
- Custom sound/haptic profiles
