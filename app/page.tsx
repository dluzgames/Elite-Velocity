'use client';

import React, { useEffect, useState } from 'react';
import { useEliteVelocity } from '@/hooks/useEliteVelocity';
import Onboarding from '@/components/Onboarding';
import ProfileScreen from '@/components/ProfileScreen';
import NutritionModule from '@/components/dashboard/NutritionModule';
import WorkoutModule from '@/components/dashboard/WorkoutModule';
import HydrationModule from '@/components/dashboard/HydrationModule';
import DailyMissions from '@/components/dashboard/DailyMissions';
import SpreadsheetView from '@/components/spreadsheet/SpreadsheetView';
import Metrics from '@/components/history/Metrics';
import FryaChat, { FryaChatRef } from '@/components/chat/FryaChat';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Table, Activity, Users, Trophy } from 'lucide-react';
import { BADGES } from '@/utils/constants';

export default function Home() {
  const {
    profiles,
    currentProfile,
    viewMode,
    setViewMode,
    currentDayNumber,
    fastingStatus,
    saveProfile,
    setCurrentProfileId,
    markDayComplete,
    deleteProfile
  } = useEliteVelocity();

  const [dashboardTab, setDashboardTab] = useState<'panel' | 'sheet' | 'history'>('panel');
  const fryaChatRef = React.useRef<FryaChatRef>(null);

  // Loading Screen
  if (viewMode === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.h1 
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-[#00FF80] font-black tracking-widest text-xl"
        >
          INICIALIZANDO FRYA CORE...
        </motion.h1>
      </div>
    );
  }

  // Profiles Screen
  if (viewMode === 'profiles') {
    return (
      <ProfileScreen 
        profiles={profiles}
        onSelectProfile={(id) => {
          setCurrentProfileId(id);
          setViewMode('dashboard');
        }}
        onNewProfile={() => setViewMode('onboarding')}
      />
    );
  }

  // Onboarding Screen
  if (viewMode === 'onboarding') {
    return (
      <Onboarding 
        onFinish={(profile) => {
          saveProfile(profile);
          setCurrentProfileId(profile.id);
          setViewMode('dashboard');
        }}
      />
    );
  }

  // Dashboard / Main App
  if (viewMode === 'dashboard' && currentProfile) {
    const isOutOfBounds = currentDayNumber > parseInt(currentProfile.duration);
    const todayLog = currentProfile.dailyLogs[currentDayNumber];
    const isCompleted = todayLog?.completed || false;
    
    // Get date for display
    const date = new Date(currentProfile.startDate);
    date.setDate(date.getDate() + (currentDayNumber - 1));
    const dayOfWeek = date.getDay();

    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-8 pb-24">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <button 
              onClick={() => setViewMode('profiles')}
              className="flex items-center gap-2 text-zinc-500 hover:text-white mb-2 text-xs font-bold uppercase tracking-widest"
            >
              <Users size={14} />
              Trocar Agente
            </button>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white">
              DIA <span className="text-[#00FF80]">{currentDayNumber}</span> <span className="text-zinc-600">/ {currentProfile.duration}</span>
            </h1>
            <p className="text-zinc-400 font-mono text-sm">AGENTE: <span className="text-[#00FF80]">{currentProfile.studentName}</span></p>
          </div>

          {isOutOfBounds && (
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="bg-[#FF4E00]/20 border border-[#FF4E00] px-4 py-2 rounded-lg"
            >
              <p className="text-[#FF4E00] font-black uppercase tracking-widest">MISSÃO CONCLUÍDA!</p>
            </motion.div>
          )}

          {/* Navigation Tabs */}
          <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
            <button 
              onClick={() => setDashboardTab('panel')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${
                dashboardTab === 'panel' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <LayoutDashboard size={16} />
              <span className="hidden md:inline">Painel</span>
            </button>
            <button 
              onClick={() => setDashboardTab('sheet')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${
                dashboardTab === 'sheet' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Table size={16} />
              <span className="hidden md:inline">Planilha</span>
            </button>
            <button 
              onClick={() => setDashboardTab('history')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${
                dashboardTab === 'history' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Activity size={16} />
              <span className="hidden md:inline">Progresso</span>
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {dashboardTab === 'panel' && (
            <motion.div 
              key="panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <NutritionModule 
                profile={currentProfile} 
                fastingStatus={fastingStatus} 
                dayOfWeek={dayOfWeek}
              />
              <HydrationModule 
                profile={currentProfile}
                dayNum={currentDayNumber}
                onUpdateWater={(amount) => updateWaterIntake(currentDayNumber, amount)}
              />
              <WorkoutModule 
                profile={currentProfile}
                dayNum={currentDayNumber}
                isCompleted={isCompleted}
                isOutOfBounds={isOutOfBounds}
                onComplete={() => {
                  const weight = prompt("Peso atual (kg):", currentProfile.weight);
                  const speed = currentProfile.focuses.includes('vel') ? prompt("Velocidade Máxima (km/h):") : undefined;
                  
                  markDayComplete(
                    currentDayNumber, 
                    weight ? parseFloat(weight) : undefined, 
                    speed ? parseFloat(speed) : undefined
                  );
                }}
              />

              {/* Badges Preview */}
              <div className="col-span-1 md:col-span-3 glass-panel rounded-2xl p-6">
                <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Conquistas Desbloqueadas</h3>
                <div className="flex flex-wrap gap-3">
                  {currentProfile.badges && currentProfile.badges.length > 0 ? (
                    currentProfile.badges.map(badgeId => {
                      const badge = BADGES.find(b => b.id === badgeId);
                      if (!badge) return null;
                      return (
                        <div key={badgeId} className="bg-[#00FF80]/10 border border-[#00FF80]/30 px-3 py-2 rounded-lg flex items-center gap-2">
                          <span className="text-lg">{badge.icon}</span>
                          <span className="text-xs font-bold text-[#00FF80] uppercase">{badge.label}</span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-zinc-600 text-sm italic">Nenhuma conquista ainda. Continue treinando!</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {dashboardTab === 'sheet' && (
            <motion.div 
              key="sheet"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel rounded-2xl overflow-hidden"
            >
              <SpreadsheetView 
                profile={currentProfile} 
                currentDay={currentDayNumber}
                onToggleDay={(day) => {
                  if (day === currentDayNumber) {
                    setDashboardTab('panel');
                  }
                }}
                onAskAI={(prompt) => {
                  fryaChatRef.current?.triggerMessage(prompt);
                }}
              />
            </motion.div>
          )}

          {dashboardTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Metrics profile={currentProfile} onDelete={deleteProfile} />
            </motion.div>
          )}
        </AnimatePresence>

        <FryaChat ref={fryaChatRef} profile={currentProfile} currentDay={currentDayNumber} />
      </div>
    );
  }

  return null;
}
