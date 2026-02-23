export interface Set {
  id: string;
  reps: number;
  weight: number; // in kg
}

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO date string
  name: string;
  exercises: Exercise[];
}

// --- Workout Program / Plan ---

export type DayType = 'rest' | 'upper' | 'lower' | 'push' | 'pull' | 'full' | 'cardio' | 'custom';

export interface PlanExercise {
  id: string;
  name: string;
  defaultSets: number;
  defaultReps: number;
}

export interface PlanDay {
  dayIndex: number; // 0-based within the period
  type: DayType;
  label: string; // display name, defaults to the type
  exercises: PlanExercise[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  periodDays: number; // length of the repeating cycle, e.g. 7
  startDate: string;  // ISO date string – anchor for "which day are we on"
  days: PlanDay[];
}
