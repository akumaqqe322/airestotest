# Airesto Restaurant Booking Timeline

An advanced, high-performance interactive restaurant booking timeline for **Ark Studio / Airesto**, built in Vue 3 and TypeScript. It features a customizable scheduling grid, collision lanes, and a fully reactive dark/light visual theme.

---

## 🎨 Design Concept: Table Column Grid Timeline

Designed with a focus on ease of floor management:
* **Table Track Columns**: Each table displays as a separate column track.
* **Vertical Time Dimension**: Time flows downward, mimicking standard booking charts.
* **Dynamic Slot Layout**: Events (Reservations and Active Orders) are placed as absolute elements with precise calculated pixels corresponding to the restaurant timezone and opening/closing minutes.
* **High-Density Cascade Slots**: If multiple reservations overlap on the same table, the interface assigns them to adjacent mathematical lanes, offsetting elements horizontally (cascading look) to preserve legibility without breaking alignment.

---

## 🛠️ Technological Stack

* **Front-end Environment**: Vue 3 (Composition API, `<script setup>`), Vite
* **Programming Language**: TypeScript
* **Styling Framework**: Tailwind CSS
* **Icons**: Lucide Vue Next
* **Dependencies**: Completely pruned of initial React/Express dependencies; utilizes vanilla CSS Variables for premium themes with very low memory overhead.

---

## ✨ Implemented Core & Bonus Features

### 1. Required Foundation (Core Items)
- ✅ **Complete Vue 3 + Vite Cleanup**: Fully migrated from React template layers to Vue SFC format; completely stripped React variables and node modules.
- ✅ **Zone Filter Toggles**: Support selecting single or multiple zones (`1 этаж`, `2 этаж`, `Банкетный зал`) dynamically. Handles empty states gracefully.
- ✅ **Russian Date Switcher**: Lets staff shift dates, regenerating corresponding mock data dynamically.
- ✅ **Restaurant Timezone Tracker**: Features real-world timezone-aware ticker synchronized using UTC offsets representing local restaurant timezone. Includes manual Debug overrides.
- ✅ **Centralized Collision-Lane Layout Engine**: Sorts events, clamps bounds, filters invalid out-of-bounds items, and computes absolute coordinates (`topPx`, `heightPx`, `leftPx`, `widthPx`, `zIndex`) programmatically.
- ✅ **Interactive Hover Cards**: Elevates cards to higher stacking contexts on hover (`zIndex=100`), reveals customer phone numbers, and retains layout dimensions.

### 2. Premium Experience (Bonus Items)
- ✅ **Dual Theme Palette**: Seamlessly switches between Dark Velvet and Soft Light modes at the touch of a header button.
- ✅ **Smart Density Blocks (Compact mode)**: Automatically collapses detailed reservation texts into minimalist micro-line indicators on small time slots or heavily clustered tables to prevent box overflows.
- ✅ **Interactive Point Selection**: Click on empty tracks to suggest new reservation blocks. The timeline locks onto table coordinates and rounds timestamps to the nearest 15-minute mark.
- ✅ **Floating Action Creator**: Prompts the user with slot confirmation, logs exact table identities and timing parameters to the console, and dynamically inserts the booking locally in-state.

---

## 🚀 Local Run Instructions

Follow these commands to launch the application locally:

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Development Server
```bash
npm run dev
```
The server will boot on [http://localhost:3000](http://localhost:3000).

### 3. Check types and build
```bash
npm run lint
npm run build
```

---

## 📝 Technical Implementation Notes

### Time Tracking & Clamping
The application is resilient against booking hours exceeding the operating hours boundaries (e.g. `11:00 - 23:40`). Core logic uses:
```typescript
startMins = Math.max(openingMins, Math.min(closingMins, originalStart));
```
Any booking starting after operational closure or ending prior to opening is safely discarded. To prevent 0px card heights, standard blocks are clamped to a minimum operational space of 15 minutes.

### Connected Components & Interval Coloring
Collision tracks are structured using a greedy interval coloring algorithm. For each table, incoming bookings represent vertices in an interval graph. The layout assigns the lowest available integer "color" index describing the horizontal lane track, offsetting elements by `8px * lane` of horizontal margin while decreasing corresponding card widths proportionally.

---

## 💡 API Enhancement Notes

To transition this high-fidelity dashboard into full production, we recommend the following backend structural improvements:

1. **Connected Session Token Tracking**: Introduce a `session_uuid` or table mutation counter on `/api/booking` response payloads to enable real-time WebSockets syncing with change notifications.
2. **Standardized ISO Datetimes**: The current contract mixes `HH:MM` and ISO strings. Standardizing all event timestamps to `ISO 8601 with Zone Offset` guarantees consistent parsers on both client and mobile clients.
3. **Optimized Segment Indexing**: When querying ranges, the backend should accept `?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` parameters to return lightweight interval payloads rather than dumping full table logs.
