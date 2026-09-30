import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { fitaiApi } from '../services/api';
import { 
  Target, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  Calendar, 
  Trophy, 
  Edit3,
  TrendingUp,
  X
} from 'lucide-react';

export default function Goals() {
  const { goals, refreshData, showToast } = useApp();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState(100);
  const [currentValue, setCurrentValue] = useState(50);
  const [unit, setUnit] = useState('kg');
  const [deadline, setDeadline] = useState('2026-12-31');
  const [submitting, setSubmitting] = useState(false);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await fitaiApi.createGoal({
        title,
        description,
        target_value: Number(targetValue),
        current_value: Number(currentValue),
        unit,
        deadline
      });
      showToast(`Created goal "${title}"!`, 'success');
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      await refreshData();
    } catch (err) {
      showToast("Failed to create goal", 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProgress = async (goalId, currentVal, targetVal, delta) => {
    const newVal = Math.max(0, currentVal + delta);
    try {
      await fitaiApi.updateGoal(goalId, {
        current_value: newVal,
        achieved: targetVal ? newVal >= targetVal : false
      });
      showToast("Updated progress!", 'success');
      await refreshData();
    } catch (err) {
      showToast("Failed to update goal", 'warning');
    }
  };

  const handleDeleteGoal = async (goalId, goalTitle) => {
    if (!window.confirm(`Delete goal "${goalTitle}"?`)) return;
    try {
      await fitaiApi.deleteGoal(goalId);
      showToast(`Deleted goal "${goalTitle}"`, 'info');
      await refreshData();
    } catch (err) {
      showToast("Failed to delete goal", 'warning');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Header */}
      <div className="flex items-center justify-between glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white font-display">Target Fitness Milestones</h2>
          <p className="text-xs text-slate-400">Track current trajectory against progressive goals</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-dark-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Set New Goal</span>
        </button>
      </div>

      {/* Goal Cards Grid */}
      {(!goals || goals.length === 0) ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800 space-y-3">
          <Target className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No active goals configured</h3>
          <p className="text-xs text-slate-400">Set milestone targets to enable progressive score tracking.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-dark-950 font-bold text-xs mt-2"
          >
            Create Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const pct = Math.min(100, Math.round(((goal.current_value || 0) / (goal.target_value || 1)) * 100));
            const isAchieved = goal.achieved || pct >= 100;

            return (
              <div
                key={goal.id}
                className={`glass-card p-6 rounded-3xl border transition-all space-y-4 ${
                  isAchieved ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      isAchieved 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                        : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                    }`}>
                      {isAchieved ? <Trophy className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white font-display">{goal.title}</h3>
                      <p className="text-xs text-slate-400">{goal.description || "Progressive target metric"}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteGoal(goal.id, goal.title)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Bar & Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300">Progress</span>
                    <span className={isAchieved ? 'text-emerald-400 font-bold' : 'text-cyan-400 font-bold'}>
                      {goal.current_value} / {goal.target_value} {goal.unit} ({pct}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isAchieved 
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                          : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" /> Deadline: {goal.deadline || 'Ongoing'}
                    </span>
                    {isAchieved && (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Milestone Reached!
                      </span>
                    )}
                  </div>
                </div>

                {/* Increments Action Bar */}
                {!isAchieved && (
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Update value:</span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleUpdateProgress(goal.id, goal.current_value, goal.target_value, -1)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => handleUpdateProgress(goal.id, goal.current_value, goal.target_value, 1)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-400"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => handleUpdateProgress(goal.id, goal.current_value, goal.target_value, 5)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-xs font-bold text-cyan-300 border border-cyan-500/30"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New Goal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white font-display">Set Target Fitness Goal</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Goal Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Bench Press 100kg"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="glass-input text-xs px-3.5 py-2 rounded-xl w-full"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Progressive overload 1RM target"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="glass-input text-xs px-3.5 py-2 rounded-xl w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Current Value</label>
                  <input
                    type="number"
                    step="any"
                    value={currentValue}
                    onChange={e => setCurrentValue(e.target.value)}
                    className="glass-input text-xs px-3.5 py-2 rounded-xl w-full"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Target Value *</label>
                  <input
                    type="number"
                    step="any"
                    value={targetValue}
                    onChange={e => setTargetValue(e.target.value)}
                    className="glass-input text-xs px-3.5 py-2 rounded-xl w-full"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. kg, reps, %"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="glass-input text-xs px-3.5 py-2 rounded-xl w-full"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="glass-input text-xs px-3.5 py-2 rounded-xl w-full bg-dark-950"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-bold text-xs"
                >
                  {submitting ? 'Saving...' : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
