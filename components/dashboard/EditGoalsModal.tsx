'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Target, Weight, Ruler, Zap } from 'lucide-react';
import { Profile } from '@/types';
import { InputCst } from '@/components/ui/Inputs';

interface EditGoalsModalProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (partial: Partial<Profile>) => void;
}

export default function EditGoalsModal({ profile, isOpen, onClose, onSave }: EditGoalsModalProps) {
  const [formData, setFormData] = useState({
    targetLostWeight: profile.targetLostWeight || '',
    targetDistance: profile.targetDistance || '',
    weight: profile.weight || '',
    height: profile.height || ''
  });

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-[#111] border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-[#111]">
              <div className="flex items-center gap-2">
                <Target className="text-[#00FF80]" size={18} />
                <h2 className="text-lg font-black text-white uppercase tracking-tighter">Editar Metas</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <Weight size={16} className="text-zinc-500" />
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Peso e Composição</span>
                </div>
                <InputCst 
                  label="Peso Atual (kg)" 
                  type="number" 
                  step="0.1"
                  value={formData.weight}
                  onChange={e => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                />
                <InputCst 
                  label="Meta de Gordura a Eliminar (kg)" 
                  type="number" 
                  step="0.1"
                  value={formData.targetLostWeight}
                  onChange={e => setFormData(prev => ({ ...prev, targetLostWeight: e.target.value }))}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <Zap size={16} className="text-zinc-500" />
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Performance</span>
                </div>
                <InputCst 
                  label="Distância Alvo (km)" 
                  type="number" 
                  step="0.1"
                  value={formData.targetDistance}
                  onChange={e => setFormData(prev => ({ ...prev, targetDistance: e.target.value }))}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <Ruler size={16} className="text-zinc-500" />
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Biometria</span>
                </div>
                <InputCst 
                  label="Altura (cm)" 
                  type="number" 
                  step="0.1"
                  value={formData.height}
                  onChange={e => setFormData(prev => ({ ...prev, height: e.target.value }))}
                />
              </div>
            </div>

            <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-bold text-zinc-500 hover:text-white transition-colors"
              >
                CANCELAR
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl font-black bg-[#00FF80] text-black hover:bg-[#00FF80]/90 transition-colors"
              >
                SALVAR ALTERAÇÕES
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
