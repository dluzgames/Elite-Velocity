import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, Flame, Utensils, Scale, Activity, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Profile, Meal } from '@/types';
import { calculateProteinTarget, calculateCaloriesTarget, getCurrentWeight, calculateBMI, getBMIStatus, calculateMealTotals } from '@/utils/nutrition-logic';
import MealLogModal from './MealLogModal';

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
  onAddMeal: (dayNum: number, meal: Omit<Meal, 'id'>) => void;
  onRemoveMeal: (dayNum: number, mealId: string) => void;
}

export default function NutritionModule({ 
  profile, 
  fastingStatus, 
  dayOfWeek, 
  currentDay,
  onAddMeal,
  onRemoveMeal
}: NutritionModuleProps) {
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isMealsExpanded, setIsMealsExpanded] = useState(false);
  
  const isFastingDay = profile.fastingDays.includes(dayOfWeek);
  
  // Dynamic calculations based on current weight
  const currentWeight = getCurrentWeight(profile, currentDay);
  const bmi = calculateBMI(currentWeight, parseFloat(profile.height));
  const bmiStatus = getBMIStatus(parseFloat(bmi));
  
  const tempProfile = { ...profile, weight: currentWeight.toString() };
  
  const targetCalories = calculateCaloriesTarget(tempProfile);
  const targetProtein = calculateProteinTarget(tempProfile);

  const currentDayLog = profile.dailyLogs[currentDay];
  const meals = currentDayLog?.meals || [];
  const totals = calculateMealTotals(meals);

  const caloriePercentage = Math.min(100, (totals.calories / targetCalories) * 100);
  const proteinPercentage = Math.min(100, (totals.protein / targetProtein) * 100);

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
        <div className="flex items-center gap-2">
          {isFastingDay && (
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
              fastingStatus.isFasting 
                ? 'bg-[#FF4E00]/20 border-[#FF4E00] text-[#FF4E00]' 
                : 'bg-[#00FF80]/20 border-[#00FF80] text-[#00FF80]'
            }`}>
              {fastingStatus.state}
            </div>
          )}
          <button
            onClick={() => setIsMealModalOpen(true)}
            className="p-2 rounded-xl bg-[#00FF80]/10 border border-[#00FF80]/20 text-[#00FF80] hover:bg-[#00FF80]/20 transition-colors"
            title="Adicionar Refeição"
          >
            <Plus size={20} />
          </button>
        </div>
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
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <Flame size={18} className="text-blue-500" />
                <p className="text-xs font-bold text-zinc-400 uppercase">Calorias</p>
              </div>
              <p className="text-3xl font-black text-white relative z-10">
                {totals.calories} <span className="text-sm font-normal text-zinc-500">/ {targetCalories}</span>
              </p>
              <div className="absolute bottom-0 left-0 h-1 bg-blue-500/30 w-full">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${caloriePercentage}%` }}
                  className="h-full bg-blue-500"
                />
              </div>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <Utensils size={18} className="text-purple-500" />
                <p className="text-xs font-bold text-zinc-400 uppercase">Proteína</p>
              </div>
              <p className="text-3xl font-black text-white relative z-10">
                {totals.protein}g <span className="text-sm font-normal text-zinc-500">/ {targetProtein}g</span>
              </p>
              <div className="absolute bottom-0 left-0 h-1 bg-purple-500/30 w-full">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${proteinPercentage}%` }}
                  className="h-full bg-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/20 rounded-xl p-3 border border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Carboidratos</span>
              </div>
              <span className="text-sm font-black text-white">{totals.carbs}g</span>
            </div>
            <div className="bg-zinc-900/20 rounded-xl p-3 border border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Gorduras</span>
              </div>
              <span className="text-sm font-black text-white">{totals.fats}g</span>
            </div>
          </div>

          {/* Meals List */}
          <div className="bg-zinc-900/30 rounded-xl border border-white/5 overflow-hidden">
            <button 
              onClick={() => setIsMealsExpanded(!isMealsExpanded)}
              className="w-full px-4 py-3 flex justify-between items-center text-zinc-400 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <Utensils size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Refeições Logadas ({meals.length})</span>
              </div>
              {isMealsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isMealsExpanded && (
              <div className="px-4 pb-4 space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                {meals.length === 0 ? (
                  <p className="text-center py-4 text-zinc-600 text-sm italic">Nenhuma refeição registrada hoje.</p>
                ) : (
                  meals.map((meal) => (
                    <div key={meal.id} className="flex justify-between items-center p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50 group">
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-sm">{meal.name}</span>
                        <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                          <span className="flex items-center gap-0.5"><Clock size={10} /> {meal.time}</span>
                          <span className="flex items-center gap-0.5"><Flame size={10} /> {meal.calories} kcal</span>
                          <span className="flex items-center gap-0.5"><Zap size={10} /> {meal.protein}g P</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => onRemoveMeal(currentDay, meal.id)}
                        className="p-2 rounded-lg text-zinc-600 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <MealLogModal 
        isOpen={isMealModalOpen}
        onClose={() => setIsMealModalOpen(false)}
        onAddMeal={(meal) => onAddMeal(currentDay, meal)}
      />
    </motion.div>
  );
}

const Zap = ({ size, className }: { size: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
