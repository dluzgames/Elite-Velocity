import React, { useState, useMemo } from 'react';
import { Profile } from '@/types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, X, Scale, Droplets, Dumbbell, StickyNote, Check, Footprints, Calendar } from 'lucide-react';
import { getWorkoutSplit } from '@/utils/workout-logic';
import { addDays, isBefore, startOfDay } from 'date-fns';

interface MetricsProps {
  profile: Profile;
  onDelete: () => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#151619] border border-zinc-800 p-3 rounded-lg shadow-xl">
        <p className="text-zinc-400 text-xs font-bold uppercase mb-1">Dia {label}</p>
        <p className="text-[#00FF80] font-mono font-bold text-lg">
          {payload[0].value}kg
        </p>
        <p className="text-zinc-500 text-[10px] mt-1 uppercase tracking-wider">Clique para detalhes</p>
      </div>
    );
  }
  return null;
};

export default function Metrics({ profile, onDelete }: MetricsProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const data = Object.entries(profile.dailyLogs)
    .map(([day, log]) => ({
      day: parseInt(day),
      weight: log.weight ? parseFloat(log.weight.toString()) : null,
      speed: log.maxSpeed ? parseFloat(log.maxSpeed.toString()) : null,
      completed: log.completed
    }))
    .sort((a, b) => a.day - b.day);

  // Calculate consistency
  const totalDays = parseInt(profile.duration);
  const completedDays = Object.values(profile.dailyLogs).filter(l => l.completed).length;
  const consistency = Math.round((completedDays / totalDays) * 100);

  // Heatmap Data
  const heatmapDays = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Memoize split
  const split = useMemo(() => 
    getWorkoutSplit(profile.gender, profile.focuses, profile.workoutProtocol),
    [profile.gender, profile.focuses, profile.workoutProtocol]
  );

  const startDate = useMemo(() => new Date(profile.startDate), [profile.startDate]);
  const today = startOfDay(new Date());

  const selectedLog = selectedDay ? profile.dailyLogs[selectedDay] : null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weight Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-6 rounded-2xl"
        >
          <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Evolução de Peso</h3>
          <div className="h-64 w-full cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={data}
                onClick={(e) => {
                  if (e && e.activeLabel) {
                    setSelectedDay(parseInt(e.activeLabel));
                  }
                }}
              >
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF80" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00FF80" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="day" stroke="#666" tick={{fontSize: 12}} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#666" tick={{fontSize: 12}} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#00FF80" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorWeight)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Consistency & Stats */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 rounded-2xl flex flex-col justify-between"
        >
          <div>
            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Taxa de Consistência</h3>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-6xl font-black text-white tracking-tighter">{consistency}%</span>
              <span className="text-zinc-500 mb-2 font-mono">DA MISSÃO</span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${consistency}%` }}
                className="h-full bg-[#00FF80]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-zinc-900/50 p-4 rounded-xl">
              <p className="text-xs text-zinc-500 uppercase">Dias Concluídos</p>
              <p className="text-2xl font-bold text-white">{completedDays} <span className="text-zinc-600">/ {totalDays}</span></p>
            </div>
            <div className="bg-zinc-900/50 p-4 rounded-xl">
              <p className="text-xs text-zinc-500 uppercase">Peso Inicial</p>
              <p className="text-2xl font-bold text-white">{profile.weight}kg</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Discipline Matrix (Detailed Grid) */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-panel p-6 rounded-2xl"
      >
        <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6">Jornada da Missão</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {heatmapDays.map(day => {
            const log = profile.dailyLogs[day];
            const isDone = log?.completed;
            const distance = log?.distanceRun;
            
            // Calculate workout name
            const date = addDays(startDate, day - 1);
            const dayOfWeek = date.getDay();
            const isPast = isBefore(date, today);
            
            let workoutName = "Descanso";
            if (dayOfWeek !== 0) {
              const splitIndex = dayOfWeek - 1;
              if (split[splitIndex]) {
                // Get first 2 words of workout name for brevity
                workoutName = split[splitIndex].main.split(' ').slice(0, 2).join(' ');
              }
            }

            return (
              <div 
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`p-3 rounded-xl border transition-all cursor-pointer hover:scale-105 flex flex-col justify-between h-24 relative overflow-hidden ${
                  isDone 
                    ? 'bg-[#00FF80]/10 border-[#00FF80]/30 hover:bg-[#00FF80]/20' 
                    : isPast 
                      ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-bold ${isDone ? 'text-[#00FF80]' : 'text-zinc-500'}`}>DIA {day}</span>
                  {isDone ? (
                    <Check size={14} className="text-[#00FF80]" />
                  ) : isPast ? (
                    <X size={14} className="text-red-500/50" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-zinc-700" />
                  )}
                </div>
                
                <div>
                  <p className="text-xs font-medium text-white truncate leading-tight mb-1">{workoutName}</p>
                  {distance && distance > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-blue-400 font-mono">
                      <Footprints size={10} />
                      <span>{distance}km</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Detailed Summary Section */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="glass-panel p-6 rounded-2xl border border-zinc-800">
          <h4 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4">Volume de Corrida</h4>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-white">
              {Object.values(profile.dailyLogs).reduce((acc, log) => acc + (log.distanceRun || 0), 0).toFixed(1)}
            </span>
            <span className="text-zinc-500 mb-1 font-mono text-xs">KM TOTAIS</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-zinc-800">
          <h4 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4">Hidratação Acumulada</h4>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-white">
              {(Object.values(profile.dailyLogs).reduce((acc, log) => acc + (log.water || 0), 0) / 1000).toFixed(1)}
            </span>
            <span className="text-zinc-500 mb-1 font-mono text-xs">LITROS</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-zinc-800">
          <h4 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4">Média de Proteína</h4>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-white">
              {completedDays > 0 
                ? Math.round(Object.values(profile.dailyLogs).reduce((acc, log) => acc + (log.protein || 0), 0) / completedDays)
                : 0}
            </span>
            <span className="text-zinc-500 mb-1 font-mono text-xs">G / DIA</span>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-4 justify-end">
        <button 
          onClick={() => {
            if (confirm("Tem certeza que deseja apagar este agente? A ação é irreversível.")) {
              onDelete();
            }
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 text-red-500 border border-red-600/50 hover:bg-red-600/30 transition-colors"
        >
          <Trash2 size={18} />
          Apagar Agente
        </button>
      </div>

      {/* Day Details Modal */}
      <AnimatePresence>
        {selectedDay && selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#111] border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <div>
                  <h3 className="text-zinc-500 font-bold uppercase text-xs tracking-widest">Relatório do Dia</h3>
                  <h2 className="text-2xl font-black text-white">DIA {selectedDay}</h2>
                </div>
                <button 
                  onClick={() => setSelectedDay(null)}
                  className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status */}
                <div className={`p-3 rounded-xl border flex items-center justify-center gap-2 ${
                  selectedLog.completed 
                    ? 'bg-[#00FF80]/10 border-[#00FF80]/30 text-[#00FF80]' 
                    : 'bg-red-500/10 border-red-500/30 text-red-500'
                }`}>
                  <span className="font-bold uppercase tracking-widest">
                    {selectedLog.completed ? 'Missão Cumprida' : 'Missão Incompleta'}
                  </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-900/30 p-3 rounded-xl border border-zinc-800">
                    <div className="flex items-center gap-2 mb-1 text-zinc-500">
                      <Scale size={14} />
                      <span className="text-xs font-bold uppercase">Peso</span>
                    </div>
                    <p className="text-xl font-mono font-bold text-white">
                      {selectedLog.weight ? `${selectedLog.weight}kg` : '--'}
                    </p>
                  </div>
                  
                  <div className="bg-zinc-900/30 p-3 rounded-xl border border-zinc-800">
                    <div className="flex items-center gap-2 mb-1 text-blue-500">
                      <Droplets size={14} />
                      <span className="text-xs font-bold uppercase">Água</span>
                    </div>
                    <p className="text-xl font-mono font-bold text-white">
                      {selectedLog.water}ml
                    </p>
                  </div>

                  <div className="bg-zinc-900/30 p-3 rounded-xl border border-zinc-800">
                    <div className="flex items-center gap-2 mb-1 text-purple-500">
                      <Dumbbell size={14} />
                      <span className="text-xs font-bold uppercase">Proteína</span>
                    </div>
                    <p className="text-xl font-mono font-bold text-white">
                      {selectedLog.protein}g
                    </p>
                  </div>

                  <div className="bg-zinc-900/30 p-3 rounded-xl border border-zinc-800">
                    <div className="flex items-center gap-2 mb-1 text-yellow-500">
                      <StickyNote size={14} />
                      <span className="text-xs font-bold uppercase">Notas</span>
                    </div>
                    <p className="text-sm text-zinc-400 truncate">
                      {selectedLog.exerciseNotes ? Object.keys(selectedLog.exerciseNotes).length : 0} notas
                    </p>
                  </div>
                </div>

                {/* Exercise Notes Preview */}
                {selectedLog.exerciseNotes && Object.keys(selectedLog.exerciseNotes).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Notas de Treino</h4>
                    <div className="bg-zinc-900/30 rounded-xl border border-zinc-800 p-3 max-h-32 overflow-y-auto space-y-2">
                      {Object.entries(selectedLog.exerciseNotes).map(([exercise, note]) => (
                        <div key={exercise} className="text-sm">
                          <span className="text-[#00FF80] font-bold block text-xs">{exercise}</span>
                          <span className="text-zinc-400">{note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
