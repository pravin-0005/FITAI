import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fitaiApi } from '../services/api';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  Dumbbell, 
  Plus, 
  FileText, 
  Flame, 
  Sparkles, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';

export default function DailyLogging() {
  const { plans, selectedPlanId, navigateTo, refreshData, showToast } = useApp();

  const [activePlanId, setActivePlanId] = useState(selectedPlanId || (plans[0]?.id || ''));
  const [currentSession, setCurrentSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const [notes, setNotes] = useState('');
  
  // Exercise logging state
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [setsCompleted, setSetsCompleted] = useState(3);
  const [repsCompleted, setRepsCompleted] = useState(10);
  const [durationMinutes, setDurationMinutes] = useState(12);
  const [logNotes, setLogNotes] = useState('');

  const [isCompleted, setIsCompleted] = useState(false);

  // Selected plan details
  const activePlan = plans.find(p => p.id === Number(activePlanId));

  // Initialize or fetch session when plan changes
  useEffect(() => {
    startNewSession();
  }, [activePlanId]);

  const startNewSession = async () => {
    setLoadingSession(true);
    try {
      const daily = await fitaiApi.createDailyWorkout({
        plan_id: activePlanId ? Number(activePlanId) : null,
        date: new Date().toISOString().split('T')[0],
        notes: notes || "Session logged via FITAI Web"
      });
      setCurrentSession(daily);
      setIsCompleted(daily.completed);
      if (activePlan && activePlan.exercises && activePlan.exercises.length > 0) {
        setSelectedExercise(activePlan.exercises[0]);
      }
    } catch (err) {
      console.error(err);
      showToast("Error initializing workout session", 'warning');
    } finally {
      setLoadingSession(false);
    }
  };

  const handleLogExercise = async (e) => {
    e.preventDefault();
    if (!currentSession) return;
    const exName = selectedExercise ? selectedExercise.name : "Custom Exercise";

    try {
      await fitaiApi.addWorkoutLog(currentSession.id, {
        exercise_id: selectedExercise ? selectedExercise.id : null,
        exercise_name: exName,
        sets_completed: Number(setsCompleted),
        reps_completed: Number(repsCompleted),
        duration_minutes: Number(durationMinutes),
        notes: logNotes || null
      });

      showToast(`Logged set for ${exName}`, 'success');
      setLogNotes('');
      // Refresh local session data
      const dailies = await fitaiApi.getDailyWorkouts();
      const updated = dailies.find(d => d.id === currentSession.id);
      if (updated) setCurrentSession(updated);

      // Auto cycle to next exercise if available
      if (activePlan && activePlan.exercises) {
        const currentIdx = activePlan.exercises.findIndex(e => e.name === exName);
        if (currentIdx !== -1 && currentIdx < activePlan.exercises.length - 1) {
          setSelectedExercise(activePlan.exercises[currentIdx + 1]);
        }
      }
    } catch (err) {
      showToast("Failed to record exercise log", 'warning');
    }
  };

  const handleCompleteSession = async () => {
    if (!currentSession) return;
    try {
      const completed = await fitaiApi.completeDailyWorkout(currentSession.id);
      setIsCompleted(true);
      setCurrentSession(completed);
      showToast("Workout Completed! Great effort today 🎉", 'success');
      await refreshData();
    } catch (err) {
      showToast("Failed to complete workout", 'warning');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Session Config Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              Active Workout Session
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-2 font-display">
              {activePlan ? activePlan.name : "Freeform Session"}
            </h2>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <select
              value={activePlanId}
              onChange={e => setActivePlanId(e.target.value)}
              className="glass-input text-xs px-3.5 py-2.5 rounded-xl w-full sm:w-64 bg-dark-950"
            >
              <option value="">-- Select Workout Plan --</option>
              {plans.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.difficulty})</option>
              ))}
            </select>

            <button
              onClick={startNewSession}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
              title="Reset / Start New Session"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Celebratory Banner if Completed */}
      {isCompleted ? (
        <div className="glass-panel p-8 rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-dark-950/80 to-cyan-950/40 text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-2xl font-extrabold text-white font-display">Workout Completed!</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
              Your session logs have been saved to progress history. AI Coach is analyzing your progressive overload metrics.
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => navigateTo('progress')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700"
            >
              View Progress & Analytics
            </button>
            <button
              onClick={() => navigateTo('ai-coach')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-dark-950 font-extrabold text-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> Get AI Insights
            </button>
          </div>
        </div>
      ) : (
        /* Logging Area */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 cols): Set Logger Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Form */}
            <form onSubmit={handleLogExercise} className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-cyan-400" /> Log Exercise Set
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Select Exercise</label>
                  {activePlan && activePlan.exercises && activePlan.exercises.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {activePlan.exercises.map((ex) => (
                        <button
                          key={ex.id}
                          type="button"
                          onClick={() => setSelectedExercise(ex)}
                          className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                            selectedExercise?.name === ex.name
                              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-bold'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <p className="truncate">{ex.name}</p>
                          <p className="text-[10px] text-slate-500">{ex.sets}s x {ex.repetitions}r</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="Exercise Name (e.g. Push-ups)"
                      value={selectedExercise ? selectedExercise.name : ''}
                      onChange={e => setSelectedExercise({ name: e.target.value })}
                      className="glass-input text-xs px-3.5 py-2.5 rounded-xl w-full"
                    />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Sets Completed</label>
                    <input
                      type="number"
                      min="1"
                      value={setsCompleted}
                      onChange={e => setSetsCompleted(e.target.value)}
                      className="glass-input text-xs px-3 py-2 rounded-xl w-full text-center font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Reps per Set</label>
                    <input
                      type="number"
                      min="1"
                      value={repsCompleted}
                      onChange={e => setRepsCompleted(e.target.value)}
                      className="glass-input text-xs px-3 py-2 rounded-xl w-full text-center font-bold text-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Duration (Mins)</label>
                    <input
                      type="number"
                      min="1"
                      value={durationMinutes}
                      onChange={e => setDurationMinutes(e.target.value)}
                      className="glass-input text-xs px-3 py-2 rounded-xl w-full text-center font-bold text-emerald-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Notes / Feel (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Felt strong on 3rd set, smooth tempo"
                    value={logNotes}
                    onChange={e => setLogNotes(e.target.value)}
                    className="glass-input text-xs px-3.5 py-2 rounded-xl w-full"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" /> Log Exercise Set
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Live Session Logs & Complete Action */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                  Completed Sets ({currentSession?.logs ? currentSession.logs.length : 0})
                </h3>
                <span className="text-xs text-slate-400">
                  {currentSession?.duration_minutes || 0} mins logged
                </span>
              </div>

              {(!currentSession?.logs || currentSession.logs.length === 0) ? (
                <div className="p-6 text-center text-slate-500">
                  <p className="text-xs">No sets logged for this session yet.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {currentSession.logs.map((log, idx) => (
                    <div key={log.id || idx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">{log.exercise_name}</p>
                        <p className="text-[10px] text-slate-400">
                          {log.sets_completed} sets x {log.reps_completed} reps ({log.duration_minutes}m)
                        </p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-800">
                <button
                  onClick={handleCompleteSession}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-dark-950 font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-4 h-4 fill-dark-950" />
                  Finish & Complete Workout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
