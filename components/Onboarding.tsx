import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InputCst, SelectCst } from '@/components/ui/Inputs';
import { FASTING_PROTOCOLS, FOCUS_OPTIONS, DURATIONS, WORKOUT_PROTOCOLS, WEEK_DAYS } from '@/utils/constants';
import { Profile } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface OnboardingProps {
  onFinish: (profile: Profile) => void;
}

export default function Onboarding({ onFinish }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Profile>>({
    studentName: '',
    gender: 'm',
    weight: '',
    height: '',
    targetLostWeight: '',
    targetDistance: '',
    duration: '30',
    fastingDays: [],
    protocol: '12/12',
    startHour: '12:00',
    workoutProtocol: 'classic',
    focuses: [],
    runDays: [],
    runDistances: {},
    runningDifficulty: 'none',
    dailyLogs: {},
    badges: [],
    startDate: new Date().toISOString()
  });

  const updateField = (field: keyof Profile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.studentName || !formData.weight || !formData.height) {
        alert("Preencha todos os campos obrigatórios.");
        return;
      }
    }
    if (step === 2) {
      if (!formData.targetLostWeight) {
        alert("Defina a meta de gordura a eliminar.");
        return;
      }
    }
    if (step === 3) {
      if (formData.fastingDays?.length !== 2) {
        alert("Selecione exatamente 2 dias de jejum.");
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleFinish = () => {
    const runDistances: Record<number, string> = {};
    let dailyDistance = 0;
    
    if (formData.runningDifficulty === 'beginner') dailyDistance = 3;
    else if (formData.runningDifficulty === 'advanced') dailyDistance = 5;
    else if (formData.runningDifficulty === 'expert') dailyDistance = 10;

    if (formData.runningDifficulty !== 'none' && formData.runDays) {
      formData.runDays.forEach(day => {
        runDistances[day] = dailyDistance.toString();
      });
    }

    const profile: Profile = {
      ...formData as Profile,
      id: uuidv4(),
      startDate: new Date().toISOString(),
      runDistances: {}, // No longer strictly tied to specific days for goal calculation
      dailyLogs: {},
      badges: []
    };
    
    onFinish(profile);
  };

  const toggleFocus = (id: string) => {
    const current = formData.focuses || [];
    if (current.includes(id)) {
      updateField('focuses', current.filter(f => f !== id));
    } else {
      if (current.length >= 3) return;
      updateField('focuses', [...current, id]);
    }
  };

  const toggleDay = (field: 'fastingDays' | 'runDays', dayIndex: number) => {
    const current = formData[field] || [];
    if (current.includes(dayIndex)) {
      updateField(field, current.filter(d => d !== dayIndex));
    } else {
      updateField(field, [...current, dayIndex].sort());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0A0A] text-white">
      <div className="w-full max-w-2xl glass-panel rounded-2xl p-8 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800">
          <motion.div 
            className="h-full bg-[#00FF80]" 
            initial={{ width: 0 }}
            animate={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <h1 className="text-3xl font-black text-[#00FF80] mb-2 tracking-tighter">
          INICIALIZAÇÃO DO AGENTE
        </h1>
        <p className="text-zinc-500 mb-8 font-mono text-sm">ETAPA {step} / 4</p>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {step === 1 && (
              <>
                <InputCst 
                  label="CODINOME DO AGENTE" 
                  placeholder="Ex: Maverick" 
                  value={formData.studentName}
                  onChange={e => updateField('studentName', e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Gênero</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => updateField('gender', 'm')}
                        className={`flex-1 py-3 rounded-lg font-bold border ${formData.gender === 'm' ? 'bg-[#00FF80] text-black border-[#00FF80]' : 'border-zinc-700 text-zinc-500'}`}
                      >
                        MASC
                      </button>
                      <button 
                        onClick={() => updateField('gender', 'f')}
                        className={`flex-1 py-3 rounded-lg font-bold border ${formData.gender === 'f' ? 'bg-[#00FF80] text-black border-[#00FF80]' : 'border-zinc-700 text-zinc-500'}`}
                      >
                        FEM
                      </button>
                    </div>
                  </div>
                  <InputCst 
                    label="PESO ATUAL (KG)" 
                    type="number" 
                    step="0.1"
                    value={formData.weight}
                    onChange={e => updateField('weight', e.target.value)}
                  />
                </div>
                <InputCst 
                  label="ALTURA (CM)" 
                  type="number" 
                  step="0.1"
                  value={formData.height}
                  onChange={e => updateField('height', e.target.value)}
                />
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase mb-2 block">FOCOS TÁTICOS (MÁX 3)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {FOCUS_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => toggleFocus(opt.id)}
                        className={`p-3 rounded-lg border text-sm font-bold text-left transition-all ${
                          formData.focuses?.includes(opt.id)
                            ? 'bg-[#00FF80]/20 border-[#00FF80] text-[#00FF80]'
                            : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputCst 
                    label="META DE GORDURA (KG)" 
                    type="number" 
                    step="0.1"
                    placeholder="Ex: 5"
                    value={formData.targetLostWeight}
                    onChange={e => updateField('targetLostWeight', e.target.value)}
                  />
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Duração da Missão</label>
                    <select 
                      className="bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00FF80]"
                      value={formData.duration}
                      onChange={e => updateField('duration', e.target.value)}
                    >
                      {DURATIONS.map(d => <option key={d} value={d}>{d} Dias</option>)}
                    </select>
                  </div>
                </div>

                {/* Run Distance / Mission Goal */}
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Missão de Corrida (Meta Total)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'none', label: 'Sem Meta', val: '0' },
                        { id: '21', label: 'Meia Maratona (21km)', val: '21' },
                        { id: '42', label: 'Maratona (42km)', val: '42' },
                        { id: '51', label: 'Elite (51km)', val: '51' },
                        { id: '100', label: 'Ultra (100km)', val: '100' },
                        { id: 'custom', label: 'Personalizado', val: '' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            updateField('runningDifficulty', opt.id as any);
                            if (opt.val !== '') updateField('targetDistance', opt.val);
                          }}
                          className={`p-3 rounded-lg border text-xs font-bold transition-all ${
                            formData.runningDifficulty === opt.id
                              ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                              : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.runningDifficulty === 'custom' && (
                    <InputCst 
                      label="DISTÂNCIA TOTAL DA MISSÃO (KM)" 
                      type="number"
                      placeholder="Ex: 75"
                      value={formData.targetDistance}
                      onChange={e => updateField('targetDistance', e.target.value)}
                    />
                  )}

                  {formData.runningDifficulty !== 'none' && (
                    <div>
                      <label className="text-xs font-bold text-zinc-400 uppercase mb-2 block">DIAS PREFERENCIAIS PARA CORRER</label>
                      <div className="flex gap-1 justify-between">
                        {WEEK_DAYS.map((d, i) => (
                          <button
                            key={i}
                            onClick={() => toggleDay('runDays', i)}
                            className={`w-10 h-10 rounded-full font-bold text-sm ${
                              formData.runDays?.includes(i) ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-600'
                            }`}
                          >
                            {d[0]}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-zinc-600 uppercase font-bold mt-2">Isso ajudará a organizar seu cronograma, mas você pode correr qualquer dia.</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase mb-2 block">DIAS DE JEJUM (EXATAMENTE 2)</label>
                    <div className="flex gap-1 justify-between">
                      {WEEK_DAYS.map((d, i) => (
                        <button
                          key={i}
                          onClick={() => toggleDay('fastingDays', i)}
                          className={`w-10 h-10 rounded-full font-bold text-sm ${
                            formData.fastingDays?.includes(i) ? 'bg-[#FF4E00] text-white' : 'bg-zinc-800 text-zinc-600'
                          }`}
                        >
                          {d[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Protocolo de Jejum</label>
                    <select 
                      className="bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FF4E00]"
                      value={formData.protocol}
                      onChange={e => updateField('protocol', e.target.value)}
                    >
                      {Object.entries(FASTING_PROTOCOLS).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                  </div>

                  <InputCst 
                    label="HORA DA 1ª REFEIÇÃO" 
                    type="time" 
                    value={formData.startHour}
                    onChange={e => updateField('startHour', e.target.value)}
                  />
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Protocolo de Treino</label>
                    <div className="space-y-2">
                      {WORKOUT_PROTOCOLS.map(p => (
                        <button
                          key={p.id}
                          onClick={() => updateField('workoutProtocol', p.id)}
                          className={`w-full text-left p-4 rounded-xl border transition-all ${
                            formData.workoutProtocol === p.id 
                              ? 'bg-[#00FF80]/10 border-[#00FF80] text-[#00FF80]' 
                              : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <div className="font-bold mb-1">{p.label}</div>
                          <div className={`text-xs ${formData.workoutProtocol === p.id ? 'text-[#00FF80]/80' : 'text-zinc-500'}`}>
                            {p.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex justify-between">
          {step > 1 ? (
            <button 
              onClick={() => setStep(prev => prev - 1)}
              className="px-6 py-3 rounded-lg font-bold text-zinc-500 hover:text-white transition-colors"
            >
              VOLTAR
            </button>
          ) : <div />}
          
          <button 
            onClick={step === 4 ? handleFinish : handleNext}
            className="px-8 py-3 rounded-lg font-black bg-[#00FF80] text-black hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,255,128,0.3)]"
          >
            {step === 4 ? 'INICIAR MISSÃO' : 'PRÓXIMO'}
          </button>
        </div>
      </div>
    </div>
  );
}
