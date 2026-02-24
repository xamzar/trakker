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
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 max-w-md mx-auto">
        <header className="px-5 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Trakker</p>
              <h1 className="text-lg font-semibold text-white">Minimal training log</h1>
            </div>
            <span className="text-[11px] px-2 py-1 rounded-full border border-emerald-500/30 text-emerald-300">
              beta
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-4 pb-28 pt-2">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/log" element={<LogWorkout />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/history" element={<History />} />
            <Route path="/progress" element={<Progress />} />
          </Routes>
        </main>
        <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-md bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl flex justify-around py-2 z-10 shadow-xl shadow-black/30">
          <NavLink to="/" end className={({isActive}) => `flex flex-col items-center text-[11px] gap-0.5 px-3 py-2 rounded-xl transition-colors ${isActive ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30' : 'text-slate-500 border border-transparent'}`}>
            <HomeIcon />
            <span>Home</span>
          </NavLink>
          <NavLink to="/log" className={({isActive}) => `flex flex-col items-center text-[11px] gap-0.5 px-3 py-2 rounded-xl transition-colors ${isActive ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30' : 'text-slate-500 border border-transparent'}`}>
            <PlusCircleIcon />
            <span>Log</span>
          </NavLink>
          <NavLink to="/plan" className={({isActive}) => `flex flex-col items-center text-[11px] gap-0.5 px-3 py-2 rounded-xl transition-colors ${isActive ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30' : 'text-slate-500 border border-transparent'}`}>
            <CalendarIcon />
            <span>Program</span>
          </NavLink>
          <NavLink to="/history" className={({isActive}) => `flex flex-col items-center text-[11px] gap-0.5 px-3 py-2 rounded-xl transition-colors ${isActive ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30' : 'text-slate-500 border border-transparent'}`}>
            <ClockIcon />
            <span>History</span>
          </NavLink>
          <NavLink to="/progress" className={({isActive}) => `flex flex-col items-center text-[11px] gap-0.5 px-3 py-2 rounded-xl transition-colors ${isActive ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30' : 'text-slate-500 border border-transparent'}`}>
            <ChartBarIcon />
            <span>Progress</span>
          </NavLink>
        </nav>
      </div>
    </BrowserRouter>
  );
}
