'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Profile } from '@/types';
import { 
  Shield, 
  Target, 
  Zap, 
  Flame, 
  Clock, 
  Dumbbell, 
  Calendar, 
  User,
  Scale,
  Ruler,
  Activity
} from 'lucide-react';
import { FASTING_PROTOCOLS, FOCUS_OPTIONS, WEEK_DAYS, WORKOUT_PROTOCOLS } from '@/utils/constants';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProtocolViewProps {
  profile: Profile;
}

export default function ProtocolView({ profile }: ProtocolViewProps) {
  const fastingProtocol = FASTING_PROTOCOLS[profile.protocol as keyof typeof FASTING_PROTOCOLS];
  const workoutProtocol = WORKOUT_PROTOCOLS.find(p => p.id === profile.workoutProtocol);
  
  const focusLabels = profile.focuses.map(f => 
    FOCUS_OPTIONS.find(opt => opt.id === f)?.label || f
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section - Mission Contract Style */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 rounded-3xl border-l-8 border-[#00FF80] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <Shield size={200} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-[#00FF80]" size={24} />
            <span className="text-xs font-black text-[#00FF80] uppercase tracking-[0.3em]">Contrato de Missão Ativo</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 uppercase">
            PROTOCOLO <span className="text-[#00FF80]">{profile.studentName}</span>
          </h1>
          
          <div className="flex flex-wrap gap-6 mt-8">
            <div className="flex flex-col">
              <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Início da Jornada</span>
              <span className="text-white font-mono font-bold">{format(new Date(profile.startDate), "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Duração Total</span>
              <span className="text-white font-mono font-bold">{profile.duration} DIAS ININTERRUPTOS</span>
            </div>
            <div className="flex flex-col">
              <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Status</span>
              <span className="text-[#00FF80] font-mono font-bold">EM EXECUÇÃO</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Biometrics & Goals */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 rounded-2xl border border-zinc-800"
        >
          <div className="flex items-center gap-2 mb-6">
            <User className="text-zinc-400" size={18} />
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Perfil Biométrico</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-3">
                <Scale size={16} className="text-zinc-500" />
                <span className="text-sm text-zinc-400">Peso Inicial</span>
              </div>
              <span className="font-bold text-white">{profile.weight} kg</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-3">
                <Ruler size={16} className="text-zinc-500" />
                <span className="text-sm text-zinc-400">Altura</span>
              </div>
              <span className="font-bold text-white">{profile.height} cm</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-[#00FF80]/5 rounded-xl border border-[#00FF80]/20">
              <div className="flex items-center gap-3">
                <Target size={16} className="text-[#00FF80]" />
                <span className="text-sm text-[#00FF80]">Meta de Perda</span>
              </div>
              <span className="font-bold text-[#00FF80]">-{profile.targetLostWeight} kg</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-blue-500/5 rounded-xl border border-blue-500/20">
              <div className="flex items-center gap-3">
                <Activity size={16} className="text-blue-500" />
                <span className="text-sm text-blue-500">Distância Alvo</span>
              </div>
              <span className="font-bold text-blue-500">{profile.targetDistance} km</span>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Focos Táticos</h4>
            <div className="flex flex-wrap gap-2">
              {focusLabels.map((label, i) => (
                <span key={i} className="px-2 py-1 bg-zinc-800 text-zinc-300 text-[10px] font-bold rounded uppercase border border-zinc-700">
                  {label}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Nutrition & Fasting */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6 rounded-2xl border border-zinc-800"
        >
          <div className="flex items-center gap-2 mb-6">
            <Flame className="text-[#FF4E00]" size={18} />
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Protocolo Nutricional</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-[#FF4E00]/5 rounded-xl border border-[#FF4E00]/20">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-[#FF4E00]" />
                <span className="text-xs font-bold text-[#FF4E00] uppercase">Jejum Intermitente</span>
              </div>
              <p className="text-xl font-black text-white">{fastingProtocol?.label || profile.protocol}</p>
              <p className="text-xs text-zinc-500 mt-1">{fastingProtocol?.desc}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={14} className="text-zinc-500" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Início Janela</span>
                </div>
                <p className="text-lg font-bold text-white">{profile.startHour}</p>
              </div>
              <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={14} className="text-zinc-500" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Dias de Jejum</span>
                </div>
                <div className="flex gap-1">
                  {profile.fastingDays.map(d => (
                    <span key={d} className="text-xs font-bold text-[#FF4E00]">{WEEK_DAYS[d][0]}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-800">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Diretrizes Alimentares</h4>
              <ul className="text-xs text-zinc-400 space-y-2">
                <li className="flex gap-2">
                  <span className="text-[#00FF80]">•</span>
                  Priorize proteínas magras em todas as refeições.
                </li>
                <li className="flex gap-2">
                  <span className="text-[#00FF80]">•</span>
                  Mantenha a hidratação acima de 35ml/kg.
                </li>
                <li className="flex gap-2">
                  <span className="text-[#00FF80]">•</span>
                  Evite ultraprocessados e açúcares refinados.
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Training & Performance */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-6 rounded-2xl border border-zinc-800"
        >
          <div className="flex items-center gap-2 mb-6">
            <Dumbbell className="text-blue-500" size={18} />
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Estratégia de Treino</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={16} className="text-blue-500" />
                <span className="text-xs font-bold text-blue-500 uppercase">Protocolo de Musculação</span>
              </div>
              <p className="text-xl font-black text-white">{workoutProtocol?.label || profile.workoutProtocol}</p>
              <p className="text-xs text-zinc-500 mt-1">{workoutProtocol?.desc}</p>
            </div>

            <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-800">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Mentalidade Elite</h4>
              <p className="text-xs text-zinc-500 italic leading-relaxed">
                &quot;A disciplina é a ponte entre metas e realizações. Cada treino ignorado é uma oportunidade perdida de superar sua versão anterior.&quot;
              </p>
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <p className="text-[10px] text-zinc-600 uppercase font-black tracking-tighter">Assinatura Digital do Agente</p>
                <p className="text-sm font-serif italic text-zinc-400 mt-1">{profile.studentName}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
