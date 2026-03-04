import React from 'react';
import { motion } from 'motion/react';
import { Dumbbell, Flame, Scale, TrendingDown, TrendingUp, Target } from 'lucide-react';
import { Profile } from '@/types';
import { getCurrentWeight } from '@/utils/nutrition-logic';

interface ProgressionSummaryModuleProps {
  profile: Profile;
  currentDay: number;
}

export default function ProgressionSummaryModule({ profile, currentDay }: ProgressionSummaryModuleProps) {
  const duration = parseInt(profile.duration);
  const startWeight = parseFloat(profile.weight);
  const currentWeight = getCurrentWeight(profile, currentDay);
  const targetLost = parseFloat(profile.targetLostWeight);
  const targetWeight = startWeight - targetLost;

  // Calculate Workout Stats
  const completedWorkouts = Object.values(profile.dailyLogs).filter(log => log.workoutCompleted).length;
  // Estimate total workouts based on duration (assuming 6 days/week or checking split)
  // Simple estimation: Duration - Sundays (if Sunday is rest)
  // Or better: Iterate all days and check if they have a workout in the split.
  // For simplicity, let's use the actual logs count vs current day for "consistency" 
  // and total duration for "progress".
  
  // Calculate Fasting Stats
  let totalFastingDaysPlanned = 0;
  let completedFastingDays = 0;

  for (let i = 1; i <= duration; i++) {
    const date = new Date(profile.startDate);
    date.setDate(date.getDate() + (i - 1));
    const dayOfWeek = date.getDay();
    
    if (profile.fastingDays?.includes(dayOfWeek)) {
      totalFastingDaysPlanned++;
      // Check if this day is in the past/today and completed
      if (profile.dailyLogs[i]?.completed) {
        completedFastingDays++;
      }
    }
  }

  const weightDiff = startWeight - currentWeight;
  const weightProgress = Math.min(100, Math.max(0, (weightDiff / targetLost) * 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Workouts Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-5 rounded-xl border border-zinc-800 relative overflow-hidden"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Treinos</p>
            <h3 className="text-2xl font-black text-white mt-1">{completedWorkouts} <span className="text-sm text-zinc-600 font-medium">/ {duration} dias</span></h3>
          </div>
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
            <Dumbbell size={20} />
          </div>
        </div>
        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(completedWorkouts / duration) * 100}%` }}
            className="h-full bg-blue-500"
          />
        </div>
      </motion.div>

      {/* Fasting Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel p-5 rounded-xl border border-zinc-800 relative overflow-hidden"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Jejum</p>
            <h3 className="text-2xl font-black text-white mt-1">{completedFastingDays} <span className="text-sm text-zinc-600 font-medium">/ {totalFastingDaysPlanned} dias</span></h3>
          </div>
          <div className="p-2 bg-[#FF4E00]/10 rounded-lg text-[#FF4E00]">
            <Flame size={20} />
          </div>
        </div>
        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(completedFastingDays / totalFastingDaysPlanned) * 100}%` }}
            className="h-full bg-[#FF4E00]"
          />
        </div>
      </motion.div>

      {/* Weight Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel p-5 rounded-xl border border-zinc-800 relative overflow-hidden"
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Peso</p>
            <div className="flex items-end gap-2 mt-1">
              <h3 className="text-2xl font-black text-white">{currentWeight}kg</h3>
              <span className={`text-xs font-bold mb-1 flex items-center ${weightDiff > 0 ? 'text-[#00FF80]' : 'text-zinc-500'}`}>
                {weightDiff > 0 ? <TrendingDown size={12} className="mr-1" /> : <TrendingUp size={12} className="mr-1" />}
                {Math.abs(weightDiff).toFixed(1)}kg
              </span>
            </div>
          </div>
          <div className="p-2 bg-[#00FF80]/10 rounded-lg text-[#00FF80]">
            <Scale size={20} />
          </div>
        </div>
        
        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-zinc-600 mb-1">
          <span>Início: {startWeight}</span>
          <span className="flex items-center gap-1"><Target size={10} /> Meta: {targetWeight}</span>
        </div>
        
        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${weightProgress}%` }}
            className="h-full bg-[#00FF80]"
          />
        </div>
      </motion.div>
    </div>
  );
}
