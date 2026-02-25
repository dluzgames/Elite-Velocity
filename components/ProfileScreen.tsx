import React, { useState } from 'react';
import { Profile } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, User, Trophy, X, Calendar, CheckCircle, Circle } from 'lucide-react';
import { getFullWorkoutHistory } from '@/utils/workout-logic';

interface ProfileScreenProps {
  profiles: Record<string, Profile>;
  onSelectProfile: (id: string) => void;
  onNewProfile: () => void;
}

export default function ProfileScreen({ profiles, onSelectProfile, onNewProfile }: ProfileScreenProps) {
  const profileList = Object.values(profiles);
  const [selectedHistoryProfile, setSelectedHistoryProfile] = useState<Profile | null>(null);

  return (
    <div className="min-h-screen p-8 bg-[#0A0A0A] text-white flex flex-col items-center">
      <h1 className="text-4xl font-black text-[#00FF80] mb-12 tracking-tighter text-center">
        SELECIONE O AGENTE
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {profileList.map(profile => (
          <motion.div
            key={profile.id}
            whileHover={{ scale: 1.02, borderColor: '#00FF80' }}
            className="glass-panel p-6 rounded-2xl border border-zinc-800 cursor-pointer group relative overflow-hidden flex flex-col justify-between"
          >
            <div onClick={() => onSelectProfile(profile.id)}>
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                <User size={48} className="text-[#00FF80]" />
              </div>
              
              <h2 className="text-2xl font-black text-white mb-1 uppercase">{profile.studentName}</h2>
              <p className="text-zinc-500 font-mono text-sm mb-4">MISSÃO DE {profile.duration} DIAS</p>
              
              <div className="flex gap-4 mb-4">
                <div className="bg-zinc-900/50 px-3 py-2 rounded-lg">
                  <p className="text-xs text-zinc-500 uppercase">Peso Atual</p>
                  <p className="font-mono font-bold text-[#00FF80]">{profile.weight}kg</p>
                </div>
                <div className="bg-zinc-900/50 px-3 py-2 rounded-lg">
                  <p className="text-xs text-zinc-500 uppercase">Conquistas</p>
                  <div className="flex items-center gap-1">
                    <Trophy size={14} className="text-yellow-500" />
                    <p className="font-mono font-bold text-white">{profile.badges?.length || 0}</p>
                  </div>
                </div>
              </div>

              <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden mb-4">
                 {/* Simple progress bar based on days passed */}
                 <div className="h-full bg-[#00FF80] w-1/3 opacity-50"></div>
              </div>
            </div>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedHistoryProfile(profile);
              }}
              className="w-full py-2 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-bold uppercase hover:bg-zinc-700 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <Calendar size={14} />
              Ver Histórico de Treinos
            </button>
          </motion.div>
        ))}

        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={onNewProfile}
          className="border-2 border-dashed border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-zinc-500 hover:text-[#00FF80] hover:border-[#00FF80] transition-colors min-h-[200px]"
        >
          <Plus size={48} />
          <span className="font-bold uppercase tracking-widest">Novo Agente</span>
        </motion.button>
      </div>

      {/* History Modal */}
      <AnimatePresence>
        {selectedHistoryProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#111] border border-zinc-800 w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-[#111]">
                <div>
                  <h3 className="text-[#00FF80] font-bold uppercase text-xs tracking-widest">Histórico de Missões</h3>
                  <h2 className="text-xl font-black text-white">{selectedHistoryProfile.studentName}</h2>
                </div>
                <button 
                  onClick={() => setSelectedHistoryProfile(null)}
                  className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto p-6 space-y-4">
                {getFullWorkoutHistory(selectedHistoryProfile).map((dayData) => (
                  <div key={dayData.day} className={`p-4 rounded-xl border ${dayData.completed ? 'bg-[#00FF80]/5 border-[#00FF80]/20' : 'bg-zinc-900/30 border-zinc-800'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${dayData.completed ? 'bg-[#00FF80] text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                          {dayData.day}
                        </div>
                        <div>
                          <h4 className={`font-bold ${dayData.completed ? 'text-white' : 'text-zinc-400'}`}>{dayData.title}</h4>
                          <p className="text-xs text-zinc-500">{dayData.exercises.length} exercícios</p>
                        </div>
                      </div>
                      {dayData.completed ? (
                        <CheckCircle size={20} className="text-[#00FF80]" />
                      ) : (
                        <Circle size={20} className="text-zinc-700" />
                      )}
                    </div>
                    <div className="pl-11">
                      <p className="text-xs text-zinc-500 line-clamp-2">
                        {dayData.exercises.join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
