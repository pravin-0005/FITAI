import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Dumbbell, 
  PlusCircle, 
  ClipboardList, 
  Target, 
  TrendingUp, 
  Bot, 
  Flame, 
  CheckCircle2, 
  Activity,
  Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, navigateTo, stats, connectionStatus, toggleMockMode } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'workout-plans', label: 'Workout Plans', icon: Dumbbell, badge: null },
    { id: 'create-plan', label: 'Create Plan', icon: PlusCircle, badge: null },
    { id: 'daily-logging', label: 'Log Workout', icon: ClipboardList, badge: 'Live' },
    { id: 'goals', label: 'Goals', icon: Target, badge: null },
    { id: 'progress', label: 'Progress & Reports', icon: TrendingUp, badge: null },
    { id: 'ai-coach', label: 'AI Coach', icon: Bot, badge: 'AI', highlight: true },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Flame className="w-6 h-6 text-dark-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white font-display">FIT</span>
                <span className="font-black text-xl tracking-tight gradient-text-cyan">AI</span>
              </div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Adaptive Coach</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Core App
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-emerald-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`} />
                  <span className={isActive ? 'font-semibold text-white' : ''}>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.highlight
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-xs animate-pulse-glow'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Stats & Mode Indicator */}
      <div className="p-4 space-y-3 border-t border-slate-800/80 bg-dark-950/40">
        {/* Quick Streak Widget */}
        <div className="glass-card p-3 rounded-xl flex items-center justify-between border border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-amber-400/20" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400">Current Streak</p>
              <p className="text-sm font-bold text-white">{stats?.current_streak || 4} Days</p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            Active
          </span>
        </div>

        {/* System Engine Mode Switcher */}
        <div className="flex items-center justify-between px-1 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${connectionStatus.online ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
            <span className="text-[11px] text-slate-400 font-medium">
              {connectionStatus.online ? 'FastAPI Connected' : 'Offline Mock Engine'}
            </span>
          </div>

          <button
            onClick={() => toggleMockMode(connectionStatus.online)}
            className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-medium"
            title="Toggle between FastAPI Backend and Local Storage Mock Engine"
          >
            {connectionStatus.online ? 'Use Mock' : 'Check API'}
          </button>
        </div>
      </div>
    </aside>
  );
}
