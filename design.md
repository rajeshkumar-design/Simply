# Siply - Water Tracker App Design

## Overview
Siply is a playful, one-tap water tracking mobile app designed for iOS and Android. The app helps users log water intake quickly using custom containers, track daily hydration goals, and view analytics across different time periods.

## Design Philosophy
- **Fast**: Main action (logging water) takes less than one second
- **Effortless**: Minimal friction, intuitive interactions
- **Satisfying**: Visual feedback and rewarding microcopy
- **Playful**: Friendly, calm, and light aesthetic
- **Clean**: Rounded cards, soft colors, simple typography

## Screen List

### 1. Home Screen (Dashboard)
**Purpose**: Main entry point showing today's hydration status and quick-add containers

**Content & Layout**:
- Header: "Today" title with date
- Progress Ring: Visual representation of daily goal progress (e.g., 2.1L / 3L)
- Remaining Amount: Large text showing "900ml left today"
- Quick-Add Containers: Horizontal scrollable cards for each saved container (tap to log)
- Today's Log: Vertical timeline of logged entries with timestamps and amounts
- Action Buttons: Undo (on recent entry), Delete (on each log item)

**Key Interactions**:
- Tap container card → +amount added to total, animation plays, entry appears in timeline
- Tap undo → removes last entry
- Tap log item → delete option appears
- Swipe or scroll to view full timeline

### 2. Containers Screen
**Purpose**: Manage custom drink containers

**Content & Layout**:
- Header: "My Containers" with add button (+)
- Container List: Cards showing each container with name, capacity, emoji/icon
- Edit/Delete Options: Swipe or long-press to reveal actions

**Key Interactions**:
- Tap add button → modal to create new container
- Enter name, capacity (ml), select emoji
- Tap edit → modify existing container
- Tap delete → confirm and remove

### 3. Analytics Screen
**Purpose**: View hydration history and trends

**Content & Layout**:
- Time Period Tabs: Day, Week, Month, Year
- Chart/Visualization: Bar chart for daily intake, trend lines, or consistency view
- Summary Stats: Total intake, average, goal completion rate
- Date Navigation: Arrows to move between periods

**Key Interactions**:
- Tap tab to switch time period
- Tap date to jump to specific day
- Swipe to navigate between periods

### 4. Settings Screen
**Purpose**: Configure app preferences

**Content & Layout**:
- Daily Goal: Slider or input field to set goal (e.g., 2L, 2.5L, 3L, custom)
- Unit Preference: Toggle between ml and oz
- Theme: Light/Dark mode toggle
- About: App version and credits

**Key Interactions**:
- Adjust goal → saves automatically
- Toggle units → updates all displays
- Toggle theme → immediate visual change

## Primary User Flows

### Flow 1: Log Water (Main Action)
1. User opens app → Home screen
2. User taps container card (e.g., "Mug +300ml")
3. Amount added to daily total
4. Animation confirms action
5. Entry appears in timeline with timestamp
6. Progress ring updates

**Time to complete**: < 1 second

### Flow 2: Create Custom Container
1. User navigates to Containers screen
2. Taps add button (+)
3. Modal appears with form
4. Enters name (e.g., "750ml Steel Bottle")
5. Enters capacity (e.g., 750)
6. Selects emoji (e.g., 🍾)
7. Taps save
8. Container appears in list and on Home screen

### Flow 3: View Analytics
1. User navigates to Analytics screen
2. Selects time period (Day, Week, Month, Year)
3. Views chart and summary stats
4. Can navigate between periods using arrows

### Flow 4: Undo Recent Entry
1. User on Home screen
2. Realizes they logged water twice
3. Taps undo button on last entry
4. Entry removed from timeline
5. Progress ring updates

## Color Choices

**Brand Colors** (calm, light, playful):
- **Primary**: #0A7EA4 (soft blue, hydration theme)
- **Background**: #FFFFFF (light mode) / #151718 (dark mode)
- **Surface**: #F5F5F5 (light mode) / #1E2022 (dark mode)
- **Foreground**: #11181C (light mode) / #ECEDEE (dark mode)
- **Muted**: #687076 (light mode) / #9BA1A6 (dark mode)
- **Success**: #22C55E (positive feedback)
- **Border**: #E5E7EB (light mode) / #334155 (dark mode)

**Accent Colors**:
- Water/Hydration: Shades of blue (#0A7EA4, #4A9FBF)
- Positive Actions: Green (#22C55E)
- Warnings: Orange (#F59E0B)

## Typography & Spacing

- **Headings**: Bold, 24-32px
- **Body**: Regular, 14-16px
- **Captions**: Muted, 12-14px
- **Spacing**: 8px, 12px, 16px, 24px grid

## Key UI Components

1. **Progress Ring**: Circular progress indicator showing goal completion
2. **Container Cards**: Rounded, tappable cards with name, capacity, emoji
3. **Timeline Entry**: Row with timestamp, container name, amount, delete button
4. **Chart**: Simple bar chart for analytics
5. **Buttons**: Large tap targets (48px+ height), rounded corners
6. **Modals**: Full-screen or bottom-sheet for forms

## Animations & Feedback

- **Container Tap**: Scale 0.97, haptic feedback (light)
- **Entry Added**: Slide-in animation from bottom, success haptic
- **Progress Update**: Smooth ring fill animation
- **Undo**: Fade-out animation
- **Theme Switch**: Fade transition

## Microcopy & Tone

- "Sip logged" — after logging water
- "Nice, you hydrated!" — when goal reached
- "Tiny win" — encouraging message
- "Goal completed! 🎉" — celebration
- "Your bottle says thanks" — playful message

## Responsive Design

- **Portrait Orientation**: 9:16 aspect ratio (mobile standard)
- **One-Handed Usage**: All interactive elements within thumb reach
- **Safe Area**: Handles notch, home indicator, tab bar
- **Tablet Support**: Optional, scales gracefully

## Future Enhancements (Post-MVP)

- Hydration reminders (notifications)
- Streaks and achievements
- Home screen widget
- Export history (CSV/PDF)
- Dark mode toggle
- Sound or haptic feedback customization
- Deeper insights and trends
- Sync with health apps (Apple Health, Google Fit)
