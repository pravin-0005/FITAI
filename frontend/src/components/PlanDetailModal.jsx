import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { fitaiApi } from '../services/api';
import { X, Dumbbell, Clock, Repeat, Flame, Plus, Trash2, Bot, Play } from 'lucide-react';

export default function PlanDetailModal({ plan, onClose }) {
  const { navigateTo, refreshData, showToast } = useApp();
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '',
    sets: 3,
    repetitions: 10,
    duration_minutes: 0,
    rest_seconds: 60,
    difficulty: 'intermediate'
  });
  const [submitting, setSubmitting] = useState(false);

  if (!plan) return null;

  const handleAddExercise = async (e) => {
    e.preventDefault();
    if (!newExercise.name.trim()) return;
    setSubmitting(true);
    try {
      await fitaiApi.addExerciseToPlan(plan.id, newExercise);
      showToast(`Added ${newExercise.name} to plan`, 'success');
      setShowAddExercise(false);
      setNewExercise({ name: '', sets: 3, repetitions: 10, duration_minutes: 0, rest_seconds: 60, difficulty: 'intermediate' });
      await refreshData();
    } catch (err) {
      showToast("Failed to add exercise", 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExercise = async (exerciseId, exerciseName) => {
    if (!window.confirm(`Remove ${exerciseName} from plan?`)) return;
    try {
      await fitaiApi.deleteExerciseFromPlan(plan.id, exerciseId);
      showToast(`Removed ${exerciseName}`, 'info');
      await refreshData();
    } catch (err) {
      showToast("Failed to delete exercise", 'warning');
    }
  };

  const handleStartWorkout = () => {
    onClose();
    navigateTo('daily-logging', { planId: plan.id });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/60">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white font-display">{plan.name}</h2>
              {plan.is_ai_generated && (
                <span className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Bot className="w-3 h-3" /> AI Generated
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">{plan.description || "Custom workout plan."}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Exercises ({plan.exercises ? plan.exercises.length : 0})
            </h3>
            <button
              onClick={() => setShowAddExercise(!showAddExercise)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              {showAddExercise ? 'Cancel' : 'Add Exercise'}
            </button>
          </div>

          {/* Add Exercise Inline Form */}
          {showAddExercise && (
            <form onSubmit={handleAddExercise} className="glass-card p-4 rounded-xl border border-cyan-500/30 space-y-3">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Add Custom Exercise</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Exercise Name (e.g. Incline Bench Press)"
                  value={newExercise.name}
                  onChange={e => setNewExercise({ ...newExercise, name: e.target.value })}
                  className="glass-input text-xs px-3 py-2 rounded-lg w-full"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Sets</label>
                    <input
                      type="number"
                      min="1"
                      value={newExercise.sets}
                      onChange={e => setNewExercise({ ...newExercise, sets: Number(e.target.value) })}
                      className="glass-input text-xs px-3 py-1.5 rounded-lg w-full"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Reps</label>
                    <input
                      type="number"
                      min="1"
                      value={newExercise.repetitions}
                      onChange={e => setNewExercise({ ...newExercise, repetitions: Number(e.target.value) })}
                      className="glass-input text-xs px-3 py-1.5 rounded-lg w-full"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-bold text-xs"
                >
                  {submitting ? 'Saving...' : 'Add to Plan'}
                </button>
              </div>
            </form>
          )}

          {/* Exercise List */}
          {(!plan.exercises || plan.exercises.length === 0) ? (
            <div className="p-8 text-center glass-card rounded-xl border border-slate-800">
              <Dumbbell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-medium">No exercises added yet to this plan.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {plan.exercises.map((ex, idx) => (
                <div
                  key={ex.id || idx}
                  className="glass-card p-3.5 rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{ex.name}</h4>
                      <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1"><Repeat className="w-3 h-3 text-cyan-400" /> {ex.sets} sets x {ex.repetitions || ex.duration_minutes + ' min'}</span>
                        {ex.rest_seconds && (
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-emerald-400" /> Rest {ex.rest_seconds}s</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteExercise(ex.id, ex.name)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Remove Exercise"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
          >
            Close
          </button>
          <button
            onClick={handleStartWorkout}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-dark-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <Play className="w-4 h-4 fill-dark-950" />
            Start Session Now
          </button>
        </div>
      </div>
    </div>
  );
}
