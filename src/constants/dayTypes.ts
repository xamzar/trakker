import type { DayType } from '../types';

export interface DayTypeOption {
  value: DayType;
  label: string;
  color: string;
}

export const DAY_TYPES: DayTypeOption[] = [
  { value: 'rest', label: 'Rest', color: 'bg-gray-700 text-gray-300' },
  { value: 'upper', label: 'Upper', color: 'bg-blue-900 text-blue-300' },
  { value: 'lower', label: 'Lower', color: 'bg-purple-900 text-purple-300' },
  { value: 'push', label: 'Push', color: 'bg-orange-900 text-orange-300' },
  { value: 'pull', label: 'Pull', color: 'bg-yellow-900 text-yellow-300' },
  { value: 'full', label: 'Full Body', color: 'bg-emerald-900 text-emerald-300' },
  { value: 'cardio', label: 'Cardio', color: 'bg-red-900 text-red-300' },
  { value: 'custom', label: 'Custom', color: 'bg-pink-900 text-pink-300' },
];

export function getDayTypeInfo(type: DayType): DayTypeOption {
  return DAY_TYPES.find(dayType => dayType.value === type) ?? DAY_TYPES[0];
}
