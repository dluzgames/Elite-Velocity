import React from 'react';
import { motion } from 'motion/react';
import { Check, Dumbbell, Droplets, Beef, Circle } from 'lucide-react';
import { Profile } from '@/types';

interface DailyMissionsProps {
  profile: Profile;
  dayNum: number;
  onToggleWorkout: (status: boolean) => void;
  onUpdateProtein: (amount: number) => void;
}

export default function DailyMissions({ profile, dayNum, onToggleWorkout, onUpdateProtein }: DailyMissionsProps) {
  const log = profile.dailyLogs[dayNum] || { 
    workoutCompleted: false, 
    waterCompleted: false, 
    proteinCompleted: false,
    water: 0,
    protein: 0
  };

  const weight = parseFloat(profile.weight);
  
  // Targets
  const proteinTarget = Math.round(weight * 2); // 2g/kg
  const waterTarget = Math.round((weight / 30) * 1000); // 35ml/kg approx (using /30 logic from prompt)

  return (
    <div className="glass-panel p-6 rounded-2xl">
      <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
        <Check size={14} />
        Missões do Dia
      </h3>

      <div className="space-y-4">
        {/* Mission 1: Workout */}
        <div 
          onClick={() => onToggleWorkout(!log.workoutCompleted)}
          className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
            log.workoutCompleted 
              ? 'bg-[#00FF80]/10 border-[#00FF80]/30' 
              : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              log.workoutCompleted ? 'bg-[#00FF80] text-black' : 'bg-zinc-800 text-zinc-500'
            }`}>
              <Dumbbell size={20} />
            </div>
            <div>
              <h4 className={`font-bold uppercase tracking-wider ${log.workoutCompleted ? 'text-white' : 'text-zinc-400'}`}>
                Treino Tático
              </h4>
              <p className="text-xs text-zinc-500">Executar protocolo do dia</p>
            </div>
          </div>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            log.workoutCompleted ? 'border-[#00FF80] bg-[#00FF80]' : 'border-zinc-700'
          }`}>
            {log.workoutCompleted && <Check size={14} className="text-black" />}
          </div>
        </div>

        {/* Mission 2: Water (Read-only status, controlled by HydrationModule) */}
        <div className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
            log.waterCompleted 
              ? 'bg-blue-500/10 border-blue-500/30' 
              : 'bg-zinc-900/50 border-zinc-800'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              log.waterCompleted ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-500'
            }`}>
              <Droplets size={20} />
            </div>
            <div>
              <h4 className={`font-bold uppercase tracking-wider ${log.waterCompleted ? 'text-white' : 'text-zinc-400'}`}>
                Hidratação
              </h4>
              <p className="text-xs text-zinc-500">
                {log.water}ml / {waterTarget}ml
              </p>
            </div>
          </div>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            log.waterCompleted ? 'border-blue-500 bg-blue-500' : 'border-zinc-700'
          }`}>
            {log.waterCompleted && <Check size={14} className="text-white" />}
          </div>
        </div>

        {/* Mission 3: Protein */}
        <div className={`p-4 rounded-xl border transition-all ${
            log.proteinCompleted 
              ? 'bg-red-500/10 border-red-500/30' 
              : 'bg-zinc-900/50 border-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                log.proteinCompleted ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-500'
              }`}>
                <Beef size={20} />
              </div>
              <div>
                <h4 className={`font-bold uppercase tracking-wider ${log.proteinCompleted ? 'text-white' : 'text-zinc-400'}`}>
                  Proteína
                </h4>
                <p className="text-xs text-zinc-500">Meta: {proteinTarget}g (2g/kg)</p>
              </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              log.proteinCompleted ? 'border-red-500 bg-red-500' : 'border-zinc-700'
            }`}>
              {log.proteinCompleted && <Check size={14} className="text-white" />}
            </div>
          </div>
          
          {/* Protein Input */}
          <div className="flex items-center gap-2">
             <input 
               type="range" 
               min="0" 
               max={proteinTarget + 50} 
               value={log.protein || 0} 
               onChange={(e) => onUpdateProtein(parseInt(e.target.value))}
               className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500"
             />
             <span className="text-sm font-mono font-bold w-12 text-right">{log.protein || 0}g</span>
          </div>
        </div>
      </div>
    </div>
  );
}
