# 🏋️ Trakker

Mobile-first workout tracking app built with React + TypeScript.
Data is stored locally in the browser (`localStorage`) so the app works offline.

## What It Does

- Log workout sessions (exercise, sets, reps, weight)
- View and expand workout history
- Track exercise progress (max weight and total volume)
- Create a repeating workout plan and start today's planned workout

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Build & Lint

```bash
npm run lint
npm run build
```

## Project Structure

```text
src/
	App.tsx                 # Shell + bottom navigation + routes
	components/Icons.tsx    # Shared icon components
	constants/dayTypes.ts   # Day type labels/colors (shared)
	pages/
		Dashboard.tsx         # Home + today's plan + recent sessions
		LogWorkout.tsx        # Session logging flow
		Plan.tsx              # Program creation/editing
		History.tsx           # Session history + delete
		Progress.tsx          # Charts and KPIs
	storage.ts              # localStorage read/write helpers
	types.ts                # Shared domain types
	utils/date.ts           # Shared date formatting helpers
```

## Data Model (localStorage)

- `trakker_workouts`: `WorkoutSession[]`
- `trakker_plan`: `WorkoutPlan | null`

Primary types are in `src/types.ts`:

- `WorkoutSession` → many `Exercise` → many `Set`
- `WorkoutPlan` → many `PlanDay` → many `PlanExercise`

## Maintenance Notes

- Keep business logic in `storage.ts` and small utilities, not inside page components.
- Reuse shared constants (`constants/dayTypes.ts`) for labels/colors to avoid drift.
- Prefer adding typed helpers for repetitive UI transforms (dates, grouping, display text).
- When adding fields to persisted types, include fallback/default behavior in storage readers.

## Quick Extension Ideas

- Edit existing sessions (currently add/delete only)
- Exercise templates/favorites
- Data export/import (JSON)
- Cloud sync (optional, currently local-only)
