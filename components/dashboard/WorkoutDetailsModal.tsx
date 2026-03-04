import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Dumbbell, Sparkles, Activity, Flame, Utensils, CheckCircle, Clock, Target, Lightbulb, Zap, Info, CheckCircle2 } from 'lucide-react';

interface WorkoutDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: number;
  workoutName: string;
  description?: string;
  exercises: string[];
  cardio: { title: string; desc: string };
  isFasting: boolean;
  isCompleted: boolean;
  caloriesTarget: number;
  proteinTarget: number;
  onAskAI: () => void;
  exerciseNotes?: Record<string, string>;
  onUpdateNote?: (exercise: string, note: string) => void;
}

const EXERCISE_TIPS: Record<string, string> = {
  "Agachamento Livre": "Mantenha o peito aberto, calcanhares no chão e joelhos alinhados com a ponta dos pés. Desça até onde sua mobilidade permitir sem arredondar a lombar.",
  "Agachamento com Salto": "Aterrisse suavemente com a ponta dos pés e use o impulso para o próximo salto. Mantenha o core firme.",
  "Supino Reto": "Mantenha as escápulas retraídas e os pés firmes no chão. A barra deve descer na linha do mamilo e subir em um arco suave.",
  "Levantamento Terra": "Coluna neutra, barra rente à canela. Use a força das pernas para iniciar o movimento e finalize com a extensão do quadril.",
  "Prancha Isométrica": "Corpo em linha reta da cabeça aos calcanhares. Contraia glúteos e abdômen intensamente.",
  "Barra Fixa": "Foque em puxar com os cotovelos para baixo. Controle a descida (fase excêntrica) para maximizar o ganho de força.",
  "Burpees": "Mantenha um ritmo constante. No salto, estenda completamente o corpo. No chão, mantenha o core firme.",
  "Afundo": "O joelho de trás deve quase tocar o chão. Mantenha o tronco ereto e o peso no calcanhar da perna da frente.",
  "Stiff": "Foco no alongamento dos isquiotibiais. Mantenha a coluna reta e a barra próxima às pernas.",
  "Remada Curvada": "Mantenha o tronco inclinado a 45 graus, coluna reta. Puxe a barra em direção ao umbigo, apertando as escápulas.",
  "Desenvolvimento": "Evite arquear excessivamente a lombar. Estenda os braços completamente acima da cabeça.",
  "Flexão de Braço": "Cotovelos a 45 graus do corpo. Peito deve quase tocar o chão.",
  "Elevação Pélvica": "Aperte os glúteos no topo do movimento por 1-2 segundos. Mantenha o queixo no peito.",
  "Panturrilha": "Amplitude máxima. Sinta o alongamento no fundo e a contração máxima no topo.",
};

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
  onAskAI,
  exerciseNotes = {},
  onUpdateNote
}: WorkoutDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'training' | 'nutrition'>('training');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-2xl bg-[#0A0A0A] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 relative bg-zinc-900/50">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <span className="bg-[#00FF80]/10 text-[#00FF80] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#00FF80]/20">
                  MISSÃO DIA {day}
                </span>
                {isCompleted && (
                  <div className="flex items-center gap-1 text-[#00FF80] text-[10px] font-black uppercase tracking-widest">
                    <CheckCircle size={14} />
                    <span>Concluído</span>
                  </div>
                )}
              </div>

              <h2 className="text-3xl font-black text-white leading-tight tracking-tighter italic uppercase">
                {workoutName}
              </h2>
              {description && <p className="text-zinc-500 text-sm mt-1 font-medium">{description}</p>}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-800 bg-zinc-900/30">
              <button
                onClick={() => setActiveTab('training')}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === 'training' 
                    ? 'bg-zinc-800 text-[#00FF80] border-b-2 border-[#00FF80]' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Protocolo de Treino
              </button>
              <button
                onClick={() => setActiveTab('nutrition')}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === 'nutrition' 
                    ? 'bg-zinc-800 text-[#FF4E00] border-b-2 border-[#FF4E00]' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Suporte Nutricional
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
              <AnimatePresence mode="wait">
                {activeTab === 'training' ? (
                  <motion.div
                    key="training"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    {/* Exercises with Tips */}
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 text-[#FFD700]">
                        <Lightbulb size={18} />
                        <h3 className="font-black uppercase tracking-widest text-xs">Dicas de Execução</h3>
                      </div>
                      
                      <div className="grid gap-4">
                        {exercises.map((ex, i) => (
                          <div key={i} className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800 group hover:border-zinc-700 transition-all">
                            <div className="flex items-start gap-4">
                              <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-[#FFD700] font-black text-xs shrink-0 border border-zinc-700">
                                {i + 1}
                              </div>
                              <div className="flex-1 space-y-3">
                                <h4 className="text-white font-black text-lg tracking-tight uppercase italic">{ex}</h4>
                                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                                  <p className="text-zinc-400 text-sm leading-relaxed">
                                    {EXERCISE_TIPS[ex] || "Foco na cadência controlada (2s descida, 1s subida). Mantenha a conexão mente-músculo e respiração constante."}
                                  </p>
                                </div>
                                {onUpdateNote && (
                                  <textarea 
                                    placeholder="Suas notas para este exercício..."
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300 focus:outline-none focus:border-[#FFD700] transition-all resize-none h-20"
                                    value={exerciseNotes[ex] || ''}
                                    onChange={(e) => onUpdateNote(ex, e.target.value)}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Cardio Importance */}
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 text-[#3B82F6]">
                        <Zap size={18} />
                        <h3 className="font-black uppercase tracking-widest text-xs">Importância do Cardio</h3>
                      </div>
                      
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#3B82F6]/10 to-transparent border border-[#3B82F6]/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Activity size={80} className="text-[#3B82F6]" />
                        </div>
                        
                        <div className="relative z-10">
                          <h4 className="text-white font-black text-xl mb-2 italic uppercase tracking-tighter">{cardio.title}</h4>
                          <p className="text-zinc-400 text-sm leading-relaxed mb-6">{cardio.desc}</p>
                          
                          <div className="p-5 rounded-2xl bg-black/60 border border-white/5 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-3 text-[#3B82F6]">
                              <Info size={16} />
                              <h5 className="text-[10px] font-black uppercase tracking-widest">Visão Tática</h5>
                            </div>
                            <p className="text-zinc-300 text-xs leading-relaxed">
                              O cardio neste protocolo não é apenas para queima calórica. Ele atua na <span className="text-white font-bold">eficiência mitocondrial</span>, melhora a <span className="text-white font-bold">recuperação entre as séries</span> de musculação e aumenta o seu <span className="text-white font-bold">teto de performance</span>. Ignorar o cardio é limitar o seu progresso de força e longevidade atlética.
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>
                  </motion.div>
                ) : (
                  <motion.div
                    key="nutrition"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Fasting Status */}
                    <div className={`p-6 rounded-2xl border ${
                      isFasting 
                        ? 'bg-[#FF4E00]/10 border-[#FF4E00]/30' 
                        : 'bg-zinc-900/50 border-zinc-800'
                    }`}>
                      <div className="flex items-center gap-4 mb-2">
                        <div className={`p-3 rounded-xl ${isFasting ? 'bg-[#FF4E00] text-white shadow-[0_0_15px_rgba(255,78,0,0.3)]' : 'bg-zinc-800 text-zinc-500'}`}>
                          <Flame size={24} />
                        </div>
                        <div>
                          <h4 className={`font-black uppercase italic tracking-tight text-lg ${isFasting ? 'text-[#FF4E00]' : 'text-zinc-400'}`}>
                            {isFasting ? 'Protocolo de Jejum Ativo' : 'Alimentação Padrão'}
                          </h4>
                          <p className="text-xs text-zinc-500 font-medium">
                            {isFasting 
                              ? 'Siga rigorosamente a janela de alimentação para otimização hormonal.' 
                              : 'Mantenha a constância nos macros para suporte à recuperação.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Macros Targets */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800">
                        <div className="flex items-center gap-2 mb-3 text-zinc-500">
                          <Target size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Teto Calórico</span>
                        </div>
                        <p className="text-3xl font-black text-white tracking-tighter">{caloriesTarget}</p>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase mt-1">kcal / dia</p>
                      </div>
                      <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800">
                        <div className="flex items-center gap-2 mb-3 text-zinc-500">
                          <Utensils size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Proteína Alvo</span>
                        </div>
                        <p className="text-3xl font-black text-white tracking-tighter">{proteinTarget}g</p>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase mt-1">mínimo / dia</p>
                      </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2 text-blue-400">
                        <Info size={16} />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Dica de Hidratação</h4>
                      </div>
                      <p className="text-zinc-300 text-sm leading-relaxed">
                        A hidratação é o combustível silencioso. Mantenha a ingestão de água constante, especialmente durante o treino e janelas de jejum. Meta: 35-40ml por kg.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Action */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-xs text-zinc-500 hover:text-white transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  onAskAI();
                  onClose();
                }}
                className="flex-[2] py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 bg-[#00FF80] text-black hover:bg-[#00FF80]/90 transition-all shadow-[0_0_20px_rgba(0,255,128,0.2)]"
              >
                <Sparkles size={18} />
                Análise com Frya
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
