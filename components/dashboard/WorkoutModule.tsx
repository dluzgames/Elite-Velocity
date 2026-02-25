import React from 'react';
import { motion } from 'motion/react';
import { Dumbbell, CheckCircle, Zap } from 'lucide-react';
import { Profile } from '@/types';
import { getWorkoutSplit, getCardioDetail } from '@/utils/workout-logic';

interface WorkoutModuleProps {
  profile: Profile;
  dayNum: number;
  onComplete: () => void;
  isCompleted: boolean;
  isOutOfBounds: boolean;
}

export default function WorkoutModule({ profile, dayNum, onComplete, isCompleted, isOutOfBounds }: WorkoutModuleProps) {
  // Calculate workout for today
  const date = new Date(profile.startDate);
  date.setDate(date.getDate() + (dayNum - 1));
  const dayOfWeek = date.getDay(); // 0-6
  
  // Map Mon(1) -> 0, Sat(6) -> 5
  const splitIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 6 is just a placeholder for Sunday logic if needed
  
  const split = getWorkoutSplit(profile.gender, profile.focuses, profile.workoutProtocol);
  const todayWorkout = dayOfWeek === 0 
    ? { main: "Repouso Tático", desc: "Mobilidade e Recuperação", exercises: [] }
    : split[splitIndex];

  const cardio = getCardioDetail(
    dayOfWeek,
    dayNum,
    profile.focuses,
    profile.footballDays,
    profile.runDays,
    profile.runDistances
  );

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="glass-panel rounded-2xl p-6 col-span-1 flex flex-col justify-between"
    >
      <div>
        <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Missão do Dia</h3>
        
        <div className="space-y-4">
          <div className="bg-zinc-900/50 p-4 rounded-xl border-l-4 border-[#FFD700]">
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell size={16} className="text-[#FFD700]" />
              <p className="text-xs font-bold text-[#FFD700] uppercase">Musculação</p>
            </div>
            <h4 className="font-black text-white text-lg leading-tight">{todayWorkout?.main}</h4>
            <p className="text-zinc-400 text-sm mt-1">{todayWorkout?.desc}</p>
          </div>

          <div className="bg-zinc-900/50 p-4 rounded-xl border-l-4 border-[#3B82F6]">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={16} className="text-[#3B82F6]" />
              <p className="text-xs font-bold text-[#3B82F6] uppercase">Cardio / Metabólico</p>
            </div>
            <p className="text-white text-sm font-medium">{cardio}</p>
          </div>
        </div>
      </div>

      <button
        onClick={onComplete}
        disabled={isCompleted || isOutOfBounds}
        className={`w-full mt-6 py-4 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
          isCompleted 
            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            : isOutOfBounds
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-[#00FF80] text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(0,255,128,0.4)]'
        }`}
      >
        {isCompleted ? (
          <>
            <CheckCircle size={20} />
            Missão Cumprida
          </>
        ) : (
          "Concluir Dia"
        )}
      </button>
    </motion.div>
  );
}
