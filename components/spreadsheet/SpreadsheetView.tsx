import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Profile } from '@/types';
import { getWorkoutSplit, getCardioDetail } from '@/utils/workout-logic';
import { calculateCaloriesTarget, calculateProteinTarget } from '@/utils/nutrition-logic';
import { Check, X, Calendar, Dumbbell, Activity, ChevronRight, FileText } from 'lucide-react';
import WorkoutDetailsModal from '@/components/dashboard/WorkoutDetailsModal';
import FullProtocolModal from '@/components/spreadsheet/FullProtocolModal';

interface SpreadsheetViewProps {
  profile: Profile;
  currentDay: number;
  onToggleDay: (day: number) => void;
  onAskAI: (prompt: string) => void;
}

export default function SpreadsheetView({ profile, currentDay, onToggleDay, onAskAI }: SpreadsheetViewProps) {
  const duration = parseInt(profile.duration);
  const startDate = useMemo(() => new Date(profile.startDate), [profile.startDate]);
  const [selectedWorkout, setSelectedWorkout] = useState<{
    day: number, 
    name: string, 
    desc?: string, 
    exercises: string[], 
    cardio: { title: string; desc: string },
    isFasting: boolean,
    isCompleted: boolean
  } | null>(null);
  const [isFullProtocolOpen, setIsFullProtocolOpen] = useState(false);
  
  // Memoize split to avoid recalculation on every render
  const split = useMemo(() => 
    getWorkoutSplit(profile.gender, profile.focuses, profile.workoutProtocol),
    [profile.gender, profile.focuses, profile.workoutProtocol]
  );

  const caloriesTarget = useMemo(() => calculateCaloriesTarget(profile), [profile]);
  const proteinTarget = useMemo(() => calculateProteinTarget(profile), [profile]);

  const rows = useMemo(() => {
    const data = [];
    for (let i = 1; i <= duration; i++) {
      const date = addDays(startDate, i - 1);
      const dayOfWeek = date.getDay();
      
      let workoutName = "Descanso / Recuperação";
      let workoutDesc = "Recuperação ativa e mobilidade.";
      let exercises: string[] = ["Alongamento", "Mobilidade", "Caminhada Leve"];

      if (dayOfWeek !== 0) {
        const splitIndex = dayOfWeek - 1;
        if (split[splitIndex]) {
          workoutName = split[splitIndex].main;
          workoutDesc = split[splitIndex].desc;
          exercises = split[splitIndex].exercises;
        }
      }

      const cardio = getCardioDetail(
        dayOfWeek,
        i,
        profile
      );

      const isCompleted = profile.dailyLogs[i]?.completed || false;
      const isToday = i === currentDay;
      const isFasting = profile.fastingDays?.includes(dayOfWeek) || false;

      data.push({
        day: i,
        date: format(date, 'dd/MM'),
        weekDay: format(date, 'EEE', { locale: ptBR }).toUpperCase(),
        workout: workoutName,
        desc: workoutDesc,
        exercises,
        cardio,
        isCompleted,
        isToday,
        isFasting
      });
    }
    return data;
  }, [duration, startDate, split, profile, currentDay]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0A0A0A] rounded-2xl overflow-hidden border border-zinc-800">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Calendar className="text-[#00FF80]" size={20} />
            PLANILHA DE MISSÕES
          </h2>
          <p className="text-zinc-500 text-sm font-mono">VISÃO GERAL DO PROTOCOLO</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsFullProtocolOpen(true)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-white text-xs font-bold uppercase hover:bg-zinc-700 transition-colors"
          >
            <FileText size={16} />
            Ver Protocolo Completo
          </button>
          <div className="flex gap-4 text-xs font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00FF80]" />
              <span className="text-zinc-400">Concluído</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FF4E00]" />
              <span className="text-zinc-400">Jejum</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white" />
              <span className="text-zinc-400">Hoje</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto relative">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-[#0A0A0A] shadow-lg">
            <tr className="text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
              <th className="p-4 w-20 text-center">Dia</th>
              <th className="p-4 w-32">Data</th>
              <th className="p-4">Treino Principal</th>
              <th className="p-4 hidden md:table-cell">Cardio / Metabólico</th>
              <th className="p-4 w-24 text-center">Status</th>
              <th className="p-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {rows.map((row) => (
              <motion.tr 
                key={row.day}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                onClick={() => setSelectedWorkout({ 
                  day: row.day, 
                  name: row.workout, 
                  desc: row.desc,
                  exercises: row.exercises, 
                  cardio: row.cardio,
                  isFasting: row.isFasting,
                  isCompleted: row.isCompleted
                })}
                className={`cursor-pointer transition-colors group ${
                  row.isToday ? 'bg-[#00FF80]/5' : ''
                } ${row.isCompleted ? 'opacity-60 hover:opacity-100' : ''}`}
              >
                <td className="p-4 text-center">
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-mono font-bold text-sm ${
                    row.isToday ? 'bg-[#00FF80] text-black' : 'bg-zinc-900 text-zinc-500'
                  }`}>
                    {String(row.day).padStart(2, '0')}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className={`font-bold ${row.isToday ? 'text-[#00FF80]' : 'text-white'}`}>
                      {row.date}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">{row.weekDay}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${row.isFasting ? 'bg-[#FF4E00]/10 text-[#FF4E00]' : 'bg-zinc-800 text-zinc-400'}`}>
                      <Dumbbell size={16} />
                    </div>
                    <div>
                      <span className={`font-bold block ${row.isCompleted ? 'text-zinc-400 line-through' : 'text-white'}`}>
                        {row.workout}
                      </span>
                      <span className="text-xs text-zinc-500 hidden sm:block">
                        {row.exercises.length} exercícios
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell">
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Activity size={14} className="text-blue-500 shrink-0" />
                    <span className="truncate max-w-xs">{row.cardio.title}</span>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleDay(row.day);
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all mx-auto ${
                      row.isCompleted 
                        ? 'bg-[#00FF80] text-black shadow-[0_0_10px_rgba(0,255,128,0.3)] hover:bg-[#00CC66]' 
                        : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700 hover:text-zinc-400'
                    }`}
                  >
                    {row.isCompleted ? <Check size={16} /> : <div className="w-2 h-2 rounded-full bg-zinc-600" />}
                  </button>
                </td>
                <td className="p-4 text-center">
                  <ChevronRight size={16} className="text-zinc-700 group-hover:text-white transition-colors" />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <WorkoutDetailsModal 
        isOpen={!!selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
        day={selectedWorkout?.day || 0}
        workoutName={selectedWorkout?.name || ''}
        description={selectedWorkout?.desc || ''}
        exercises={selectedWorkout?.exercises || []}
        cardio={selectedWorkout?.cardio || { title: '', desc: '' }}
        isFasting={selectedWorkout?.isFasting || false}
        isCompleted={selectedWorkout?.isCompleted || false}
        caloriesTarget={caloriesTarget}
        proteinTarget={proteinTarget}
        onAskAI={() => {
          if (selectedWorkout) {
            const prompt = `Analise o treino do Dia ${selectedWorkout.day}: "${selectedWorkout.name}". 
            
            Descrição: ${selectedWorkout.desc}
            
            Exercícios de Musculação: ${selectedWorkout.exercises.join(', ')}.
            
            Protocolo de Cardio: ${selectedWorkout.cardio.title}.
            Detalhes do Cardio: ${selectedWorkout.cardio.desc}
            
            Me dê dicas de execução e estratégia para esse treino completo (musculação + cardio). Explique como encaixar o cardio (antes ou depois) e a intensidade ideal.`;
            onAskAI(prompt);
          }
        }}
      />

      <FullProtocolModal 
        isOpen={isFullProtocolOpen}
        onClose={() => setIsFullProtocolOpen(false)}
        profile={profile}
      />
    </div>
  );
}
