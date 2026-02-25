import React from 'react';
import { Profile } from '@/types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'motion/react';
import { Download, Trash2 } from 'lucide-react';
import { generateExcel } from '@/utils/exporters';

interface MetricsProps {
  profile: Profile;
  onDelete: () => void;
}

export default function Metrics({ profile, onDelete }: MetricsProps) {
  const data = Object.entries(profile.dailyLogs)
    .map(([day, log]) => ({
      day: parseInt(day),
      weight: log.weight ? parseFloat(log.weight.toString()) : null,
      speed: log.maxSpeed ? parseFloat(log.maxSpeed.toString()) : null,
    }))
    .sort((a, b) => a.day - b.day);

  // Calculate consistency
  const totalDays = parseInt(profile.duration);
  const completedDays = Object.values(profile.dailyLogs).filter(l => l.completed).length;
  const consistency = Math.round((completedDays / totalDays) * 100);

  // Heatmap Data
  const heatmapDays = Array.from({ length: totalDays }, (_, i) => i + 1);

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
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF80" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00FF80" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="day" stroke="#666" tick={{fontSize: 12}} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#666" tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151619', borderColor: '#333', borderRadius: '8px' }}
                  itemStyle={{ color: '#00FF80' }}
                />
                <Area type="monotone" dataKey="weight" stroke="#00FF80" strokeWidth={2} fillOpacity={1} fill="url(#colorWeight)" />
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

      {/* Discipline Matrix (Heatmap) */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-panel p-6 rounded-2xl"
      >
        <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6">Matriz de Disciplina</h3>
        <div className="grid grid-cols-7 md:grid-cols-10 lg:grid-cols-14 gap-2">
          {heatmapDays.map(day => {
            const log = profile.dailyLogs[day];
            const isDone = log?.completed;
            const hasWeight = log?.weight;
            
            return (
              <div 
                key={day}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center relative group transition-all ${
                  isDone 
                    ? 'bg-[#00FF80] text-black shadow-[0_0_10px_rgba(0,255,128,0.2)]' 
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-600'
                }`}
              >
                <span className="text-xs font-bold">{day}</span>
                {hasWeight && <span className="text-[8px] font-mono opacity-70">{log.weight}</span>}
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 bg-black border border-zinc-800 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                  Dia {day} {isDone ? '✅' : '❌'}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <div className="flex gap-4 justify-end">
        <button 
          onClick={() => generateExcel(profile)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 text-blue-500 border border-blue-600/50 hover:bg-blue-600/30 transition-colors"
        >
          <Download size={18} />
          Exportar Planilha
        </button>
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
    </div>
  );
}
