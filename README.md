# Restaurant Booking Timeline (Airesto)

## Overview
An interactive restaurant booking timeline designed for floor managers to monitor, search, and arrange table reservations and orders in real time. It represents tables as horizontally scrollable column tracks, and time as a vertical axis mapping out the restaurant's operational hours.

This implementation is custom-built on a lightweight, performant layout without relying on heavy external scheduler, calendar, or table grid libraries. It remains smooth with large datasets and active interactions.

## Tech Stack
- **Framework**: Vue 3 (Composition API with Single File Components)
- **Build Tool**: Vite
- **Language**: TypeScript (with strict types)
- **Styling**: Tailwind CSS (using CSS variable themes)
- **Icons**: Lucide Icons
- **Libraries**: No third-party calendar or scheduler grids are used.

## Implemented Features
- **Clean Vue 3 Setup**: Completely pruned and cleaned from all React templates.
- **Dynamic Date Switcher**: Shift dates and see corresponding mock data load dynamically.
- **Multi-Zone Filter**: Multi-select table zones (`1 этаж`, `2 этаж`, `Банкетный зал`) with reactive, high-performance resizing.
- **Timezone-Aware Current Time**: Displays and updates the current time localized to the restaurant's timezone ("Asia/Vladivostok") with a real-time current time indicator line.
- **Sticky Column Headers & Time Axis**: Ensures column headers remain visible at the top, and the time coordinates remain sticky on the left during deep horizontal or vertical scrolls.
- **All Event Statuses**: Renders both reservations and active checks/orders with distinct visual indicators based on their native status values.
- **Interactive Hover States**: Highlights specific cards dynamically on hover, increasing their stacking context index and revealing secondary details (such as customer telephone numbers).
- **Collision & Overlap Layout Engine**: Programmatically runs a fast layout routine to offset overlapping reservation blocks into adjacent column lanes, preventing text content from overlaying or colliding.
- **Smart Compact Hiding**: Collapses card text density for small duration blocks or multiple overlaps to prevent layout overflows.

## Additional Tasks Implemented
- **Dual Visual Themes**: Support for Dark Mode and Light Mode, persisted in localStorage.
- **Horizontal & Vertical Drag-Selection**: Staff can click and drag across multiple table tracks and time spans using Pointer Capture to easily claim a custom reservation slot. Snaps cleanly to 15-minute segments and clamps bounds inside operating hours.
- **Live Overlaps & Conflict Warnings**: Instantly changes the visual color of the active selection area to crimson (with a warning text indicator in the drawer) if the selection overlaps with any existing bookings.
- **Floating Slots Drawer**: Displays selected tables, timestamps, and zone coverage.
- **Explicit Create Flow**: Clicking the "Создать" or "Создать с конфликтом" button issues exactly one consolidated console.log payload containing table numbers and conflict status parameters, and inserts bookings locally into the reactive app state.

## Local Setup
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Launch Development Server**:
   ```bash
   npm run dev
   ```
   The dev server starts on [http://localhost:3000](http://localhost:3000).
3. **Type-Check & Build**:
   ```bash
   npm run lint
   ```
   ```bash
   npm run build
   ```

## Deployment
[Live Application Preview link](https://ais-pre-ouv75w2hvgxszjebgngojq-125225337203.europe-west3.run.app)

## Implementation Notes
- **Lanes sorting (Interval Coloring)**: Designed a programmatical greedy sorting layout that calculates column width cuts, left-coordinate offsets, and z-index ordering natively on-the-fly, avoiding any complex pointer moves calculations.
- **Dynamic Time overrides**: Includes a debug manual override section (enabled in dev mode) allowing development mode testing of the tracker's timeline relative positions.
- **Safe Pointer Capture**: Uses defensive boundary checks (such as `hasPointerCapture`) before releasing pointer grabs to avoid typical scroll container losses on complex layouts.

## API Notes and Possible Improvements
For a production-grade backend API, I would consider introducing the following alterations based on standard floor management conditions:
- **Date query parameter**: Support `GET /api/booking?date=YYYY-MM-DD` so that queries do not download unnecessary historical lists.
- **Zone filtering**: Support query filters e.g. `?zones[]=1st_floor` to lessen structural rendering on thin clients.
- **Server-provided restaurant time**: Return a `current_time` or offset in the payload header to align timezone current clock indicators with the precise database time clock synchronizes.
- **Normalized event objects**: Grid layout layouts are simpler when the API returns unified, normalized event-shape schemas directly, saving processing cycles on mobile clients.
- **Status metadata**: Distinguish system types with custom colors or flags sent directly from the server.
- **Version checks (for caching)**: Provide an `updated_at` or entity tag header to support conditional requests for rapid page refreshes without massive body downloads.
