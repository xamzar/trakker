import { useEffect, useState } from 'react';
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
  const [guidedExerciseIndex, setGuidedExerciseIndex] = useState(0);
  const [guidedSetIndex, setGuidedSetIndex] = useState(0);
  const [nextNamedIndex, setNextNamedIndex] = useState<number | null>(null);
  const weightUnit = 'kg';

  useEffect(() => {
    if (exercises.length === 0) {
      setGuidedExerciseIndex(0);
      setGuidedSetIndex(0);
      return;
    }
    if (guidedExerciseIndex > exercises.length - 1) {
      setGuidedExerciseIndex(exercises.length - 1);
      const lastSets = exercises[exercises.length - 1]?.sets.length ?? 1;
      setGuidedSetIndex(Math.max(lastSets - 1, 0));
      return;
    }
    const active = exercises[guidedExerciseIndex];
    setGuidedSetIndex(prev => Math.min(prev, Math.max(active.sets.length - 1, 0)));
    if (!active.name.trim()) {
      const fallback = exercises.findIndex(e => e.name.trim());
      if (fallback !== -1 && fallback !== guidedExerciseIndex) {
        setGuidedExerciseIndex(fallback);
        setGuidedSetIndex(0);
      }
    }
    if (guidedExerciseIndex >= exercises.length - 1) {
      setNextNamedIndex(null);
    } else {
      let found: number | null = null;
      for (let i = guidedExerciseIndex + 1; i < exercises.length; i += 1) {
        if (exercises[i].name.trim()) {
          found = i;
          break;
        }
      }
      setNextNamedIndex(found);
    }
  }, [exercises, guidedExerciseIndex]);

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

  function getBaseWeight(exercise: Exercise | undefined, setIndex: number) {
    if (!exercise) return { weight: 0, hasHistory: false };
    const lastSets = exercise.name.trim() ? getLastSetsForExercise(exercise.name.trim()) : null;
    const historyEntry = lastSets && setIndex < lastSets.length ? lastSets[setIndex] : null;
    const historyWeight = historyEntry?.weight;
    const fallback = exercise.sets[setIndex]?.weight ?? 0;
    return {
      weight: Math.max(0, historyWeight ?? fallback),
      hasHistory: historyEntry?.weight !== undefined && historyEntry?.weight !== null,
    };
  }

  function applySuggestedWeight(delta: number) {
    const exercise = exercises[guidedExerciseIndex];
    if (!exercise || !exercise.name.trim()) return;
    const set = exercise.sets[guidedSetIndex];
    if (!set) return;
    const base = getBaseWeight(exercise, guidedSetIndex).weight;
    const nextWeight = Math.max(0, base + delta);
    updateSet(exercise.id, set.id, 'weight', nextWeight);
  }

  function advanceGuidedPointer() {
    const exercise = exercises[guidedExerciseIndex];
    if (!exercise) return;
    if (guidedSetIndex < exercise.sets.length - 1) {
      setGuidedSetIndex(prev => prev + 1);
      return;
    }
    if (guidedExerciseIndex + 1 < exercises.length) {
      setGuidedExerciseIndex(prev => prev + 1);
      setGuidedSetIndex(0);
    }
  }

  const guidedExercise = exercises[guidedExerciseIndex];
  const guidedWeightInfo = getBaseWeight(guidedExercise, guidedSetIndex);
  const guidedBaseWeight = guidedWeightInfo.weight;
  const nextNamedExercise = nextNamedIndex !== null ? exercises[nextNamedIndex] : undefined;

  /** Returns a hint string like "Last: 3×80 kg" for the most-recent sets of this exercise */
  function weightHint(exerciseName: string): string | null {
    if (!exerciseName.trim()) return null;
    const last = getLastSetsForExercise(exerciseName.trim());
    if (!last || last.length === 0) return null;
    const topWeight = Math.max(...last.map(s => s.weight));
    return `Last: ${last.length}×${topWeight} kg`;
  }

  return (
    <div className="p-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Log Workout</h2>
        <span className="text-[11px] text-slate-500">Guided + manual</span>
      </div>

      <div>
        <label className="text-[11px] text-slate-500 uppercase tracking-[0.18em]">Workout Name</label>
        <input
          type="text"
          placeholder="e.g. Push Day, Leg Day..."
          value={workoutName}
          onChange={e => setWorkoutName(e.target.value)}
          className="mt-1 w-full bg-slate-900/60 text-white rounded-xl px-4 py-3 text-sm border border-slate-800 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {guidedExercise ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-300">Proactive guidance</p>
              <p className="text-sm font-semibold text-white">
                {guidedExercise.name || 'Name this exercise'}
              </p>
              <p className="text-xs text-slate-400">
                Set {guidedSetIndex + 1} of {guidedExercise.sets.length}
              </p>
            </div>
            {nextNamedExercise && (
              <span className="text-[11px] text-slate-400">Next: {nextNamedExercise.name}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Suggestion</span>
            <span className="text-sm font-semibold text-white">{guidedBaseWeight} {weightUnit}</span>
            {guidedWeightInfo.hasHistory && (
              <span className="text-[11px] text-slate-500">(last set)</span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => applySuggestedWeight(0)}
              aria-label={`Keep weight at ${guidedBaseWeight} ${weightUnit}`}
              className="rounded-lg border border-emerald-500/40 bg-slate-900/60 text-sm text-white py-2"
            >
              Same
            </button>
            <button
              onClick={() => applySuggestedWeight(2.5)}
              aria-label={`Increase weight by 2.5 ${weightUnit}`}
              className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-sm text-emerald-200 py-2"
            >
              +2.5 {weightUnit}
            </button>
            <button
              onClick={() => applySuggestedWeight(-2.5)}
              aria-label={`Decrease weight by 2.5 ${weightUnit}`}
              className="rounded-lg border border-slate-800 bg-slate-900/60 text-sm text-white py-2"
            >
              -2.5 {weightUnit}
            </button>
          </div>
          <button
            onClick={advanceGuidedPointer}
            aria-label="Advance to next set or exercise"
            className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-sm text-emerald-200 py-2"
          >
            Next set / exercise →
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-800 p-4 text-sm text-slate-500">
          Add an exercise name to get proactive weight suggestions.
        </div>
      )}

      <div className="space-y-4">
        {exercises.map((exercise, exIdx) => {
          const hint = weightHint(exercise.name);
          return (
            <div key={exercise.id} className="bg-slate-900/60 rounded-xl p-4 space-y-3 border border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={`Exercise ${exIdx + 1} name`}
                    value={exercise.name}
                    onChange={e => updateExerciseName(exercise.id, e.target.value)}
                    className="w-full bg-slate-900/60 text-white rounded-lg px-3 py-2 text-sm border border-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                  {hint && (
                    <p className="text-[11px] text-emerald-300 mt-0.5 pl-1">{hint}</p>
                  )}
                </div>
                <button onClick={() => removeExercise(exercise.id)} className="text-slate-500 hover:text-red-400 p-1.5 hover:bg-slate-900/60 rounded-lg self-start">
                  <TrashIcon />
                </button>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-12 text-[11px] text-slate-500 font-medium px-1">
                  <span className="col-span-2">Set</span>
                  <span className="col-span-5 text-center">Reps</span>
                  <span className="col-span-5 text-center">Weight (kg)</span>
                </div>
                {exercise.sets.map((set, setIdx) => (
                  <div key={set.id} className="grid grid-cols-12 items-center gap-1">
                    <span className="col-span-2 text-xs text-slate-500 text-center">{setIdx + 1}</span>
                    <div className="col-span-5 flex items-center justify-center gap-1">
                      <button
                        onClick={() => updateSet(exercise.id, set.id, 'reps', Math.max(1, set.reps - 1))}
                        className="w-8 h-8 bg-slate-900/60 border border-slate-800 rounded-lg text-white text-lg leading-none flex items-center justify-center"
                      >−</button>
                      <span className="w-8 text-center text-sm font-medium text-white">{set.reps}</span>
                      <button
                        onClick={() => updateSet(exercise.id, set.id, 'reps', set.reps + 1)}
                        className="w-8 h-8 bg-slate-900/60 border border-slate-800 rounded-lg text-white text-lg leading-none flex items-center justify-center"
                      >+</button>
                    </div>
                    <div className="col-span-4 flex items-center justify-center gap-1">
                      <button
                        onClick={() => updateSet(exercise.id, set.id, 'weight', Math.max(0, set.weight - 2.5))}
                        className="w-8 h-8 bg-slate-900/60 border border-slate-800 rounded-lg text-white text-lg leading-none flex items-center justify-center"
                      >−</button>
                      <span className="w-12 text-center text-sm font-medium text-white">{set.weight}</span>
                      <button
                        onClick={() => updateSet(exercise.id, set.id, 'weight', set.weight + 2.5)}
                        className="w-8 h-8 bg-slate-900/60 border border-slate-800 rounded-lg text-white text-lg leading-none flex items-center justify-center"
                      >+</button>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      {exercise.sets.length > 1 && (
                        <button onClick={() => removeSet(exercise.id, set.id)} className="text-slate-600 hover:text-red-400">
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => addSet(exercise.id)}
                className="flex items-center gap-1 text-xs text-emerald-300 hover:text-emerald-200 mt-1"
              >
                <PlusIcon /> Add Set
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={addExercise}
        className="w-full border-2 border-dashed border-slate-800 text-slate-500 py-3 rounded-xl text-sm hover:border-emerald-500/60 hover:text-emerald-300 flex items-center justify-center gap-2"
      >
        <PlusIcon /> Add Exercise
      </button>

      <button
        onClick={handleSave}
        className="w-full bg-emerald-500 text-slate-950 font-semibold py-3 rounded-xl text-sm hover:bg-emerald-400 mt-2"
      >
        Save Workout
      </button>
    </div>
  );
}
