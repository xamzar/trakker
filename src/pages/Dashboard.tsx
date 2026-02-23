import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getActivePlan, getLastSetsForExercise, getSessions, getTodayDayIndex } from '../storage';
import type { PlanDay, WorkoutPlan, WorkoutSession } from '../types';
import { v4 as uuidv4 } from 'uuid';

function DayTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    rest: 'bg-gray-700 text-gray-300',
    upper: 'bg-blue-900 text-blue-300',
    lower: 'bg-purple-900 text-purple-300',
    push: 'bg-orange-900 text-orange-300',
    pull: 'bg-yellow-900 text-yellow-300',
    full: 'bg-emerald-900 text-emerald-300',
    cardio: 'bg-red-900 text-red-300',
    custom: 'bg-pink-900 text-pink-300',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${colors[type] ?? colors.custom}`}>
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
    <div className="p-4 space-y-6">
      {/* Today's plan card */}
      {plan && todayDay ? (
        <div className={`rounded-2xl p-5 shadow-lg ${todayDay.type === 'rest' ? 'bg-gradient-to-br from-gray-700 to-gray-800' : 'bg-gradient-to-br from-emerald-600 to-emerald-800'}`}>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-emerald-100 text-sm font-medium">{plan.name}</p>
            <DayTypeBadge type={todayDay.type} />
          </div>
          <h2 className="text-2xl font-bold text-white">{todayDay.label}</h2>
          {todayDay.type === 'rest' ? (
            <p className="mt-2 text-sm text-gray-300">Rest day – recovery is part of training 💤</p>
          ) : (
            <>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {todayDay.exercises.map(ex => (
                  <span key={ex.id} className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                    {ex.name}
                  </span>
                ))}
                {todayDay.exercises.length === 0 && (
                  <span className="text-xs text-emerald-200">No exercises configured yet</span>
                )}
              </div>
              {todayDay.exercises.length > 0 && (
                <button
                  onClick={startPlannedWorkout}
                  className="mt-4 inline-block bg-white text-emerald-700 font-semibold px-5 py-2 rounded-xl text-sm shadow"
                >
                  Start Workout →
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-emerald-100 text-sm font-medium">Welcome back!</p>
          <h2 className="text-2xl font-bold mt-1">Ready to train?</h2>
          <div className="mt-4 flex gap-3">
            <Link
              to="/log"
              className="inline-block bg-white text-emerald-700 font-semibold px-5 py-2 rounded-xl text-sm shadow"
            >
              + Log Workout
            </Link>
            <Link
              to="/plan"
              className="inline-block bg-emerald-700 text-white font-semibold px-5 py-2 rounded-xl text-sm shadow border border-white/30"
            >
              Set up Program
            </Link>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Recent Workouts</h3>
        {sessions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-4xl mb-2">🏃</p>
            <p>No workouts yet. Start logging!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(session => (
              <div key={session.id} className="bg-gray-800 rounded-xl p-4 shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-white">{session.name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                  </div>
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                    {session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {session.exercises.slice(0, 3).map(ex => (
                    <span key={ex.id} className="text-xs bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded-full">{ex.name}</span>
                  ))}
                  {session.exercises.length > 3 && (
                    <span className="text-xs text-gray-500">+{session.exercises.length - 3} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {sessions.length > 0 && (
        <Link to="/history" className="block text-center text-emerald-400 text-sm">
          View all workouts →
        </Link>
      )}
    </div>
  );
}
