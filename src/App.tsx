import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import Dashboard from './pages/Dashboard';
import LogWorkout from './pages/LogWorkout';
import History from './pages/History';
import Progress from './pages/Progress';
import Plan from './pages/Plan';
import { HomeIcon, PlusCircleIcon, ClockIcon, ChartBarIcon, CalendarIcon } from './components/Icons';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Home', icon: <HomeIcon />, end: true },
  { to: '/log', label: 'Log', icon: <PlusCircleIcon /> },
  { to: '/plan', label: 'Program', icon: <CalendarIcon /> },
  { to: '/history', label: 'History', icon: <ClockIcon /> },
  { to: '/progress', label: 'Progress', icon: <ChartBarIcon /> },
];

function navClassName(isActive: boolean): string {
  return `flex flex-col items-center text-xs gap-0.5 px-3 py-1 rounded-lg ${isActive ? 'text-emerald-400' : 'text-gray-500'}`;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-gray-950 text-white max-w-md mx-auto">
        <header className="bg-gray-900 px-4 py-3 shadow-lg">
          <h1 className="text-xl font-bold text-emerald-400">🏋️ Trakker</h1>
        </header>
        <main className="flex-1 overflow-y-auto pb-20">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/log" element={<LogWorkout />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/history" element={<History />} />
            <Route path="/progress" element={<Progress />} />
          </Routes>
        </main>
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-gray-900 border-t border-gray-800 flex justify-around py-2 z-10">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => navClassName(isActive)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </BrowserRouter>
  );
}
