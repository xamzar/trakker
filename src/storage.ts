import type { WorkoutPlan, WorkoutSession } from './types';

const STORAGE_KEY = 'trakker_workouts';
const PLAN_KEY = 'trakker_plan';

export function getSessions(): WorkoutSession[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveSession(session: WorkoutSession): void {
  const sessions = getSessions();
  const existingIndex = sessions.findIndex(s => s.id === session.id);
  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.unshift(session);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function deleteSession(id: string): void {
  const sessions = getSessions().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function getExerciseNames(): string[] {
  const sessions = getSessions();
  const names = new Set<string>();
  sessions.forEach(session => {
    session.exercises.forEach(ex => names.add(ex.name));
  });
  return Array.from(names).sort();
}

/** Returns the sets from the most-recent session that contained this exercise. */
export function getLastSetsForExercise(name: string): { reps: number; weight: number }[] | null {
  const sessions = getSessions();
  for (const session of sessions) {
    const match = session.exercises.find(
      e => e.name.toLowerCase() === name.toLowerCase()
    );
    if (match) {
      return match.sets.map(s => ({ reps: s.reps, weight: s.weight }));
    }
  }
  return null;
}

// --- Workout Plan helpers ---

export function getActivePlan(): WorkoutPlan | null {
  try {
    const data = localStorage.getItem(PLAN_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveActivePlan(plan: WorkoutPlan): void {
  localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
}

export function clearActivePlan(): void {
  localStorage.removeItem(PLAN_KEY);
}

const MS_PER_DAY = 86_400_000;

/** Returns the day-index (0-based within the period) for today given a plan. */
export function getTodayDayIndex(plan: WorkoutPlan): number {
  const start = new Date(plan.startDate);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - start.getTime()) / MS_PER_DAY);
  return ((diffDays % plan.periodDays) + plan.periodDays) % plan.periodDays;
}
