import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, Flag, TrendingUp, Plus, Minus } from 'lucide-react';
import { Profile } from '@/types';

interface RunningProgressModuleProps {
  profile: Profile;
  currentDay: number;
  onUpdateDistance: (day: number, distance: number) => void;
}

export default function RunningProgressModule({ profile, currentDay, onUpdateDistance }: RunningProgressModuleProps) {
  // Calculate total distance run so far
  const totalDistanceRun = Object.values(profile.dailyLogs).reduce((acc, log) => {
    return acc + (log.distanceRun || 0);
  }, 0);

  const targetDistance = parseFloat(profile.targetDistance) || 0;
  const remainingDistance = Math.max(0, targetDistance - totalDistanceRun);
  const progressPercentage = Math.min(100, (totalDistanceRun / targetDistance) * 100);

  // Check if today has a logged distance
  const todayLog = profile.dailyLogs[currentDay];
  const todayLoggedDistance = todayLog?.distanceRun || 0;

  const [todaysDistance, setTodaysDistance] = useState<string>(todayLoggedDistance > 0 ? todayLoggedDistance.toString() : '');

  const handleUpdate = () => {
    const dist = parseFloat(todaysDistance);
    if (!isNaN(dist)) {
      onUpdateDistance(currentDay, dist);
    }
  };

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-panel rounded-2xl p-6 relative overflow-hidden group"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Activity size={120} />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-[#00FF80] text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-1">
              <Flag size={14} />
              Meta de Corrida
            </h3>
            <h2 className="text-3xl font-black text-white tracking-tight">
              {totalDistanceRun.toFixed(1)} <span className="text-zinc-500 text-lg">/ {targetDistance} km</span>
            </h2>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-zinc-500 uppercase font-bold">Faltam</p>
            <p className="text-2xl font-bold text-white">{remainingDistance.toFixed(1)} km</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-800/50 h-4 rounded-full overflow-hidden mb-6 border border-zinc-700/30">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-[#00FF80] to-[#00CC66] relative"
          >
            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>

        {/* Today's Input */}
        <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00FF80]/10 rounded-lg text-[#00FF80]">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-zinc-400 font-bold uppercase">Corrida de Hoje</p>
              <p className="text-white font-bold text-sm">Registre seu progresso</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={todaysDistance}
              onChange={(e) => setTodaysDistance(e.target.value)}
              placeholder="0.0"
              className="w-20 bg-black border border-zinc-700 rounded-lg py-2 px-3 text-white font-mono text-center focus:border-[#00FF80] focus:outline-none transition-colors"
            />
            <span className="text-zinc-500 font-bold text-sm">km</span>
            <button 
              onClick={handleUpdate}
              className="ml-2 p-2 bg-[#00FF80] text-black rounded-lg hover:bg-[#00CC66] transition-colors font-bold"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
