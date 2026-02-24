import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getActivePlan, getLastSetsForExercise, getSessions, getTodayDayIndex } from '../storage';
import type { PlanDay, WorkoutPlan, WorkoutSession } from '../types';
import { v4 as uuidv4 } from 'uuid';

function DayTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    rest: 'border-slate-700 text-slate-400',
    upper: 'border-blue-400/40 text-blue-200',
    lower: 'border-purple-400/40 text-purple-200',
    push: 'border-orange-400/40 text-orange-200',
    pull: 'border-amber-400/40 text-amber-200',
    full: 'border-emerald-400/40 text-emerald-200',
    cardio: 'border-rose-400/40 text-rose-200',
    custom: 'border-pink-400/40 text-pink-200',
  };
  return (
    <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium border capitalize ${colors[type] ?? colors.custom}`}>
      {type}
    </span>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [todayDay, setTodayDay] = useState<PlanDay | null>(null);

  useEffect(() => {
    setSessions(getSessions().slice(0, 5));
    const activePlan = getActivePlan();
    if (activePlan) {
      setPlan(activePlan);
      const idx = getTodayDayIndex(activePlan);
      setTodayDay(activePlan.days[idx] ?? null);
    }
  }, []);

  function startPlannedWorkout() {
    if (!todayDay || !plan) return;
    const exercises = todayDay.exercises.map(pe => {
      const lastSets = getLastSetsForExercise(pe.name);
      const sets = Array.from({ length: pe.defaultSets }, (_, i) => {
        const historical = lastSets?.[i];
        return {
          id: uuidv4(),
          reps: historical?.reps ?? pe.defaultReps,
          weight: historical?.weight ?? 0,
        };
      });
      return { id: uuidv4(), name: pe.name, sets };
    });
    navigate('/log', { state: { workoutName: todayDay.label, exercises } });
  }

  return (
    <div className="p-1 space-y-6">
      {/* Today's plan card */}
      {plan && todayDay ? (
        <div className="rounded-2xl p-5 border border-slate-800 bg-slate-900/70 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs uppercase tracking-[0.15em] text-slate-500">{plan.name}</p>
              <h2 className="text-2xl font-semibold text-white">{todayDay.label}</h2>
            </div>
            <DayTypeBadge type={todayDay.type} />
          </div>
          {todayDay.type === 'rest' ? (
            <p className="text-sm text-slate-400">Rest day. Recovery is part of the plan.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5">
                {todayDay.exercises.map(ex => (
                  <span key={ex.id} className="text-[11px] bg-slate-800 text-slate-200 px-2.5 py-1 rounded-full border border-slate-700">
                    {ex.name}
                  </span>
                ))}
                {todayDay.exercises.length === 0 && (
                  <span className="text-xs text-slate-500">No exercises configured yet</span>
                )}
              </div>
              {todayDay.exercises.length > 0 && (
                <button
                  onClick={startPlannedWorkout}
                  className="inline-flex items-center gap-1 mt-3 rounded-xl border border-emerald-500/40 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/10"
                >
                  Start Workout →
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="rounded-2xl p-5 border border-slate-800 bg-slate-900/70 text-white space-y-3">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Welcome back</p>
          <h2 className="text-2xl font-semibold mt-1">Ready to train?</h2>
          <div className="flex gap-2">
            <Link
              to="/log"
              className="inline-flex flex-1 items-center justify-center border border-emerald-500/40 text-emerald-200 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-emerald-500/10"
            >
              + Log Workout
            </Link>
            <Link
              to="/plan"
              className="inline-flex flex-1 items-center justify-center border border-slate-700 text-slate-200 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-slate-800/70"
            >
              Set up Program
            </Link>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-slate-500 text-[11px] font-semibold uppercase tracking-[0.18em] mb-3">Recent Workouts</h3>
        {sessions.length === 0 ? (
          <div className="text-center py-10 text-slate-600 border border-dashed border-slate-800 rounded-2xl">
            <p className="text-3xl mb-2">🏃</p>
            <p className="text-sm">No workouts yet. Start logging!</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sessions.map(session => (
              <div key={session.id} className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="font-semibold text-white">{session.name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                  </div>
                  <span className="text-[11px] border border-slate-700 text-slate-300 px-2.5 py-1 rounded-full">
                    {session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {session.exercises.slice(0, 3).map(ex => (
                    <span key={ex.id} className="text-[11px] bg-slate-800 text-slate-200 px-2.5 py-1 rounded-full border border-slate-700">{ex.name}</span>
                  ))}
                  {session.exercises.length > 3 && (
                    <span className="text-xs text-slate-500">+{session.exercises.length - 3} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {sessions.length > 0 && (
        <Link to="/history" className="block text-center text-emerald-300 text-sm">
          View all workouts →
        </Link>
      )}
    </div>
  );
}
