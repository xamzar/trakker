import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { DayType, PlanDay, PlanExercise, WorkoutPlan } from '../types';
import { clearActivePlan, getActivePlan, saveActivePlan } from '../storage';
import { PlusIcon, TrashIcon } from '../components/Icons';

const DAY_TYPES: { value: DayType; label: string; color: string }[] = [
  { value: 'rest',   label: 'Rest',       color: 'bg-gray-700 text-gray-300' },
  { value: 'upper',  label: 'Upper',      color: 'bg-blue-900 text-blue-300' },
  { value: 'lower',  label: 'Lower',      color: 'bg-purple-900 text-purple-300' },
  { value: 'push',   label: 'Push',       color: 'bg-orange-900 text-orange-300' },
  { value: 'pull',   label: 'Pull',       color: 'bg-yellow-900 text-yellow-300' },
  { value: 'full',   label: 'Full Body',  color: 'bg-emerald-900 text-emerald-300' },
  { value: 'cardio', label: 'Cardio',     color: 'bg-red-900 text-red-300' },
  { value: 'custom', label: 'Custom',     color: 'bg-pink-900 text-pink-300' },
];

const DAY_LABELS = ['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6','Day 7',
  'Day 8','Day 9','Day 10','Day 11','Day 12','Day 13','Day 14'];

function defaultPlanDays(n: number): PlanDay[] {
  return Array.from({ length: n }, (_, i) => ({
    dayIndex: i,
    type: 'rest' as DayType,
    label: DAY_LABELS[i] ?? `Day ${i + 1}`,
    exercises: [],
  }));
}

function typeInfo(type: DayType) {
  return DAY_TYPES.find(t => t.value === type) ?? DAY_TYPES[0];
}

export default function Plan() {
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  // editor state
  const [planName, setPlanName] = useState('My Program');
  const [periodDays, setPeriodDays] = useState(7);
  const [days, setDays] = useState<PlanDay[]>(defaultPlanDays(7));
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = getActivePlan();
    if (existing) {
      setPlan(existing);
      setPlanName(existing.name);
      setPeriodDays(existing.periodDays);
      setDays(existing.days);
    }
  }, []);

  function handlePeriodChange(n: number) {
    setPeriodDays(n);
    setDays(prev => {
      if (n > prev.length) {
        const extra = Array.from({ length: n - prev.length }, (_, i) => ({
          dayIndex: prev.length + i,
          type: 'rest' as DayType,
          label: DAY_LABELS[prev.length + i] ?? `Day ${prev.length + i + 1}`,
          exercises: [],
        }));
        return [...prev, ...extra];
      }
      return prev.slice(0, n);
    });
  }

  function setDayType(dayIndex: number, type: DayType) {
    setDays(prev => prev.map(d =>
      d.dayIndex === dayIndex
        ? { ...d, type, label: type === 'custom' ? d.label : typeInfo(type).label }
        : d
    ));
  }

  function setDayLabel(dayIndex: number, label: string) {
    setDays(prev => prev.map(d => d.dayIndex === dayIndex ? { ...d, label } : d));
  }

  function addExercise(dayIndex: number) {
    const ex: PlanExercise = { id: uuidv4(), name: '', defaultSets: 3, defaultReps: 10 };
    setDays(prev => prev.map(d =>
      d.dayIndex === dayIndex ? { ...d, exercises: [...d.exercises, ex] } : d
    ));
  }

  function removeExercise(dayIndex: number, exId: string) {
    setDays(prev => prev.map(d =>
      d.dayIndex === dayIndex ? { ...d, exercises: d.exercises.filter(e => e.id !== exId) } : d
    ));
  }

  function updateExercise(dayIndex: number, exId: string, field: keyof PlanExercise, value: string | number) {
    setDays(prev => prev.map(d =>
      d.dayIndex === dayIndex
        ? { ...d, exercises: d.exercises.map(e => e.id === exId ? { ...e, [field]: value } : e) }
        : d
    ));
  }

  function handleSave() {
    const newPlan: WorkoutPlan = {
      id: plan?.id ?? uuidv4(),
      name: planName.trim() || 'My Program',
      periodDays,
      startDate: plan?.startDate ?? new Date().toISOString().split('T')[0],
      days,
    };
    saveActivePlan(newPlan);
    setPlan(newPlan);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleClear() {
    if (!confirm('Remove the active program?')) return;
    clearActivePlan();
    setPlan(null);
    setPlanName('My Program');
    setPeriodDays(7);
    setDays(defaultPlanDays(7));
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Program Setup</h2>
        {plan && (
          <button onClick={handleClear} className="text-xs text-red-400 hover:text-red-300">
            Clear
          </button>
        )}
      </div>

      {/* Plan name */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider">Program Name</label>
        <input
          type="text"
          value={planName}
          onChange={e => setPlanName(e.target.value)}
          placeholder="e.g. PPL 6-Day"
          className="mt-1 w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm border border-gray-700 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Period length */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider">Cycle Length (days)</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {[3,4,5,6,7,10,14].map(n => (
            <button
              key={n}
              onClick={() => handlePeriodChange(n)}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${periodDays === n ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Day configuration */}
      <div className="space-y-2">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Configure Days</p>
        {days.map(day => {
          const info = typeInfo(day.type);
          const isExpanded = expandedDay === day.dayIndex;
          return (
            <div key={day.dayIndex} className="bg-gray-800 rounded-xl overflow-hidden">
              {/* Day header row */}
              <div
                className="flex items-center gap-3 p-3 cursor-pointer"
                onClick={() => setExpandedDay(isExpanded ? null : day.dayIndex)}
              >
                <span className="text-xs text-gray-500 w-10 shrink-0">
                  {DAY_LABELS[day.dayIndex] ?? `Day ${day.dayIndex + 1}`}
                </span>

                {/* Type selector */}
                <div className="flex-1 flex flex-wrap gap-1" onClick={e => e.stopPropagation()}>
                  <select
                    value={day.type}
                    onChange={e => setDayType(day.dayIndex, e.target.value as DayType)}
                    className="bg-gray-700 text-white rounded-lg px-2 py-1 text-xs border border-gray-600 focus:outline-none focus:border-emerald-500"
                  >
                    {DAY_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  {day.type !== 'rest' && (
                    <span className={`text-xs px-2 py-1 rounded-full ${info.color}`}>
                      {day.exercises.length} ex.
                    </span>
                  )}
                </div>
                {day.type !== 'rest' && (
                  <span className="text-gray-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                )}
              </div>

              {/* Expanded: custom label + exercises */}
              {isExpanded && day.type !== 'rest' && (
                <div className="border-t border-gray-700 px-3 pb-3 pt-2 space-y-3">
                  {/* Custom label */}
                  {day.type === 'custom' && (
                    <div>
                      <label className="text-xs text-gray-500">Day Label</label>
                      <input
                        type="text"
                        value={day.label}
                        onChange={e => setDayLabel(day.dayIndex, e.target.value)}
                        placeholder="e.g. Chest & Triceps"
                        className="mt-1 w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-xs border border-gray-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                  {/* Exercises */}
                  {day.exercises.map(ex => (
                    <div key={ex.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={ex.name}
                          onChange={e => updateExercise(day.dayIndex, ex.id, 'name', e.target.value)}
                          placeholder="Exercise name"
                          className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-xs border border-gray-600 focus:outline-none focus:border-emerald-500"
                        />
                        <button onClick={() => removeExercise(day.dayIndex, ex.id)} className="text-red-400 hover:text-red-300 p-1">
                          <TrashIcon />
                        </button>
                      </div>
                      <div className="flex gap-3 pl-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">Sets</span>
                          <button onClick={() => updateExercise(day.dayIndex, ex.id, 'defaultSets', Math.max(1, ex.defaultSets - 1))} className="w-6 h-6 bg-gray-700 rounded text-white text-sm flex items-center justify-center">−</button>
                          <span className="w-5 text-center text-xs font-medium text-white">{ex.defaultSets}</span>
                          <button onClick={() => updateExercise(day.dayIndex, ex.id, 'defaultSets', ex.defaultSets + 1)} className="w-6 h-6 bg-gray-700 rounded text-white text-sm flex items-center justify-center">+</button>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">Reps</span>
                          <button onClick={() => updateExercise(day.dayIndex, ex.id, 'defaultReps', Math.max(1, ex.defaultReps - 1))} className="w-6 h-6 bg-gray-700 rounded text-white text-sm flex items-center justify-center">−</button>
                          <span className="w-5 text-center text-xs font-medium text-white">{ex.defaultReps}</span>
                          <button onClick={() => updateExercise(day.dayIndex, ex.id, 'defaultReps', ex.defaultReps + 1)} className="w-6 h-6 bg-gray-700 rounded text-white text-sm flex items-center justify-center">+</button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => addExercise(day.dayIndex)}
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                  >
                    <PlusIcon /> Add Exercise
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        className={`w-full font-semibold py-3 rounded-xl text-sm shadow-lg transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
      >
        {saved ? '✓ Saved!' : 'Save Program'}
      </button>
    </div>
  );
}
