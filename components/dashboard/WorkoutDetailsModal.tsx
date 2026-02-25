import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Dumbbell, Sparkles, Activity, Flame, Utensils, CheckCircle, Clock, Target } from 'lucide-react';

interface WorkoutDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: number;
  workoutName: string;
  description?: string;
  exercises: string[];
  cardio: string;
  isFasting: boolean;
  isCompleted: boolean;
  caloriesTarget: number;
  proteinTarget: number;
  onAskAI: () => void;
}

export default function WorkoutDetailsModal({ 
  isOpen, 
  onClose, 
  day, 
  workoutName, 
  description,
  exercises, 
  cardio,
  isFasting,
  isCompleted,
  caloriesTarget,
  proteinTarget,
  onAskAI 
}: WorkoutDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'training' | 'nutrition'>('training');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-[#151619] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-zinc-800 relative bg-zinc-900/50">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex items-center justify-between mb-2 pr-8">
                <span className="bg-[#00FF80]/10 text-[#00FF80] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-[#00FF80]/20">
                  DIA {day}
                </span>
                {isCompleted ? (
                  <div className="flex items-center gap-1 text-[#00FF80] text-xs font-bold uppercase tracking-widest">
                    <CheckCircle size={14} />
                    <span>Concluído</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                    <Clock size={14} />
                    <span>Pendente</span>
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-black text-white leading-tight">
                DETALHES DA MISSÃO
              </h2>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-800">
              <button
                onClick={() => setActiveTab('training')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                  activeTab === 'training' 
                    ? 'bg-zinc-800 text-white border-b-2 border-[#00FF80]' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                Treino
              </button>
              <button
                onClick={() => setActiveTab('nutrition')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                  activeTab === 'nutrition' 
                    ? 'bg-zinc-800 text-white border-b-2 border-[#FF4E00]' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                Nutrição
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <AnimatePresence mode="wait">
                {activeTab === 'training' ? (
                  <motion.div
                    key="training"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-white mb-1">{workoutName}</h3>
                      {description && (
                        <p className="text-zinc-400 text-sm leading-relaxed">
                          {description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 mb-6">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Dumbbell size={14} /> Exercícios
                      </h4>
                      {exercises.map((ex, i) => (
                        <div key={i} className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                          <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
                            <span className="text-xs font-mono">{i + 1}</span>
                          </div>
                          <span className="text-zinc-200 text-sm font-medium">{ex}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-[#FF4E00]/10 border border-[#FF4E00]/20 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-2 text-[#FF4E00]">
                        <Activity size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest">Protocolo Cardio</span>
                      </div>
                      <p className="text-zinc-200 text-sm font-medium leading-relaxed">
                        {cardio}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="nutrition"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Fasting Status */}
                    <div className={`p-4 rounded-xl border ${
                      isFasting 
                        ? 'bg-[#FF4E00]/10 border-[#FF4E00]/30' 
                        : 'bg-zinc-900 border-zinc-800'
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${isFasting ? 'bg-[#FF4E00] text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                          <Flame size={20} />
                        </div>
                        <div>
                          <h4 className={`font-bold ${isFasting ? 'text-[#FF4E00]' : 'text-zinc-400'}`}>
                            {isFasting ? 'Dia de Jejum' : 'Sem Jejum Obrigatório'}
                          </h4>
                          <p className="text-xs text-zinc-500">
                            {isFasting 
                              ? 'Siga o protocolo de jejum intermitente estabelecido.' 
                              : 'Alimentação normal conforme macros.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Macros Targets */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-2 mb-2 text-zinc-500">
                          <Target size={14} />
                          <span className="text-xs font-bold uppercase tracking-widest">Calorias</span>
                        </div>
                        <p className="text-2xl font-black text-white">{caloriesTarget}</p>
                        <p className="text-xs text-zinc-600">kcal / dia</p>
                      </div>
                      <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-2 mb-2 text-zinc-500">
                          <Utensils size={14} />
                          <span className="text-xs font-bold uppercase tracking-widest">Proteína</span>
                        </div>
                        <p className="text-2xl font-black text-white">{proteinTarget}g</p>
                        <p className="text-xs text-zinc-600">mínimo / dia</p>
                      </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                      <h4 className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">Dica de Hidratação</h4>
                      <p className="text-zinc-300 text-sm">
                        Lembre-se de beber água constantemente, especialmente se estiver em jejum. A meta base é 35ml por kg de peso corporal.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Action */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-900/50">
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
