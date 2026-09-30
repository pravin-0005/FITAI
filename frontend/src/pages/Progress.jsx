import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fitaiApi } from '../services/api';
import { 
  TrendingUp, 
  Search, 
  Flame, 
  Calendar, 
  Award, 
  Clock, 
  Dumbbell,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
} from 'recharts';

export default function Progress() {
  const { stats } = useApp();

  const [weeklyBreakdown, setWeeklyBreakdown] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('Incline Dumbbell Press');
  const [exerciseHistory, setExerciseHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadProgressData();
  }, []);

  useEffect(() => {
    if (selectedExercise) {
      loadExerciseHistory(selectedExercise);
    }
  }, [selectedExercise]);

  const loadProgressData = async () => {
    try {
      const weekly = await fitaiApi.getWeeklyBreakdown(4);
      setWeeklyBreakdown(weekly || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadExerciseHistory = async (name) => {
    setLoadingHistory(true);
    try {
      const history = await fitaiApi.getExerciseHistory(name);
      setExerciseHistory(history || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Exercises Logged</p>
          <h3 className="text-2xl font-extrabold text-white mt-1 font-display">
            {stats?.total_exercises_logged || 48}
          </h3>
          <p className="text-[11px] text-cyan-400 font-medium mt-1">
            {stats?.total_workouts || 12} total sessions
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Adherence Rate</p>
          <h3 className="text-2xl font-extrabold text-emerald-400 mt-1 font-display">
            {stats?.total_workouts ? Math.round((stats.completed_workouts / stats.total_workouts) * 100) : 92}%
          </h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            {stats?.completed_workouts || 11} completed
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Best Streak</p>
          <h3 className="text-2xl font-extrabold text-amber-400 mt-1 font-display">
            {stats?.longest_streak || 7} <span className="text-xs text-slate-400">Days</span>
          </h3>
          <p className="text-[11px] text-amber-400/80 font-medium mt-1">
            Current: {stats?.current_streak || 4} days
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Session Time</p>
          <h3 className="text-2xl font-extrabold text-purple-400 mt-1 font-display">
            {stats?.avg_duration_minutes || 51.5} <span className="text-xs text-slate-400">Mins</span>
          </h3>
          <p className="text-[11px] text-purple-400/80 font-medium mt-1">
            Optimal stimulus window
          </p>
        </div>
      </div>

      {/* Recharts Section 1: Weekly Breakdown Bar Chart */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white font-display">4-Week Training Volume Trend</h3>
            <p className="text-xs text-slate-400">Workouts count & total training duration per ISO week</p>
          </div>
          <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
            Progressing Trend
          </span>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyBreakdown} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="week_start" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFF' }}
                labelStyle={{ color: '#06B6D4', fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
              <Bar dataKey="workouts" name="Workouts Count" fill="#06B6D4" radius={[6, 6, 0, 0]} />
              <Bar dataKey="total_duration" name="Total Mins" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recharts Section 2: Exercise Progressive Overload Line Chart */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-display">Exercise Progressive Overload Tracker</h3>
            <p className="text-xs text-slate-400">Track sets and repetitions trajectory over time</p>
          </div>

          {/* Exercise Selector */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search exercise..."
              value={selectedExercise}
              onChange={e => setSelectedExercise(e.target.value)}
              className="glass-input text-xs pl-9 pr-3 py-2 rounded-xl w-full"
            />
          </div>
        </div>

        {/* Line Chart */}
        <div className="h-64 w-full pt-2">
          {exerciseHistory.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              No history recorded for "{selectedExercise}".
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={exerciseHistory} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFF' }}
                  labelStyle={{ color: '#8B5CF6', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="reps" name="Reps per Set" stroke="#22D3EE" strokeWidth={3} dot={{ r: 5, fill: '#06B6D4' }} />
                <Line type="monotone" dataKey="sets" name="Total Sets" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4, fill: '#8B5CF6' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
