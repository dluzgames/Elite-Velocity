'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, Calendar, Dumbbell, Activity, Flame } from 'lucide-react';
import { Profile } from '@/types';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getWorkoutSplit, getCardioDetail } from '@/utils/workout-logic';

interface FullProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
}

export default function FullProtocolModal({ isOpen, onClose, profile }: FullProtocolModalProps) {
  const duration = parseInt(profile.duration);
  const startDate = new Date(profile.startDate);
  const split = getWorkoutSplit(profile.gender, profile.focuses, profile.workoutProtocol);

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="w-full max-w-5xl bg-white text-black min-h-screen md:min-h-0 md:rounded-3xl shadow-2xl overflow-hidden flex flex-col print:shadow-none print:rounded-none"
          >
            {/* Toolbar - Hidden on Print */}
            <div className="p-4 bg-zinc-100 border-b border-zinc-200 flex justify-between items-center print:hidden">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-zinc-600" />
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Protocolo Completo</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handlePrint}
                  className="p-2 rounded-lg bg-black text-white hover:bg-zinc-800 transition-colors flex items-center gap-2 px-4 text-xs font-bold"
                >
                  <Printer size={16} />
                  IMPRIMIR
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-lg bg-zinc-200 text-zinc-600 hover:bg-zinc-300 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-8 md:p-12 overflow-y-auto flex-1 print:p-0">
              {/* Header */}
              <div className="border-b-4 border-black pb-8 mb-8 flex justify-between items-end">
                <div>
                  <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">ELITE VELOCITY</h1>
                  <p className="text-xl font-bold mt-2 text-zinc-600">PROTOCOLO TÁTICO DE MISSÃO</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase text-zinc-400">Agente</p>
                  <p className="text-2xl font-black uppercase">{profile.studentName}</p>
                </div>
              </div>

              {/* Summary Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                <div>
                  <p className="text-[10px] font-bold uppercase text-zinc-400 mb-1">Duração</p>
                  <p className="font-bold">{profile.duration} Dias</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-zinc-400 mb-1">Início</p>
                  <p className="font-bold">{format(startDate, 'dd/MM/yyyy')}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-zinc-400 mb-1">Jejum</p>
                  <p className="font-bold">{profile.protocol}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-zinc-400 mb-1">Peso Alvo</p>
                  <p className="font-bold">-{profile.targetLostWeight}kg</p>
                </div>
              </div>

              {/* Full Schedule Table */}
              <div className="space-y-4">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] border-b border-zinc-200 pb-2 mb-6">Cronograma Detalhado</h2>
                
                <div className="grid grid-cols-1 gap-4">
                  {Array.from({ length: duration }).map((_, i) => {
                    const day = i + 1;
                    const date = addDays(startDate, i);
                    const dayOfWeek = date.getDay();
                    
                    let workoutName = "Descanso / Recuperação";
                    let exercises: string[] = ["Mobilidade", "Alongamento"];

                    if (dayOfWeek !== 0) {
                      const splitIndex = dayOfWeek - 1;
                      if (split[splitIndex]) {
                        workoutName = split[splitIndex].main;
                        exercises = split[splitIndex].exercises;
                      }
                    }

                    const cardio = getCardioDetail(
                      dayOfWeek,
                      day,
                      profile
                    );

                    const isFasting = profile.fastingDays?.includes(dayOfWeek) || false;

                    return (
                      <div key={day} className="border border-zinc-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 break-inside-avoid">
                        <div className="w-16 shrink-0 flex flex-col items-center justify-center border-r border-zinc-100 pr-4">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase">Dia</span>
                          <span className="text-2xl font-black">{day}</span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-zinc-500 uppercase">{format(date, 'EEEE, dd/MM', { locale: ptBR })}</span>
                            {isFasting && (
                              <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Jejum</span>
                            )}
                          </div>
                          <h3 className="font-black text-lg uppercase">{workoutName}</h3>
                          <p className="text-xs text-zinc-500 mt-1">
                            <span className="font-bold text-zinc-700">Musculação:</span> {exercises.join(', ')}
                          </p>
                        </div>

                        <div className="flex-1 md:border-l md:border-zinc-100 md:pl-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Activity size={12} className="text-blue-500" />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase">Cardio / Metabólico</span>
                          </div>
                          <h4 className="font-bold text-sm uppercase">{cardio.title}</h4>
                          <p className="text-xs text-zinc-500 mt-0.5">{cardio.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-12 pt-8 border-t border-zinc-200 text-center">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Elite Velocity Protocol © 2026</p>
                <p className="text-xs text-zinc-300 mt-2">Apenas o progresso importa. Sem desculpas.</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
