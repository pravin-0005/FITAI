import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { fitaiApi } from '../services/api';
import { Plus, Trash2, Dumbbell, Bot, Sparkles, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function CreateWorkoutPlan() {
  const { navigateTo, refreshData, showToast } = useApp();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [exercises, setExercises] = useState([
    { id: 1, name: 'Incline Dumbbell Press', sets: 4, repetitions: 10, rest_seconds: 60 },
    { id: 2, name: 'Cable Lateral Raise', sets: 3, repetitions: 12, rest_seconds: 45 }
  ]);

  const [currentExName, setCurrentExName] = useState('');
  const [currentExSets, setCurrentExSets] = useState(3);
  const [currentExReps, setCurrentExReps] = useState(10);
  const [currentExRest, setCurrentExRest] = useState(60);

  const [submitting, setSubmitting] = useState(false);

  const handleAddExercise = (e) => {
    e.preventDefault();
    if (!currentExName.trim()) return;
    setExercises([
      ...exercises,
      {
        id: Date.now(),
        name: currentExName.trim(),
        sets: Number(currentExSets),
        repetitions: Number(currentExReps),
        rest_seconds: Number(currentExRest)
      }
    ]);
    setCurrentExName('');
    setCurrentExSets(3);
    setCurrentExReps(10);
    setCurrentExRest(60);
  };

  const handleRemoveExercise = (id) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleSubmitPlan = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Plan name is required", 'warning');
      return;
    }
    if (exercises.length === 0) {
      showToast("Please add at least one exercise", 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const created = await fitaiApi.createPlan({
        name,
        description,
        difficulty,
        is_ai_generated: false,
      });

      // Add exercises sequentially
      for (const ex of exercises) {
        await fitaiApi.addExerciseToPlan(created.id, ex);
      }

      showToast(`Plan "${name}" created successfully!`, 'success');
      await refreshData();
      navigateTo('workout-plans');
    } catch (err) {
      showToast("Failed to create workout plan", 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Banner / Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('workout-plans')}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Workout Plans
        </button>

        <button
          onClick={() => navigateTo('ai-coach')}
          className="text-xs text-purple-300 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 hover:bg-purple-500/20 transition-colors"
        >
          <Bot className="w-4 h-4 text-purple-400" /> Or Generate with AI Coach
        </button>
      </div>

      <form onSubmit={handleSubmitPlan} className="space-y-6">
        {/* Step 1: Plan Details */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white font-display">1. Plan Metadata</h3>
            <p className="text-xs text-slate-400">Define basic details about your training routine</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-300">Plan Name *</label>
              <input
                type="text"
                placeholder="e.g. Upper Body Hypertrophy Focus"
                value={name}
                onChange={e => setName(e.target.value)}
                className="glass-input text-sm px-4 py-2.5 rounded-xl w-full"
                required
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-300">Description</label>
              <textarea
                rows="2"
                placeholder="Summary of target muscle groups and progression goals..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="glass-input text-sm px-4 py-2.5 rounded-xl w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Target Difficulty</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="glass-input text-sm px-4 py-2.5 rounded-xl w-full bg-dark-950"
              >
                <option value="beginner">Beginner (1-2 days/week)</option>
                <option value="intermediate">Intermediate (3-4 days/week)</option>
                <option value="advanced">Advanced (5-6 days/week)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Add Exercises */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white font-display">2. Exercises List ({exercises.length})</h3>
              <p className="text-xs text-slate-400">Add movement patterns and prescribe set/rep schemes</p>
            </div>
          </div>

          {/* Inline Add Exercise Controls */}
          <div className="glass-card p-4 rounded-2xl border border-cyan-500/20 space-y-3">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Add New Exercise</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Exercise Name (e.g. Barbell Squat)"
                  value={currentExName}
                  onChange={e => setCurrentExName(e.target.value)}
                  className="glass-input text-xs px-3.5 py-2.5 rounded-xl w-full"
                />
              </div>

              <div>
                <input
                  type="number"
                  placeholder="Sets (e.g. 4)"
                  value={currentExSets}
                  onChange={e => setCurrentExSets(e.target.value)}
                  className="glass-input text-xs px-3.5 py-2.5 rounded-xl w-full"
                />
              </div>

              <div>
                <input
                  type="number"
                  placeholder="Reps (e.g. 10)"
                  value={currentExReps}
                  onChange={e => setCurrentExReps(e.target.value)}
                  className="glass-input text-xs px-3.5 py-2.5 rounded-xl w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-400">Rest Seconds:</span>
                <input
                  type="number"
                  value={currentExRest}
                  onChange={e => setCurrentExRest(e.target.value)}
                  className="glass-input text-xs px-2 py-1 rounded-lg w-20 text-center"
                />
              </div>

              <button
                type="button"
                onClick={handleAddExercise}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-bold text-xs flex items-center gap-1"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Add to Routine
              </button>
            </div>
          </div>

          {/* Added Exercises Preview Table */}
          {exercises.length === 0 ? (
            <div className="p-8 text-center glass-card rounded-2xl border border-slate-800">
              <Dumbbell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No exercises added yet. Use the form above to add exercises.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {exercises.map((ex, idx) => (
                <div
                  key={ex.id}
                  className="glass-card p-3.5 rounded-xl border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{ex.name}</p>
                      <p className="text-xs text-slate-400">
                        {ex.sets} sets x {ex.repetitions} reps | Rest: {ex.rest_seconds}s
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveExercise(ex.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigateTo('workout-plans')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-dark-950 font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-cyan-500/20"
          >
            {submitting ? 'Saving Plan...' : 'Save & Publish Plan'}
          </button>
        </div>
      </form>
    </div>
  );
}
