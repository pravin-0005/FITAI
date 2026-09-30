import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Flame, 
  Dumbbell, 
  Clock, 
  Trophy, 
  Target, 
  Sparkles, 
  ArrowRight, 
  Play, 
  TrendingUp, 
  CheckCircle2,
  Zap,
  Bot
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const { stats, goals, plans, insights, navigateTo } = useApp();

  const activeGoal = goals && goals.length > 0 ? goals[0] : null;
  const featuredPlan = plans && plans.length > 0 ? plans[0] : null;

  // Mock weekly activity data for Recharts
  const weeklyData = [
    { day: 'Mon', minutes: 45, workouts: 1 },
    { day: 'Tue', minutes: 55, workouts: 1 },
    { day: 'Wed', minutes: 0, workouts: 0 },
    { day: 'Thu', minutes: 50, workouts: 1 },
    { day: 'Fri', minutes: 60, workouts: 1 },
    { day: 'Sat', minutes: 40, workouts: 1 },
    { day: 'Sun', minutes: 0, workouts: 0 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 relative overflow-hidden bg-gradient-to-r from-slate-900/90 via-slate-900/40 to-slate-950/90">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Adaptive AI Protocol Active</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
            Ready for today's <span className="gradient-text-cyan">Overload Session</span>?
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Your workout trajectory is up <span className="text-emerald-400 font-semibold">+12% this week</span>. 
            The AI Coach recommends focusing on upper body pushing volume today.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigateTo('daily-logging', { planId: featuredPlan?.id })}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-dark-950 font-extrabold text-xs tracking-wide uppercase flex items-center space-x-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-dark-950" />
              <span>Start Workout Now</span>
            </button>

            <button
              onClick={() => navigateTo('ai-coach')}
              className="px-5 py-3 rounded-2xl glass-card hover:bg-slate-800 text-white font-semibold text-xs flex items-center space-x-2 border border-slate-700 transition-all"
            >
              <Bot className="w-4 h-4 text-purple-400" />
              <span>Consult AI Coach</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Streak */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Workout Streak</p>
            <h3 className="text-2xl font-extrabold text-white mt-1 font-display">
              {stats?.current_streak || 4} <span className="text-sm font-semibold text-slate-400">days</span>
            </h3>
            <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Best: {stats?.longest_streak || 7} days
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Flame className="w-6 h-6 fill-amber-400/20" />
          </div>
        </div>

        {/* Metric 2: Total Completed Workouts */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Completed Sessions</p>
            <h3 className="text-2xl font-extrabold text-white mt-1 font-display">
              {stats?.completed_workouts || 12} <span className="text-sm font-semibold text-slate-400">total</span>
            </h3>
            <p className="text-[11px] text-cyan-400 font-medium mt-1">
              {stats?.this_week_workouts || 3} sessions this week
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Dumbbell className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Avg Duration */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Session Time</p>
            <h3 className="text-2xl font-extrabold text-white mt-1 font-display">
              {stats?.avg_duration_minutes || 51} <span className="text-sm font-semibold text-slate-400">mins</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Optimal rest ratio
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: AI Adherence Score */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">AI Adherence</p>
            <h3 className="text-2xl font-extrabold text-white mt-1 font-display">
              92<span className="text-sm font-semibold text-purple-400">%</span>
            </h3>
            <p className="text-[11px] text-purple-400 font-medium mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> High Consistency
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Trophy className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols wide on desktop): Routine & Active Goal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Recommended Routine Card */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-display">Today's Routine</h3>
                <p className="text-xs text-slate-400">Selected based on active workout plan</p>
              </div>
              <button
                onClick={() => navigateTo('workout-plans')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                View All Plans <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {featuredPlan ? (
              <div className="bg-dark-950/60 rounded-2xl p-5 border border-slate-800/80 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                      {featuredPlan.difficulty}
                    </span>
                    <h4 className="text-xl font-bold text-white mt-2 font-display">{featuredPlan.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{featuredPlan.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-3 py-1 rounded-lg inline-block">
                      {featuredPlan.exercises ? featuredPlan.exercises.length : 4} Exercises
                    </span>
                  </div>
                </div>

                {/* Exercise Pills Preview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {(featuredPlan.exercises || []).slice(0, 4).map((ex, idx) => (
                    <div key={idx} className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
                      <p className="text-xs font-semibold text-white truncate">{ex.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{ex.sets} sets x {ex.repetitions || '10'} reps</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" /> Est. ~45 mins
                  </span>
                  <button
                    onClick={() => navigateTo('daily-logging', { planId: featuredPlan.id })}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-dark-950" /> Log Session
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                <Dumbbell className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-sm font-medium">No active workout plan found.</p>
                <button
                  onClick={() => navigateTo('ai-coach')}
                  className="mt-3 px-4 py-2 rounded-xl bg-cyan-500 text-dark-950 font-bold text-xs"
                >
                  Generate Plan with AI
                </button>
              </div>
            )}
          </div>

          {/* Active Goal Widget */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">Active Priority Goal</h3>
                  <p className="text-xs text-slate-400">Target trajectory & current progress</p>
                </div>
              </div>
              <button
                onClick={() => navigateTo('goals')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                Manage Goals →
              </button>
            </div>

            {activeGoal ? (
              <div className="bg-dark-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-white font-bold">{activeGoal.title}</span>
                  <span className="text-emerald-400">
                    {activeGoal.current_value} / {activeGoal.target_value} {activeGoal.unit}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${Math.min(100, Math.round((activeGoal.current_value / (activeGoal.target_value || 1)) * 100))}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Target Deadline: {activeGoal.deadline || '2026-11-15'}</span>
                  <span className="text-emerald-400 font-semibold">
                    {Math.round((activeGoal.current_value / (activeGoal.target_value || 1)) * 100)}% Complete
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="text-xs text-slate-400">No active goals configured.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recharts Activity & AI Insight Card */}
        <div className="space-y-6">
          {/* Recharts Weekly Volume Chart */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-display">Weekly Activity</h3>
                <p className="text-xs text-slate-400">Workout duration in minutes</p>
              </div>
              <span className="text-xs text-cyan-400 font-semibold bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                245 mins
              </span>
            </div>

            <div className="h-48 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFF' }}
                    labelStyle={{ color: '#06B6D4', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                    {weeklyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.minutes > 0 ? '#06B6D4' : '#1E293B'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Coach Daily Highlight */}
          <div className="glass-card p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-950/20 to-dark-950/60 relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">AI Insight</span>
              </div>
              <span className="text-[10px] text-slate-400">Updated today</span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              "{insights?.summary || "Your overall workout adherence is exceptional. Progressive overload parameters indicate high readiness for chest pushing load increment."}"
            </p>

            <button
              onClick={() => navigateTo('ai-coach')}
              className="w-full py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Open AI Coach Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
