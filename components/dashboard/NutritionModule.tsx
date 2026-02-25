import React from 'react';
import { motion } from 'motion/react';
import { Clock, Flame, Utensils, Scale, Activity } from 'lucide-react';
import { Profile } from '@/types';
import { calculateProteinTarget, calculateCaloriesTarget, getCurrentWeight, calculateBMI, getBMIStatus } from '@/utils/nutrition-logic';

interface NutritionModuleProps {
  profile: Profile;
  fastingStatus: {
    state: string;
    hoursLeft: number;
    minsLeft: number;
    isFasting: boolean;
  };
  dayOfWeek: number; // 0-6
  currentDay: number;
}

export default function NutritionModule({ profile, fastingStatus, dayOfWeek, currentDay }: NutritionModuleProps) {
  const isFastingDay = profile.fastingDays.includes(dayOfWeek);
  
  // Dynamic calculations based on current weight
  const currentWeight = getCurrentWeight(profile, currentDay);
  const bmi = calculateBMI(currentWeight, parseFloat(profile.height));
  const bmiStatus = getBMIStatus(parseFloat(bmi));
  
  // Recalculate targets based on CURRENT weight, not initial
  // We need to pass a "virtual" profile with the current weight to the helper functions
  // or update the helper functions to accept weight directly. 
  // For now, let's just create a temporary object since the helpers expect Profile
  const tempProfile = { ...profile, weight: currentWeight.toString() };
  
  const calories = calculateCaloriesTarget(tempProfile);
  const protein = calculateProteinTarget(tempProfile);

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-panel rounded-2xl p-6 col-span-1 md:col-span-2 relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Módulo Nutricional</h3>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            {isFastingDay ? 'PROTOCOLO DE JEJUM' : 'DIETA PADRÃO'}
            {isFastingDay && <Flame className="text-[#FF4E00]" fill="#FF4E00" size={20} />}
          </h2>
        </div>
        {isFastingDay && (
          <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
            fastingStatus.isFasting 
              ? 'bg-[#FF4E00]/20 border-[#FF4E00] text-[#FF4E00]' 
              : 'bg-[#00FF80]/20 border-[#00FF80] text-[#00FF80]'
          }`}>
            {fastingStatus.state}
          </div>
        )}
      </div>

      {/* Body Stats Section - Always Visible */}
      <div className="grid grid-cols-2 gap-4 mb-6 bg-zinc-900/30 p-4 rounded-xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
            <Scale size={20} />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase font-bold">Peso Atual</p>
            <p className="text-xl font-black text-white">{currentWeight} <span className="text-xs font-normal text-zinc-500">kg</span></p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase font-bold">IMC ({bmiStatus})</p>
            <p className="text-xl font-black text-white">{bmi}</p>
          </div>
        </div>
      </div>

      {isFastingDay ? (
        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative">
            {/* Glow Effect */}
            <div className={`absolute inset-0 blur-3xl opacity-20 ${fastingStatus.isFasting ? 'bg-[#FF4E00]' : 'bg-[#00FF80]'}`} />
            
            <div className="relative z-10 text-center">
              <p className="text-zinc-400 text-sm font-mono mb-2">PRÓXIMA FASE EM</p>
              <div className="text-6xl font-black font-mono tracking-tighter text-white">
                {String(fastingStatus.hoursLeft).padStart(2, '0')}
                <span className="text-zinc-600">:</span>
                {String(fastingStatus.minsLeft).padStart(2, '0')}
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-8 w-full max-w-sm">
            <div className="text-center">
              <p className="text-xs text-zinc-500 uppercase">Início Janela</p>
              <p className="font-mono text-xl font-bold">{profile.startHour}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-zinc-500 uppercase">Protocolo</p>
              <p className="font-mono text-xl font-bold">{profile.protocol}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={18} className="text-blue-500" />
              <p className="text-xs font-bold text-zinc-400 uppercase">Teto Calórico</p>
            </div>
            <p className="text-3xl font-black text-white">{calories} <span className="text-sm font-normal text-zinc-500">kcal</span></p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <Utensils size={18} className="text-purple-500" />
              <p className="text-xs font-bold text-zinc-400 uppercase">Proteína Alvo</p>
            </div>
            <p className="text-3xl font-black text-white">{protein} <span className="text-sm font-normal text-zinc-500">g</span></p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
