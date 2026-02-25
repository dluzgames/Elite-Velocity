import React from 'react';
import { Profile } from '@/types';
import { motion } from 'motion/react';
import { Plus, User, Trophy } from 'lucide-react';

interface ProfileScreenProps {
  profiles: Record<string, Profile>;
  onSelectProfile: (id: string) => void;
  onNewProfile: () => void;
}

export default function ProfileScreen({ profiles, onSelectProfile, onNewProfile }: ProfileScreenProps) {
  const profileList = Object.values(profiles);

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
            onClick={() => onSelectProfile(profile.id)}
            className="glass-panel p-6 rounded-2xl border border-zinc-800 cursor-pointer group relative overflow-hidden"
          >
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

            <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
               {/* Simple progress bar based on days passed */}
               {/* We can calculate this properly if we pass current day, but for now let's just show a visual indicator */}
               <div className="h-full bg-[#00FF80] w-1/3 opacity-50"></div>
            </div>
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
    </div>
  );
}
