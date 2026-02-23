import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSessions } from '../storage';
import type { WorkoutSession } from '../types';

export default function Dashboard() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  useEffect(() => {
    setSessions(getSessions().slice(0, 5));
  }, []);

  return (
    <div className="p-4 space-y-6">
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-5 text-white shadow-lg">
        <p className="text-emerald-100 text-sm font-medium">Welcome back!</p>
        <h2 className="text-2xl font-bold mt-1">Ready to train?</h2>
        <Link
          to="/log"
          className="mt-4 inline-block bg-white text-emerald-700 font-semibold px-5 py-2 rounded-xl text-sm shadow"
        >
          + Log Workout
        </Link>
      </div>

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
