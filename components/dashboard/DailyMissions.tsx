import React from 'react';
import { motion } from 'motion/react';
import { Check, Dumbbell, Droplets, Beef, Circle, Zap, RotateCcw } from 'lucide-react';
import { Profile } from '@/types';
import { calculateProteinTarget } from '@/utils/nutrition-logic';

interface DailyMissionsProps {
  profile: Profile;
  dayNum: number;
  onToggleWorkout: (status: boolean) => void;
  onUpdateProtein: (amount: number) => void;
  onUpdateWeight: (amount: number) => void;
  onUpdateMaxSpeed: (amount: number) => void;
  onCompleteDay: () => void;
  onResetDay: () => void;
}

export default function DailyMissions({ profile, dayNum, onToggleWorkout, onUpdateProtein, onUpdateWeight, onUpdateMaxSpeed, onCompleteDay, onResetDay }: DailyMissionsProps) {
  const log = profile.dailyLogs[dayNum] || { 
    workoutCompleted: false, 
    waterCompleted: false, 
    proteinCompleted: false,
    water: 0,
    protein: 0,
    completed: false,
    weight: undefined,
    maxSpeed: undefined
  };

  const [weightInput, setWeightInput] = React.useState<string>(log.weight ? log.weight.toString() : '');
  const [maxSpeedInput, setMaxSpeedInput] = React.useState<string>(log.maxSpeed ? log.maxSpeed.toString() : '');

  // Sync local state when dayNum changes or if log.weight changes externally (not from this component's typing)
  React.useEffect(() => {
    const currentWeightStr = log.weight ? log.weight.toString() : '';
    // Only update if the value is actually different and doesn't end in a dot (to avoid interrupting typing)
    if (currentWeightStr !== weightInput && !weightInput.endsWith('.') && !weightInput.endsWith(',')) {
      setWeightInput(currentWeightStr);
    }
  }, [log.weight, dayNum, weightInput]);

  React.useEffect(() => {
    const currentMaxSpeedStr = log.maxSpeed ? log.maxSpeed.toString() : '';
    if (currentMaxSpeedStr !== maxSpeedInput && !maxSpeedInput.endsWith('.') && !maxSpeedInput.endsWith(',')) {
      setMaxSpeedInput(currentMaxSpeedStr);
    }
  }, [log.maxSpeed, dayNum, maxSpeedInput]);

  const weight = parseFloat(profile.weight);
  
  // Targets
  const proteinTarget = calculateProteinTarget(profile);
  const waterTarget = Math.round((weight / 30) * 1000); // 35ml/kg approx (using /30 logic from prompt)

  const weightCompleted = log.weight !== undefined && log.weight > 0;
  const maxSpeedCompleted = log.maxSpeed !== undefined && log.maxSpeed > 0;
  const allMissionsCompleted = log.workoutCompleted && log.waterCompleted && log.proteinCompleted && weightCompleted && maxSpeedCompleted;

  return (
    <div className="glass-panel p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <Check size={14} />
          Missões do Dia
        </h3>
        {log.completed && (
          <div className="flex items-center gap-2">
            <button 
              onClick={onResetDay}
              className="text-zinc-500 hover:text-red-500 transition-colors p-1"
              title="Resetar Dia"
            >
              <RotateCcw size={14} />
            </button>
            <span className="text-[#00FF80] text-xs font-bold uppercase tracking-widest border border-[#00FF80] px-2 py-1 rounded-md">
              Dia Concluído
            </span>
          </div>
        )}
      </div>

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
                <p className="text-xs text-zinc-500">Meta: {proteinTarget}g (Personalizada)</p>
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

        {/* Mission 4: Weight */}
        <div className={`p-4 rounded-xl border transition-all ${
            weightCompleted 
              ? 'bg-[#00FF80]/10 border-[#00FF80]/30' 
              : 'bg-zinc-900/50 border-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                weightCompleted ? 'bg-[#00FF80] text-black' : 'bg-zinc-800 text-zinc-500'
              }`}>
                <Circle size={20} />
              </div>
              <div>
                <h4 className={`font-bold uppercase tracking-wider ${weightCompleted ? 'text-white' : 'text-zinc-400'}`}>
                  Pesagem
                </h4>
                <p className="text-xs text-zinc-500">Registre seu peso atual</p>
              </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              weightCompleted ? 'border-[#00FF80] bg-[#00FF80]' : 'border-zinc-700'
            }`}>
              {weightCompleted && <Check size={14} className="text-black" />}
            </div>
          </div>
          
          {/* Weight Input */}
          <div className="flex items-center gap-2">
             <input 
               type="text" 
               inputMode="decimal"
               value={weightInput} 
               onChange={(e) => {
                 const originalVal = e.target.value;
                 const normalizedVal = originalVal.replace(',', '.');
                 // Allow numbers and one decimal separator (dot or comma)
                 if (originalVal === '' || /^\d*([.,]\d*)?$/.test(originalVal)) {
                   setWeightInput(originalVal);
                   const parsed = parseFloat(normalizedVal);
                   if (!isNaN(parsed) && !normalizedVal.endsWith('.')) {
                     onUpdateWeight(parsed);
                   }
                 }
               }}
               placeholder="0.0"
               className="flex-1 bg-zinc-800 rounded-lg p-2 text-white font-mono text-center focus:outline-none focus:ring-1 focus:ring-[#00FF80]"
             />
             <span className="text-sm font-mono font-bold w-8 text-zinc-500">kg</span>
          </div>
        </div>
        {/* Mission 5: Max Speed */}
        <div className={`p-4 rounded-xl border transition-all ${
            maxSpeedCompleted 
              ? 'bg-[#00FF80]/10 border-[#00FF80]/30' 
              : 'bg-zinc-900/50 border-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                maxSpeedCompleted ? 'bg-[#00FF80] text-black' : 'bg-zinc-800 text-zinc-500'
              }`}>
                <Zap size={20} />
              </div>
              <div>
                <h4 className={`font-bold uppercase tracking-wider ${maxSpeedCompleted ? 'text-white' : 'text-zinc-400'}`}>
                  Velocidade Máxima
                </h4>
                <p className="text-xs text-zinc-500">Opcional: Velocidade máxima do treino</p>
              </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              maxSpeedCompleted ? 'border-[#00FF80] bg-[#00FF80]' : 'border-zinc-700'
            }`}>
              {maxSpeedCompleted && <Check size={14} className="text-black" />}
            </div>
          </div>
          
          {/* Max Speed Input */}
          <div className="flex items-center gap-2">
             <input 
               type="text" 
               inputMode="decimal"
               value={maxSpeedInput} 
               onChange={(e) => {
                 const originalVal = e.target.value;
                 const normalizedVal = originalVal.replace(',', '.');
                 // Allow numbers and one decimal separator (dot or comma)
                 if (originalVal === '' || /^\d*([.,]\d*)?$/.test(originalVal)) {
                   setMaxSpeedInput(originalVal);
                   const parsed = parseFloat(normalizedVal);
                   if (!isNaN(parsed) && !normalizedVal.endsWith('.')) {
                     onUpdateMaxSpeed(parsed);
                   }
                 }
               }}
               placeholder="0.0"
               className="flex-1 bg-zinc-800 rounded-lg p-2 text-white font-mono text-center focus:outline-none focus:ring-1 focus:ring-[#00FF80]"
             />
             <span className="text-sm font-mono font-bold w-12 text-zinc-500">km/h</span>
          </div>
        </div>
      </div>

      {!log.completed && (
        <div className="space-y-3 mt-6">
          {allMissionsCompleted && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onCompleteDay}
              className="w-full bg-[#00FF80] text-black font-black uppercase tracking-widest py-3 rounded-xl hover:bg-[#00FF80]/90 transition-colors flex items-center justify-center gap-2"
            >
              <Check size={18} />
              Concluir Dia
            </motion.button>
          )}
          
          <button
            onClick={onResetDay}
            className="w-full border border-zinc-800 text-zinc-500 hover:text-red-500 hover:border-red-500/30 transition-all font-bold uppercase tracking-widest py-2 rounded-xl flex items-center justify-center gap-2 text-[10px]"
          >
            <RotateCcw size={12} />
            Resetar Progresso do Dia
          </button>
        </div>
      )}
    </div>
  );
}
