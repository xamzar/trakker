import type { WorkoutSession } from './types';

const STORAGE_KEY = 'trakker_workouts';

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
