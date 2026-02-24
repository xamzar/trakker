import { useState } from 'react';
import { deleteSession, getSessions } from '../storage';
import type { WorkoutSession } from '../types';
import { TrashIcon } from '../components/Icons';
import { formatWorkoutDate } from '../utils/date';

export default function History() {
  const [sessions, setSessions] = useState<WorkoutSession[]>(() => getSessions());
  const [expanded, setExpanded] = useState<string | null>(null);

  function handleDelete(id: string) {
    if (!confirm('Delete this workout?')) return;
    deleteSession(id);
    setSessions(prev => prev.filter(s => s.id !== id));
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-600">
        <p className="text-4xl mb-2">📋</p>
        <p className="text-sm">No workout history yet.</p>
      </div>
    );
  }

  return (
    <div className="p-1 space-y-3">
      <h2 className="text-lg font-semibold text-white mb-3">Workout History</h2>
      {sessions.map(session => (
        <div key={session.id} className="bg-slate-900/60 rounded-xl overflow-hidden border border-slate-800">
          <div
            className="flex items-center justify-between p-4 cursor-pointer"
            onClick={() => setExpanded(expanded === session.id ? null : session.id)}
          >
            <div>
              <p className="font-semibold text-white">{session.name}</p>
<<<<<<< HEAD
              <p className="text-gray-400 text-xs mt-0.5">
                {formatWorkoutDate(session.date)}
=======
              <p className="text-slate-500 text-xs mt-0.5">
                {new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
>>>>>>> 5d81881 (feat: refresh ui with minimal styling)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{session.exercises.length} ex.</span>
              <button onClick={e => { e.stopPropagation(); handleDelete(session.id); }} className="text-slate-500 p-1.5 hover:bg-slate-900/60 rounded-lg hover:text-red-400">
                <TrashIcon />
              </button>
              <span className="text-slate-600 text-sm">{expanded === session.id ? '▲' : '▼'}</span>
            </div>
          </div>

          {expanded === session.id && (
            <div className="border-t border-slate-800 px-4 pb-4 pt-3 space-y-3">
              {session.exercises.map(ex => (
                <div key={ex.id}>
                  <p className="text-sm font-semibold text-white">{ex.name}</p>
                  <div className="mt-1 space-y-1">
                    {ex.sets.map((set, i) => (
                      <div key={set.id} className="flex text-xs text-slate-400 gap-4">
                        <span className="text-slate-600">Set {i + 1}</span>
                        <span>{set.reps} reps</span>
                        <span>{set.weight} kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
