import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getExerciseNames, getSessions } from '../storage';
import type { WorkoutSession } from '../types';
import { formatShortWorkoutDate } from '../utils/date';

interface DataPoint {
  date: string;
  maxWeight: number;
  totalVolume: number;
}

function getProgressData(sessions: WorkoutSession[], exerciseName: string): DataPoint[] {
  const normalizedExerciseName = exerciseName.toLowerCase();

  return sessions
    .filter(session => session.exercises.some(exercise => exercise.name.toLowerCase() === normalizedExerciseName))
    .map(s => {
      const exercises = s.exercises.filter(exercise => exercise.name.toLowerCase() === normalizedExerciseName);
      const allSets = exercises.flatMap(e => e.sets);
      const maxWeight = Math.max(...allSets.map(s => s.weight));
      const totalVolume = allSets.reduce((sum, s) => sum + s.reps * s.weight, 0);
      return {
        date: formatShortWorkoutDate(s.date),
        maxWeight,
        totalVolume,
      };
    })
    .reverse();
}

export default function Progress() {
  const [exerciseNames] = useState<string[]>(() => getExerciseNames());
  const [selectedExercise, setSelectedExercise] = useState<string>(() => {
    const names = getExerciseNames();
    return names[0] ?? '';
  });
  const [sessions] = useState<WorkoutSession[]>(() => getSessions());
  const [metric, setMetric] = useState<'maxWeight' | 'totalVolume'>('maxWeight');

  const data = selectedExercise ? getProgressData(sessions, selectedExercise) : [];

  if (exerciseNames.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p className="text-4xl mb-2">📈</p>
        <p>Log workouts to see progress!</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-white">Progress</h2>

      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider">Exercise</label>
        <select
          value={selectedExercise}
          onChange={e => setSelectedExercise(e.target.value)}
          className="mt-1 w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm border border-gray-700 focus:outline-none focus:border-emerald-500"
        >
          {exerciseNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setMetric('maxWeight')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold ${metric === 'maxWeight' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'}`}
        >
          Max Weight (kg)
        </button>
        <button
          onClick={() => setMetric('totalVolume')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold ${metric === 'totalVolume' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'}`}
        >
          Total Volume (kg)
        </button>
      </div>

      {data.length < 2 ? (
        <div className="bg-gray-800 rounded-xl p-6 text-center text-gray-500">
          <p>Not enough data yet.</p>
          <p className="text-xs mt-1">Log this exercise at least twice to see a chart.</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl p-4">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#F9FAFB' }}
                itemStyle={{ color: '#34D399' }}
              />
              <Line type="monotone" dataKey={metric} stroke="#34D399" strokeWidth={2} dot={{ fill: '#34D399', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-400">Personal Best</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">{Math.max(...data.map(d => d.maxWeight))} kg</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-400">Sessions</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">{data.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}
