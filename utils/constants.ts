import { Badge, FastingProtocolData } from '@/types';

export const FASTING_PROTOCOLS: Record<string, FastingProtocolData> = {
  '12/12': { label: 'Iniciante (12/12)', fast: 12, eat: 12 },
  '14/10': { label: 'Intermediário (14/10)', fast: 14, eat: 10 },
  '16/8': { label: 'Avançado (16/8)', fast: 16, eat: 8 },
};

export const FOCUS_OPTIONS = [
  { id: 'sup', label: 'Superiores', short: 'Superiores' },
  { id: 'inf', label: 'Inferiores (Pernas)', short: 'Pernas' },
  { id: 'vel', label: 'Velocidade Sprint', short: 'Velocidade' },
  { id: 'mob', label: 'Mobilidade/Core', short: 'Mobilidade' },
  { id: 'abd', label: 'Estética Abdominal', short: 'Abdômen' },
];

export const BADGES: Badge[] = [
  { id: 'first_step', label: 'Primeiro Passo', icon: '🎯', desc: 'Concluiu o primeiro dia' },
  { id: 'consistency_7', label: 'Guerreiro de Elite', icon: '⚔️', desc: '7 dias consecutivos de treino' },
  { id: 'fasting_master', label: 'Mestre do Jejum', icon: '🧘', desc: 'Concluiu 5 protocolos de jejum' },
  { id: 'speed_demon', label: 'Demônio da Velocidade', icon: '⚡', desc: 'Bateu 20km/h no sprint' },
  { id: 'hydration_hero', label: 'Hidratação Heroica', icon: '💧', desc: 'Bebeu mais de 3L de água' },
];

export const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const DURATIONS = ['7', '14', '21', '28', '42', '60', '90'];

export const WORKOUT_PROTOCOLS = [
  { id: 'classic', label: 'Musculação Clássica', desc: 'Foco em hipertrofia e força base. Séries de 8-12 repetições com descanso moderado (60-90s).' },
  { id: 'tabata', label: 'Tabata HIIT (20s/10s)', desc: 'Treino metabólico de alta intensidade. 20s de esforço máximo seguidos de 10s de descanso.' },
  { id: 'resistance', label: 'Elite Resistance (Volume)', desc: 'Resistência muscular e condicionamento. Alto volume de repetições (15-20) com baixo tempo de descanso.' }
];
