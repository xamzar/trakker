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
