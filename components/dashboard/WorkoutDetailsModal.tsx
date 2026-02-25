import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Dumbbell, Sparkles, Activity } from 'lucide-react';

interface WorkoutDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: number;
  workoutName: string;
  exercises: string[];
  cardio: string;
  onAskAI: () => void;
}

export default function WorkoutDetailsModal({ 
  isOpen, 
  onClose, 
  day, 
  workoutName, 
  exercises, 
  cardio,
  onAskAI 
}: WorkoutDetailsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-[#151619] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#00FF80]/10 text-[#00FF80] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-[#00FF80]/20">
                  DIA {day}
                </span>
              </div>

              <h2 className="text-2xl font-black text-white mb-6 leading-tight">
                {workoutName}
              </h2>

              <div className="space-y-3 mb-6">
                {exercises.map((ex, i) => (
                  <div key={i} className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500">
                      <Dumbbell size={16} />
                    </div>
                    <span className="text-zinc-200 font-medium">{ex}</span>
                  </div>
                ))}
              </div>

              {/* Cardio Section */}
              <div className="mb-8 bg-[#FF4E00]/10 border border-[#FF4E00]/20 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2 text-[#FF4E00]">
                  <Activity size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Protocolo Cardio</span>
                </div>
                <p className="text-zinc-200 text-sm font-medium leading-relaxed">
                  {cardio}
                </p>
              </div>

              <button
                onClick={() => {
                  onAskAI();
                  onClose();
                }}
                className="w-full py-4 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 bg-[#00FF80] text-black hover:bg-[#00FF80]/90 transition-colors shadow-[0_0_20px_rgba(0,255,128,0.2)]"
              >
                <Sparkles size={20} />
                Analisar com Frya
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
