import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import type { Exercise, Set } from '../types';
import { getLastSetsForExercise, saveSession } from '../storage';
import { PlusIcon, TrashIcon } from '../components/Icons';

function newSet(): Set {
  return { id: uuidv4(), reps: 10, weight: 0 };
}

function newExercise(): Exercise {
  return { id: uuidv4(), name: '', sets: [newSet()] };
}

interface LocationState {
  workoutName?: string;
  exercises?: Exercise[];
}

export default function LogWorkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const [workoutName, setWorkoutName] = useState(state.workoutName ?? '');
  const [exercises, setExercises] = useState<Exercise[]>(state.exercises ?? [newExercise()]);

  function addExercise() {
    setExercises(prev => [...prev, newExercise()]);
  }

  function removeExercise(id: string) {
    setExercises(prev => prev.filter(e => e.id !== id));
  }

  function updateExerciseName(id: string, name: string) {
    setExercises(prev => prev.map(e => {
      if (e.id !== id) return e;
      // Only auto-populate from history when the exercise still has its single
      // default set (weight=0, reps=10), so any user-entered sets are preserved.
      const isDefaultState = e.sets.length === 1 && e.sets[0].reps === 10 && e.sets[0].weight === 0;
      const lastSets = (name.trim() && isDefaultState) ? getLastSetsForExercise(name.trim()) : null;
      const sets = lastSets
        ? lastSets.map(s => ({ id: uuidv4(), reps: s.reps, weight: s.weight }))
        : e.sets;
      return { ...e, name, sets };
    }));
  }

  function addSet(exerciseId: string) {
    setExercises(prev => prev.map(e =>
      e.id === exerciseId ? { ...e, sets: [...e.sets, newSet()] } : e
    ));
  }

  function removeSet(exerciseId: string, setId: string) {
    setExercises(prev => prev.map(e =>
      e.id === exerciseId ? { ...e, sets: e.sets.filter(s => s.id !== setId) } : e
    ));
  }

  function updateSet(exerciseId: string, setId: string, field: 'reps' | 'weight', value: number) {
    setExercises(prev => prev.map(e =>
      e.id === exerciseId
        ? { ...e, sets: e.sets.map(s => s.id === setId ? { ...s, [field]: value } : s) }
        : e
    ));
  }

  function handleSave() {
    const name = workoutName.trim() || 'Workout';
    const validExercises = exercises.filter(e => e.name.trim() !== '');
    if (validExercises.length === 0) {
      alert('Please add at least one exercise with a name.');
      return;
    }
    saveSession({
      id: uuidv4(),
      date: new Date().toISOString(),
      name,
      exercises: validExercises,
    });
    navigate('/');
  }

  /** Returns a hint string like "Last: 3×80 kg" for the most-recent sets of this exercise */
  function weightHint(exerciseName: string): string | null {
    if (!exerciseName.trim()) return null;
    const last = getLastSetsForExercise(exerciseName.trim());
    if (!last || last.length === 0) return null;
    const topWeight = Math.max(...last.map(s => s.weight));
    return `Last: ${last.length}×${topWeight} kg`;
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-white">Log Workout</h2>

      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider">Workout Name</label>
        <input
          type="text"
          placeholder="e.g. Push Day, Leg Day..."
          value={workoutName}
          onChange={e => setWorkoutName(e.target.value)}
          className="mt-1 w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm border border-gray-700 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div className="space-y-4">
        {exercises.map((exercise, exIdx) => {
          const hint = weightHint(exercise.name);
          return (
            <div key={exercise.id} className="bg-gray-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={`Exercise ${exIdx + 1} name`}
                    value={exercise.name}
                    onChange={e => updateExerciseName(exercise.id, e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-emerald-500"
                  />
                  {hint && (
                    <p className="text-xs text-emerald-400 mt-0.5 pl-1">{hint}</p>
                  )}
                </div>
                <button onClick={() => removeExercise(exercise.id)} className="text-red-400 p-1.5 hover:bg-gray-700 rounded-lg self-start">
                  <TrashIcon />
                </button>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-12 text-xs text-gray-500 font-medium px-1">
                  <span className="col-span-2">Set</span>
                  <span className="col-span-5 text-center">Reps</span>
                  <span className="col-span-5 text-center">Weight (kg)</span>
                </div>
                {exercise.sets.map((set, setIdx) => (
                  <div key={set.id} className="grid grid-cols-12 items-center gap-1">
                    <span className="col-span-2 text-xs text-gray-500 text-center">{setIdx + 1}</span>
                    <div className="col-span-5 flex items-center justify-center gap-1">
                      <button
                        onClick={() => updateSet(exercise.id, set.id, 'reps', Math.max(1, set.reps - 1))}
                        className="w-7 h-7 bg-gray-700 rounded-lg text-white text-lg leading-none flex items-center justify-center"
                      >−</button>
                      <span className="w-8 text-center text-sm font-medium">{set.reps}</span>
                      <button
                        onClick={() => updateSet(exercise.id, set.id, 'reps', set.reps + 1)}
                        className="w-7 h-7 bg-gray-700 rounded-lg text-white text-lg leading-none flex items-center justify-center"
                      >+</button>
                    </div>
                    <div className="col-span-4 flex items-center justify-center gap-1">
                      <button
                        onClick={() => updateSet(exercise.id, set.id, 'weight', Math.max(0, set.weight - 2.5))}
                        className="w-7 h-7 bg-gray-700 rounded-lg text-white text-lg leading-none flex items-center justify-center"
                      >−</button>
                      <span className="w-10 text-center text-sm font-medium">{set.weight}</span>
                      <button
                        onClick={() => updateSet(exercise.id, set.id, 'weight', set.weight + 2.5)}
                        className="w-7 h-7 bg-gray-700 rounded-lg text-white text-lg leading-none flex items-center justify-center"
                      >+</button>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      {exercise.sets.length > 1 && (
                        <button onClick={() => removeSet(exercise.id, set.id)} className="text-gray-600 hover:text-red-400">
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => addSet(exercise.id)}
                className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 mt-1"
              >
                <PlusIcon /> Add Set
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={addExercise}
        className="w-full border-2 border-dashed border-gray-700 text-gray-500 py-3 rounded-xl text-sm hover:border-emerald-600 hover:text-emerald-400 flex items-center justify-center gap-2"
      >
        <PlusIcon /> Add Exercise
      </button>

      <button
        onClick={handleSave}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl text-sm shadow-lg mt-2"
      >
        Save Workout
      </button>
    </div>
  );
}
