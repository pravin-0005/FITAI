import React from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Bot, Calendar, Sparkles, RefreshCw } from 'lucide-react';

const PAGE_TITLES = {
  'dashboard': { title: 'Dashboard', subtitle: 'Overview of your fitness metrics & today\'s routine' },
  'workout-plans': { title: 'Workout Plans', subtitle: 'Explore and manage your training routines' },
  'create-plan': { title: 'Create Workout Plan', subtitle: 'Design a customized progressive overload program' },
  'daily-logging': { title: 'Daily Workout Logging', subtitle: 'Track set completions, reps, and workout duration' },
  'goals': { title: 'Fitness Goals', subtitle: 'Monitor targets, progress velocity, and milestones' },
  'progress': { title: 'Progress & Reports', subtitle: 'Analytics, volume trends, and exercise performance history' },
  'ai-coach': { title: 'AI Adaptive Coach', subtitle: 'Personalized plan generation, insights & workout adaptations' },
};

export default function Header() {
  const { activeTab, navigateTo, refreshData, loading } = useApp();
  const pageInfo = PAGE_TITLES[activeTab] || { title: 'FITAI', subtitle: 'Adaptive Fitness Coach' };

  const todayStr = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    year: 'numeric' 
  });

  return (
    <header className="glass-panel border-b border-slate-800/80 px-8 py-5 sticky top-0 z-20 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight font-display flex items-center gap-2">
          {pageInfo.title}
          {activeTab === 'ai-coach' && (
            <span className="text-xs bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Powered by AI Core
            </span>
          )}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5 font-normal">{pageInfo.subtitle}</p>
      </div>

      <div className="flex items-center space-x-3">
        {/* Date Display */}
        <div className="hidden md:flex items-center space-x-2 text-xs font-medium text-slate-400 bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-800">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>{todayStr}</span>
        </div>

        {/* Sync Button */}
        <button
          onClick={refreshData}
          disabled={loading}
          className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>

        {/* Quick Log Action Button */}
        <button
          onClick={() => navigateTo('daily-logging')}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Log Session</span>
        </button>

        {/* Quick AI Generator Button */}
        <button
          onClick={() => navigateTo('ai-coach')}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-dark-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
        >
          <Bot className="w-4 h-4 stroke-[2.5]" />
          <span>AI Coach</span>
        </button>
      </div>
    </header>
  );
}
