import React from 'react';
import { motion } from 'motion/react';
import { Clock, Flame, Utensils } from 'lucide-react';
import { Profile } from '@/types';

interface NutritionModuleProps {
  profile: Profile;
  fastingStatus: {
    state: string;
    hoursLeft: number;
    minsLeft: number;
    isFasting: boolean;
  };
  dayOfWeek: number; // 0-6
}

export default function NutritionModule({ profile, fastingStatus, dayOfWeek }: NutritionModuleProps) {
  const isFastingDay = profile.fastingDays.includes(dayOfWeek);
  const weight = parseFloat(profile.weight);
  const calories = Math.round(weight * 24);
  const protein = Math.round(weight * 2);

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
