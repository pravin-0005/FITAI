import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toast } = useApp();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isWarning = toast.type === 'warning';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div className={`flex items-center space-x-3 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-xl border ${
        isSuccess 
          ? 'bg-slate-900/90 border-emerald-500/40 text-emerald-400 shadow-emerald-500/10'
          : isWarning
          ? 'bg-slate-900/90 border-amber-500/40 text-amber-400 shadow-amber-500/10'
          : 'bg-slate-900/90 border-cyan-500/40 text-cyan-400 shadow-cyan-500/10'
      }`}>
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
        {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />}
        {!isSuccess && !isWarning && <Info className="w-5 h-5 text-cyan-400 flex-shrink-0" />}
        
        <p className="text-xs font-semibold text-white pr-2">{toast.message}</p>
      </div>
    </div>
  );
}
