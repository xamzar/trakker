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
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p className="text-4xl mb-2">📋</p>
        <p>No workout history yet.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-lg font-bold text-white mb-4">Workout History</h2>
      {sessions.map(session => (
        <div key={session.id} className="bg-gray-800 rounded-xl overflow-hidden shadow">
          <div
            className="flex items-center justify-between p-4 cursor-pointer"
            onClick={() => setExpanded(expanded === session.id ? null : session.id)}
          >
            <div>
              <p className="font-semibold text-white">{session.name}</p>
              <p className="text-gray-400 text-xs mt-0.5">
                {formatWorkoutDate(session.date)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{session.exercises.length} ex.</span>
              <button onClick={e => { e.stopPropagation(); handleDelete(session.id); }} className="text-red-500 p-1.5 hover:bg-gray-700 rounded-lg">
                <TrashIcon />
              </button>
              <span className="text-gray-500 text-sm">{expanded === session.id ? '▲' : '▼'}</span>
            </div>
          </div>

          {expanded === session.id && (
            <div className="border-t border-gray-700 px-4 pb-4 pt-3 space-y-3">
              {session.exercises.map(ex => (
                <div key={ex.id}>
                  <p className="text-sm font-semibold text-emerald-300">{ex.name}</p>
                  <div className="mt-1 space-y-1">
                    {ex.sets.map((set, i) => (
                      <div key={set.id} className="flex text-xs text-gray-400 gap-4">
                        <span className="text-gray-600">Set {i + 1}</span>
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
