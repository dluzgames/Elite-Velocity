import React from 'react';
import { motion } from 'motion/react';
import { Droplets, Plus, Minus } from 'lucide-react';
import { Profile } from '@/types';

interface HydrationModuleProps {
  profile: Profile;
  dayNum: number;
  onUpdateWater: (amount: number) => void;
}

export default function HydrationModule({ profile, dayNum, onUpdateWater }: HydrationModuleProps) {
  const weight = parseFloat(profile.weight);
  const dailyGoal = Math.round((weight / 30) * 1000); // Convert L to ml for easier display
  const currentWater = profile.dailyLogs[dayNum]?.water || 0;
  const percentage = Math.min(100, Math.round((currentWater / dailyGoal) * 100));

  const addWater = (amount: number) => {
    onUpdateWater(currentWater + amount);
  };

  const removeWater = (amount: number) => {
    onUpdateWater(Math.max(0, currentWater - amount));
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-panel p-6 rounded-2xl relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Droplets size={80} />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
          <Droplets size={20} />
        </div>
        <h3 className="font-bold text-zinc-100 uppercase tracking-wider text-sm">Hidratação Tática</h3>
      </div>

      <div className="flex flex-col items-center justify-center mb-6">
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Circular Progress Background */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-zinc-800"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={351.86}
              strokeDashoffset={351.86 - (351.86 * percentage) / 100}
              className="text-blue-500 transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-white">{currentWater}</span>
            <span className="text-xs text-zinc-500 font-mono">/ {dailyGoal}ml</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => addWater(250)}
          className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 py-2 rounded-xl flex items-center justify-center gap-1 transition-colors"
        >
          <Plus size={16} /> 250ml
        </button>
        <button 
          onClick={() => addWater(500)}
          className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 py-2 rounded-xl flex items-center justify-center gap-1 transition-colors"
        >
          <Plus size={16} /> 500ml
        </button>
      </div>
      
      <div className="mt-3 flex justify-center">
         <button 
          onClick={() => removeWater(250)}
          className="text-xs text-zinc-600 hover:text-zinc-400 flex items-center gap-1 transition-colors"
        >
          <Minus size={12} /> Corrigir (-250ml)
        </button>
      </div>
    </motion.div>
  );
}
