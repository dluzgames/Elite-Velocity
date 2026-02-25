import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Profile } from '@/types';
import { getWorkoutSplit, getCardioDetail } from '@/utils/workout-logic';
import { Check, X } from 'lucide-react';

interface SpreadsheetViewProps {
  profile: Profile;
  currentDay: number;
  onToggleDay: (day: number) => void;
}

export default function SpreadsheetView({ profile, currentDay, onToggleDay }: SpreadsheetViewProps) {
  const duration = parseInt(profile.duration);
  const startDate = useMemo(() => new Date(profile.startDate), [profile.startDate]);
  
  // Memoize split to avoid recalculation on every render
  const split = useMemo(() => 
    getWorkoutSplit(profile.gender, profile.focuses, profile.workoutProtocol),
    [profile.gender, profile.focuses, profile.workoutProtocol]
  );

  const rows = useMemo(() => {
    const data = [];
    for (let i = 1; i <= duration; i++) {
      const date = addDays(startDate, i - 1);
      const dayOfWeek = date.getDay();
      
      let workoutName = "Descanso / Recuperação";
      if (dayOfWeek !== 0) {
        const splitIndex = dayOfWeek - 1;
        if (split[splitIndex]) {
          workoutName = split[splitIndex].main;
        }
      }

      const cardio = getCardioDetail(
        dayOfWeek,
        i,
        profile.focuses,
        profile.footballDays,
        profile.runDays,
        profile.runDistances
      );

      const isCompleted = profile.dailyLogs[i]?.completed;
      const isToday = i === currentDay;

      data.push({
        day: i,
        date: format(date, 'dd/MM'),
        weekDay: format(date, 'EEE', { locale: ptBR }).toUpperCase(),
        workout: workoutName,
        cardio,
        isCompleted,
        isToday,
        isFasting: profile.fastingDays.includes(dayOfWeek)
      });
    }
    return data;
  }, [duration, startDate, split, profile, currentDay]);

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
            <th className="p-4">Dia</th>
            <th className="p-4">Data</th>
            <th className="p-4">Treino</th>
            <th className="p-4">Cardio</th>
            <th className="p-4 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <motion.tr 
              key={row.day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: row.day * 0.01 }} // Stagger effect
              className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${
                row.isToday ? 'bg-[#00FF80]/5 border-l-2 border-l-[#00FF80]' : ''
              } ${row.isCompleted ? 'opacity-50' : ''}`}
            >
              <td className="p-4 font-mono text-zinc-400">
                {String(row.day).padStart(2, '0')}
              </td>
              <td className="p-4">
                <div className="flex flex-col">
                  <span className="font-bold text-white">{row.date}</span>
                  <span className="text-xs text-zinc-500">{row.weekDay}</span>
                </div>
              </td>
              <td className="p-4">
                <span className={`font-bold ${row.isFasting ? 'text-[#FF4E00]' : 'text-zinc-300'}`}>
                  {row.workout}
                </span>
              </td>
              <td className="p-4 text-sm text-zinc-400 max-w-xs truncate">
                {row.cardio}
              </td>
              <td className="p-4 text-center">
                <button
                  onClick={() => onToggleDay(row.day)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    row.isCompleted 
                      ? 'bg-[#00FF80] text-black shadow-[0_0_10px_rgba(0,255,128,0.3)]' 
                      : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700'
                  }`}
                >
                  {row.isCompleted ? <Check size={16} /> : <div className="w-2 h-2 rounded-full bg-zinc-600" />}
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
