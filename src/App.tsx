import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LogWorkout from './pages/LogWorkout';
import History from './pages/History';
import Progress from './pages/Progress';
import Plan from './pages/Plan';
import { HomeIcon, PlusCircleIcon, ClockIcon, ChartBarIcon, CalendarIcon } from './components/Icons';

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
          <NavLink to="/" end className={({isActive}) => `flex flex-col items-center text-xs gap-0.5 px-3 py-1 rounded-lg ${isActive ? 'text-emerald-400' : 'text-gray-500'}`}>
            <HomeIcon />
            <span>Home</span>
          </NavLink>
          <NavLink to="/log" className={({isActive}) => `flex flex-col items-center text-xs gap-0.5 px-3 py-1 rounded-lg ${isActive ? 'text-emerald-400' : 'text-gray-500'}`}>
            <PlusCircleIcon />
            <span>Log</span>
          </NavLink>
          <NavLink to="/plan" className={({isActive}) => `flex flex-col items-center text-xs gap-0.5 px-3 py-1 rounded-lg ${isActive ? 'text-emerald-400' : 'text-gray-500'}`}>
            <CalendarIcon />
            <span>Program</span>
          </NavLink>
          <NavLink to="/history" className={({isActive}) => `flex flex-col items-center text-xs gap-0.5 px-3 py-1 rounded-lg ${isActive ? 'text-emerald-400' : 'text-gray-500'}`}>
            <ClockIcon />
            <span>History</span>
          </NavLink>
          <NavLink to="/progress" className={({isActive}) => `flex flex-col items-center text-xs gap-0.5 px-3 py-1 rounded-lg ${isActive ? 'text-emerald-400' : 'text-gray-500'}`}>
            <ChartBarIcon />
            <span>Progress</span>
          </NavLink>
        </nav>
      </div>
    </BrowserRouter>
  );
}
