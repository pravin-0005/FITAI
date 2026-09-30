import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import PlanDetailModal from '../components/PlanDetailModal';
import { 
  Dumbbell, 
  Plus, 
  Bot, 
  Search, 
  Play, 
  Eye, 
  Sparkles, 
  Calendar,
  Layers,
  CheckCircle2
} from 'lucide-react';

export default function WorkoutPlans() {
  const { plans, navigateTo } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, ai, custom
  const [selectedPlanModal, setSelectedPlanModal] = useState(null);

  const filteredPlans = (plans || []).filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    if (filter === 'ai') return matchesSearch && p.is_ai_generated;
    if (filter === 'custom') return matchesSearch && !p.is_ai_generated;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search workout plans..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="glass-input text-xs pl-10 pr-4 py-2.5 rounded-xl w-full"
          />
        </div>

        {/* Filter Pills & Actions */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'all' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({plans?.length || 0})
            </button>
            <button
              onClick={() => setFilter('ai')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                filter === 'ai' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bot className="w-3 h-3" /> AI Plans
            </button>
            <button
              onClick={() => setFilter('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'custom' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Custom
            </button>
          </div>

          <button
            onClick={() => navigateTo('create-plan')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-dark-950 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Plan</span>
          </button>
        </div>
      </div>

      {/* Grid of Workout Plans */}
      {filteredPlans.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800 space-y-4">
          <Dumbbell className="w-12 h-12 text-slate-600 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-white">No workout plans found</h3>
            <p className="text-xs text-slate-400 mt-1">Try resetting your filter search or create a new plan.</p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => navigateTo('create-plan')}
              className="px-4 py-2 rounded-xl bg-slate-800 text-white font-semibold text-xs border border-slate-700"
            >
              Create Manual Plan
            </button>
            <button
              onClick={() => navigateTo('ai-coach')}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-dark-950 font-extrabold text-xs"
            >
              Generate AI Plan
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="glass-card p-6 rounded-3xl border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Badges */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md border ${
                    plan.difficulty === 'advanced' 
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : plan.difficulty === 'intermediate'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {plan.difficulty}
                  </span>

                  {plan.is_ai_generated && (
                    <span className="text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-xs">
                      <Bot className="w-3 h-3" /> AI Core
                    </span>
                  )}
                </div>

                {/* Plan Name & Desc */}
                <div>
                  <h3 className="text-lg font-bold text-white font-display group-hover:text-cyan-400 transition-colors">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {plan.description || "Comprehensive target workout plan with progressive overload."}
                  </p>
                </div>

                {/* Exercises Count */}
                <div className="flex items-center space-x-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    {plan.exercises ? plan.exercises.length : plan.exercise_count || 0} Exercises
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(plan.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedPlanModal(plan)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" /> View
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateTo('ai-coach', { planId: plan.id })}
                    className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-colors"
                    title="Ask AI Coach to adapt this plan"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => navigateTo('daily-logging', { planId: plan.id })}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-dark-950 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-dark-950" /> Start
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan Detail Modal */}
      {selectedPlanModal && (
        <PlanDetailModal
          plan={selectedPlanModal}
          onClose={() => setSelectedPlanModal(null)}
        />
      )}
    </div>
  );
}
