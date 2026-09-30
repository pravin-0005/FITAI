import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fitaiApi } from '../services/api';
import { 
  Bot, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  Dumbbell, 
  Clock, 
  Plus, 
  RefreshCw, 
  AlertTriangle, 
  Layers, 
  SlidersHorizontal,
  Flame,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

export default function AICoach() {
  const { plans, selectedPlanId, navigateTo, refreshData, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('generator'); // generator, insights, adaptive

  // Generator Form State
  const [fitnessGoal, setFitnessGoal] = useState('muscle_gain');
  const [fitnessLevel, setFitnessLevel] = useState('intermediate');
  const [availableDays, setAvailableDays] = useState(4);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [equipment, setEquipment] = useState(['dumbbells', 'pull-up bar']);
  const [generating, setGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [savingPlan, setSavingPlan] = useState(false);

  // Insights State
  const [insightsData, setInsightsData] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Adaptive Recs State
  const [adaptPlanId, setAdaptPlanId] = useState(selectedPlanId || (plans[0]?.id || ''));
  const [adapting, setAdapting] = useState(false);
  const [adaptResult, setAdaptResult] = useState(null);

  useEffect(() => {
    if (activeTab === 'insights') {
      fetchInsights();
    }
  }, [activeTab]);

  const toggleEquipment = (eq) => {
    if (equipment.includes(eq)) {
      setEquipment(equipment.filter(e => e !== eq));
    } else {
      setEquipment([...equipment, eq]);
    }
  };

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setGeneratedPlan(null);
    try {
      const plan = await fitaiApi.generateAIPlan({
        fitness_goal: fitnessGoal,
        fitness_level: fitnessLevel,
        available_days: Number(availableDays),
        workout_duration_minutes: Number(durationMinutes),
        equipment,
      });
      setGeneratedPlan(plan);
      showToast("AI Workout Plan generated successfully!", 'success');
    } catch (err) {
      showToast("Failed to generate plan via AI engine", 'warning');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveGeneratedPlan = async () => {
    if (!generatedPlan) return;
    setSavingPlan(true);
    try {
      const created = await fitaiApi.createPlan({
        name: generatedPlan.plan_name,
        description: generatedPlan.description,
        difficulty: generatedPlan.difficulty,
        is_ai_generated: true,
      });

      // Flatten exercises from all days
      let count = 0;
      if (generatedPlan.days) {
        for (const dayObj of generatedPlan.days) {
          for (const ex of dayObj.exercises) {
            count++;
            await fitaiApi.addExerciseToPlan(created.id, {
              name: `${dayObj.day}: ${ex.name}`,
              sets: ex.sets || 3,
              repetitions: ex.repetitions || 10,
              duration_minutes: ex.duration_minutes || null,
              rest_seconds: ex.rest_seconds || 60,
              difficulty: ex.difficulty || generatedPlan.difficulty
            });
          }
        }
      }

      showToast(`Saved "${generatedPlan.plan_name}" to workout library!`, 'success');
      await refreshData();
      navigateTo('workout-plans');
    } catch (err) {
      showToast("Failed to save generated plan", 'warning');
    } finally {
      setSavingPlan(false);
    }
  };

  const fetchInsights = async () => {
    setLoadingInsights(true);
    try {
      const data = await fitaiApi.getAIInsights();
      setInsightsData(data);
    } catch (err) {
      showToast("Failed to fetch AI insights", 'warning');
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleAdaptPlan = async () => {
    if (!adaptPlanId) return;
    setAdapting(true);
    setAdaptResult(null);
    try {
      const res = await fitaiApi.adjustAIPlan(adaptPlanId);
      setAdaptResult(res);
      showToast("AI Adaptation completed!", 'success');
    } catch (err) {
      showToast("Failed to compute adaptive plan adjustments", 'warning');
    } finally {
      setAdapting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Engine Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-dark-950/90 to-cyan-950/40 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Neural Adaptive Engine v1.0</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            FITAI Adaptive Intelligence Hub
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Generates personalized schedules, performs workout history analysis, and calculates real-time progressive overload adaptations.
          </p>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'generator'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Plan Generator
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'insights'
                ? 'bg-gradient-to-r from-purple-500 to-emerald-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Insights Feed
          </button>
          <button
            onClick={() => setActiveTab('adaptive')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'adaptive'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-dark-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Adaptive Recs
          </button>
        </div>
      </div>

      {/* TAB 1: AI PLAN GENERATOR */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generator Parameters Form */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" /> AI Generator Parameters
            </h3>

            <form onSubmit={handleGeneratePlan} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Fitness Goal</label>
                <select
                  value={fitnessGoal}
                  onChange={e => setFitnessGoal(e.target.value)}
                  className="glass-input text-xs px-3.5 py-2.5 rounded-xl w-full bg-dark-950"
                >
                  <option value="muscle_gain">Hypertrophy / Muscle Gain</option>
                  <option value="weight_loss">Fat Loss & Conditioning</option>
                  <option value="strength">Raw Power & Max Strength</option>
                  <option value="endurance">Stamina & Aerobic Capacity</option>
                  <option value="general">General Fitness & Mobility</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Fitness Level</label>
                <select
                  value={fitnessLevel}
                  onChange={e => setFitnessLevel(e.target.value)}
                  className="glass-input text-xs px-3.5 py-2.5 rounded-xl w-full bg-dark-950"
                >
                  <option value="beginner">Beginner (1-2 years)</option>
                  <option value="intermediate">Intermediate (2-4 years)</option>
                  <option value="advanced">Advanced (4+ years)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Days / Week</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={availableDays}
                    onChange={e => setAvailableDays(e.target.value)}
                    className="glass-input text-xs px-3.5 py-2 rounded-xl w-full text-center font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Session Mins</label>
                  <input
                    type="number"
                    step="15"
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(e.target.value)}
                    className="glass-input text-xs px-3.5 py-2 rounded-xl w-full text-center font-bold text-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Available Equipment</label>
                <div className="flex flex-wrap gap-2">
                  {['dumbbells', 'barbell', 'pull-up bar', 'cables', 'kettlebell', 'bodyweight'].map(eq => {
                    const isSelected = equipment.includes(eq);
                    return (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => toggleEquipment(eq)}
                        className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-xs'
                            : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {eq}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-dark-950 font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02]"
              >
                <Bot className="w-4 h-4 fill-dark-950" />
                {generating ? 'Generating AI Schedule...' : 'Generate AI Workout Plan'}
              </button>
            </form>
          </div>

          {/* Generated Plan Result Column (2 cols wide) */}
          <div className="lg:col-span-2 space-y-6">
            {!generatedPlan ? (
              <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800 space-y-3">
                <Bot className="w-12 h-12 text-purple-400/50 mx-auto" />
                <h3 className="text-base font-bold text-white">No AI Plan Generated Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Configure your fitness goals and available equipment parameters on the left, then click "Generate AI Workout Plan".
                </p>
              </div>
            ) : (
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
                      {generatedPlan.difficulty} Protocol
                    </span>
                    <h3 className="text-2xl font-extrabold text-white mt-1.5 font-display">
                      {generatedPlan.plan_name}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">{generatedPlan.description}</p>
                  </div>

                  <button
                    onClick={handleSaveGeneratedPlan}
                    disabled={savingPlan}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-dark-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    {savingPlan ? 'Saving to Workouts...' : 'Save Plan to Workouts'}
                  </button>
                </div>

                {/* Days Schedule Grid */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Weekly Workout Schedule</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {generatedPlan.days.map((day, dIdx) => (
                      <div key={dIdx} className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <span className="text-xs font-extrabold text-cyan-400">{day.day}</span>
                          <span className="text-[11px] font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md">
                            {day.focus}
                          </span>
                        </div>
                        <div className="space-y-1.5 pt-1">
                          {day.exercises.map((ex, eIdx) => (
                            <div key={eIdx} className="text-xs flex items-center justify-between text-slate-300">
                              <span className="font-medium truncate pr-2">• {ex.name}</span>
                              <span className="text-[11px] text-slate-400 flex-shrink-0 font-mono">
                                {ex.sets}s x {ex.repetitions || '10'}r ({ex.rest_seconds || 60}s rest)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Safety & Coaching Tips */}
                {generatedPlan.tips && generatedPlan.tips.length > 0 && (
                  <div className="bg-purple-950/20 p-4 rounded-2xl border border-purple-500/20 space-y-2">
                    <h5 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-purple-400" /> AI Recovery & Safety Directives
                    </h5>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {generatedPlan.tips.map((tip, tIdx) => (
                        <li key={tIdx} className="flex items-start gap-2">
                          <span className="text-purple-400 font-bold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI INSIGHTS FEED */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {loadingInsights ? (
            <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-medium">Analyzing workout history with neural model...</p>
            </div>
          ) : insightsData ? (
            <div className="space-y-6">
              {/* Summary Score Card */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white font-display">Performance Audit Summary</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">{insightsData.summary}</p>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall Score</span>
                  <span className="text-3xl font-black text-cyan-400 font-display">
                    {insightsData.overall_score || 9}<span className="text-sm font-bold text-slate-400">/10</span>
                  </span>
                </div>
              </div>

              {/* Categorized Insights Feed */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(insightsData.insights || []).map((ins, idx) => (
                  <div key={idx} className="glass-card p-6 rounded-3xl border border-slate-800 space-y-3">
                    <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      <Zap className="w-4 h-4" />
                      <span>{ins.category}</span>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">{ins.finding}</p>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                        <span className="text-emerald-400 font-bold">Recommendation: </span>
                        {ins.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800">
              <p className="text-xs text-slate-400">No insight feed available.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ADAPTIVE RECOMMENDATIONS */}
      {activeTab === 'adaptive' && (
        <div className="space-y-6">
          {/* Plan Selection Trigger Bar */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white font-display">Run Adaptive Overload Evaluation</h3>
              <p className="text-xs text-slate-400">Select a workout plan to calculate progressive adjustments based on logged performance</p>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <select
                value={adaptPlanId}
                onChange={e => setAdaptPlanId(e.target.value)}
                className="glass-input text-xs px-3.5 py-2.5 rounded-xl w-full sm:w-64 bg-dark-950"
              >
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <button
                onClick={handleAdaptPlan}
                disabled={adapting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-dark-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <Zap className="w-4 h-4 fill-dark-950" />
                {adapting ? 'Evaluating...' : 'Adapt Plan'}
              </button>
            </div>
          </div>

          {/* Adaptive Results Container */}
          {adaptResult && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                    Adaptation Evaluation Complete
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1.5 font-display">
                    Adaptive Overload Recommendations
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">{adaptResult.summary}</p>
                </div>
              </div>

              {/* Adjustments Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Proposed Exercise Adjustments</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(adaptResult.adjustments || []).map((adj, idx) => (
                    <div key={idx} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                      <h5 className="text-sm font-bold text-cyan-400">{adj.exercise_name}</h5>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">Current Scheme</span>
                          <span className="text-slate-300 font-medium">{adj.current}</span>
                        </div>
                        <div className="bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/30">
                          <span className="text-[10px] text-emerald-400 font-bold uppercase block">Suggested AI Scheme</span>
                          <span className="text-emerald-300 font-bold">{adj.suggested}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 italic">"{adj.reason}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
