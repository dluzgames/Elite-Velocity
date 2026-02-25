import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, CheckCircle, Zap, X, Save, Edit3 } from 'lucide-react';
import { Profile } from '@/types';
import { getWorkoutSplit, getCardioDetail } from '@/utils/workout-logic';

interface WorkoutModuleProps {
  profile: Profile;
  dayNum: number;
  onComplete: () => void;
  isCompleted: boolean;
  isOutOfBounds: boolean;
  onUpdateNote: (exercise: string, note: string) => void;
}

export default function WorkoutModule({ profile, dayNum, onComplete, isCompleted, isOutOfBounds, onUpdateNote }: WorkoutModuleProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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

  const dailyLog = profile.dailyLogs[dayNum];
  const exerciseNotes = dailyLog?.exerciseNotes || {};

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
              <p className="text-white text-sm font-medium">{cardio}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Workout Details Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#111] border border-zinc-800 w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl"
            >
              <div className="sticky top-0 bg-[#111] border-b border-zinc-800 p-4 flex justify-between items-center z-10">
                <div>
                  <h3 className="text-[#FFD700] font-bold uppercase text-xs tracking-widest">Detalhes da Missão</h3>
                  <h2 className="text-xl font-black text-white">{todayWorkout?.main}</h2>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {todayWorkout?.exercises && todayWorkout.exercises.length > 0 ? (
                  todayWorkout.exercises.map((exercise, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#FFD700]/10 text-[#FFD700] flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <h4 className="font-bold text-white">{exercise}</h4>
                      </div>
                      <div className="pl-9">
                        <textarea 
                          placeholder="Adicione notas pessoais, cargas ou dicas de execução..."
                          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all resize-none h-20"
                          value={exerciseNotes[exercise] || ''}
                          onChange={(e) => onUpdateNote(exercise, e.target.value)}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-zinc-500 italic">
                    Nenhum exercício específico listado para hoje.
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 text-center">
                <p className="text-xs text-zinc-500">As notas são salvas automaticamente.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
