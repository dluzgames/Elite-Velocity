import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Dumbbell, Zap, Edit3 } from 'lucide-react';
import { Profile } from '@/types';
import { getWorkoutSplit, getCardioDetail } from '@/utils/workout-logic';
import { calculateCaloriesTarget, calculateProteinTarget } from '@/utils/nutrition-logic';
import WorkoutDetailsModal from './WorkoutDetailsModal';

interface WorkoutModuleProps {
  profile: Profile;
  dayNum: number;
  onComplete: () => void;
  isCompleted: boolean;
  isOutOfBounds: boolean;
  onUpdateNote: (exercise: string, note: string) => void;
  onAskAI: () => void;
}

export default function WorkoutModule({ 
  profile, 
  dayNum, 
  onComplete, 
  isCompleted, 
  isOutOfBounds, 
  onUpdateNote,
  onAskAI
}: WorkoutModuleProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Calculate workout for today
  const date = new Date(profile.startDate);
  date.setDate(date.getDate() + (dayNum - 1));
  const dayOfWeek = date.getDay(); // 0-6
  
  // Map Mon(1) -> 0, Sat(6) -> 5
  const splitIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
  
  const split = getWorkoutSplit(profile.gender, profile.focuses, profile.workoutProtocol);
  const todayWorkout = dayOfWeek === 0 
    ? { main: "Repouso Tático", desc: "Mobilidade e Recuperação", exercises: [] }
    : split[splitIndex];

  const cardio = getCardioDetail(
    dayOfWeek,
    dayNum,
    profile
  );

  const dailyLog = profile.dailyLogs[dayNum];
  const exerciseNotes = dailyLog?.exerciseNotes || {};
  
  const isFasting = profile.fastingDays.includes(dayOfWeek);
  const caloriesTarget = calculateCaloriesTarget(profile);
  const proteinTarget = calculateProteinTarget(profile);

  return (
    <>
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-panel rounded-2xl p-6 col-span-1 flex flex-col justify-between"
      >
        <div>
          <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Missão do Dia</h3>
          
          <div className="space-y-4">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="bg-zinc-900/50 p-4 rounded-xl border-l-4 border-[#FFD700] cursor-pointer group transition-all hover:bg-zinc-800/50"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Dumbbell size={16} className="text-[#FFD700]" />
                  <p className="text-xs font-bold text-[#FFD700] uppercase">Musculação</p>
                </div>
                <Edit3 size={14} className="text-zinc-600 group-hover:text-white transition-colors" />
              </div>
              <h4 className="font-black text-white text-lg leading-tight">{todayWorkout?.main}</h4>
              <p className="text-zinc-400 text-sm mt-1">{todayWorkout?.desc}</p>
              <p className="text-xs text-zinc-500 mt-2 underline">Ver exercícios e notas</p>
            </motion.div>

            <div className="bg-zinc-900/50 p-4 rounded-xl border-l-4 border-[#3B82F6]">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={16} className="text-[#3B82F6]" />
                <p className="text-xs font-bold text-[#3B82F6] uppercase">Cardio / Metabólico</p>
              </div>
              <h4 className="font-bold text-white text-sm leading-tight">{cardio.title}</h4>
              <p className="text-zinc-400 text-xs mt-1 leading-relaxed">{cardio.desc}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <WorkoutDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        day={dayNum}
        workoutName={todayWorkout?.main || "Treino Livre"}
        description={todayWorkout?.desc}
        exercises={todayWorkout?.exercises || []}
        cardio={cardio}
        isFasting={isFasting}
        isCompleted={isCompleted}
        caloriesTarget={caloriesTarget}
        proteinTarget={proteinTarget}
        onAskAI={onAskAI}
        exerciseNotes={exerciseNotes}
        onUpdateNote={onUpdateNote}
      />
    </>
  );
}
