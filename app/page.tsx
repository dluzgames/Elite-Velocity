'use client';

import React, { useEffect, useState } from 'react';
import { useEliteVelocity } from '@/hooks/useEliteVelocity';
import { useAuth } from '@/hooks/useAuth';
import Onboarding from '@/components/Onboarding';
import ProfileScreen from '@/components/ProfileScreen';
import NutritionModule from '@/components/dashboard/NutritionModule';
import WorkoutModule from '@/components/dashboard/WorkoutModule';
import HydrationModule from '@/components/dashboard/HydrationModule';
import DailyMissions from '@/components/dashboard/DailyMissions';
import RunningProgressModule from '@/components/dashboard/RunningProgressModule';
import ProgressionSummaryModule from '@/components/dashboard/ProgressionSummaryModule';
import SpreadsheetView from '@/components/spreadsheet/SpreadsheetView';
import Metrics from '@/components/history/Metrics';
import FryaChat, { FryaChatRef } from '@/components/chat/FryaChat';
import AuthScreen from '@/components/auth/AuthScreen';
import EditGoalsModal from '@/components/dashboard/EditGoalsModal';
import ProtocolView from '@/components/dashboard/ProtocolView';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Table, Activity, Users, LogOut, Settings, FileText } from 'lucide-react';
import { BADGES } from '@/utils/constants';

export default function Home() {
  const { user, loading: authLoading, login, signup, logout } = useAuth();
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
    deleteProfile,
    updateWaterIntake,
    updateProteinIntake,
    toggleWorkoutStatus,
    updateExerciseNote,
    updateDistanceRun,
    updateWeight,
    updateMaxSpeed,
    resetDay,
    updateProfileData,
    addMeal,
    removeMeal
  } = useEliteVelocity(user?.id);

  const [dashboardTab, setDashboardTab] = useState<'panel' | 'sheet' | 'history' | 'protocol'>('panel');
  const [isEditGoalsOpen, setIsEditGoalsOpen] = useState(false);
  const fryaChatRef = React.useRef<FryaChatRef>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!mounted) {
    return null;
  }

  if (authLoading) {
    return null; // Removed opening/loading screen
  }

  if (!user) {
    return <AuthScreen onLogin={login} onSignup={signup} />;
  }

  if (viewMode === 'loading') {
    return null; // Removed opening/loading screen
  }

  // Profiles Screen
  if (viewMode === 'profiles') {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center border-b border-zinc-800/50">
          <div className="flex items-center gap-2">
            <Activity className="text-[#00FF80]" size={20} />
            <span className="font-black tracking-tighter text-white">DLUZ CORE</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-white font-bold text-sm">{user.name}</p>
              <p className="text-zinc-500 text-xs">{user.email}</p>
            </div>
            <button 
              onClick={logout}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
        <ProfileScreen 
          profiles={profiles}
          onSelectProfile={(id) => {
            setCurrentProfileId(id);
            setViewMode('dashboard');
          }}
          onNewProfile={() => setViewMode('onboarding')}
        />
      </div>
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
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setViewMode('profiles')}
                className="flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest"
              >
                <Users size={14} />
                Trocar Agente
              </button>
              <button 
                onClick={() => setIsEditGoalsOpen(true)}
                className="flex items-center gap-2 text-zinc-500 hover:text-[#00FF80] text-xs font-bold uppercase tracking-widest transition-colors"
              >
                <Settings size={14} />
                Editar Metas
              </button>
            </div>
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
            <button 
              onClick={() => setDashboardTab('protocol')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${
                dashboardTab === 'protocol' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <FileText size={16} />
              <span className="hidden md:inline">Protocolo</span>
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
              className="space-y-6"
            >
              {/* Running Progress - Main Focus */}
              <RunningProgressModule 
                profile={currentProfile}
                currentDay={currentDayNumber}
                onUpdateDistance={updateDistanceRun}
              />

              {/* Progression Summary */}
              <ProgressionSummaryModule 
                profile={currentProfile}
                currentDay={currentDayNumber}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: Nutrition & Hydration */}
                <div className="space-y-6">
                  <NutritionModule 
                    profile={currentProfile} 
                    fastingStatus={fastingStatus} 
                    dayOfWeek={dayOfWeek}
                    currentDay={currentDayNumber}
                    onAddMeal={addMeal}
                    onRemoveMeal={removeMeal}
                  />
                  <HydrationModule 
                    profile={currentProfile}
                    dayNum={currentDayNumber}
                    onUpdateWater={(amount) => updateWaterIntake(currentDayNumber, amount)}
                  />
                </div>

                {/* Column 2: Workout Details */}
                <WorkoutModule 
                  profile={currentProfile}
                  dayNum={currentDayNumber}
                  isCompleted={isCompleted}
                  isOutOfBounds={isOutOfBounds}
                  onComplete={() => {}} 
                  onUpdateNote={(exercise, note) => updateExerciseNote(currentDayNumber, exercise, note)}
                  onAskAI={() => fryaChatRef.current?.triggerMessage("Analise meu treino de hoje e me dê dicas de performance.")}
                />

                {/* Column 3: Daily Missions Checklist & Badges */}
                <div className="space-y-6">
                  <DailyMissions 
                    profile={currentProfile}
                    dayNum={currentDayNumber}
                    onToggleWorkout={(status) => toggleWorkoutStatus(currentDayNumber, status)}
                    onUpdateProtein={(amount) => updateProteinIntake(currentDayNumber, amount)}
                    onUpdateWeight={(amount) => updateWeight(currentDayNumber, amount)}
                    onUpdateMaxSpeed={(amount) => updateMaxSpeed(currentDayNumber, amount)}
                    onCompleteDay={() => markDayComplete(currentDayNumber)}
                    onResetDay={() => resetDay(currentDayNumber)}
                  />
                  
                  <div className="glass-panel rounded-2xl p-6">
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

          {dashboardTab === 'protocol' && (
            <motion.div 
              key="protocol"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ProtocolView profile={currentProfile} />
            </motion.div>
          )}
        </AnimatePresence>

        <FryaChat ref={fryaChatRef} profile={currentProfile} currentDay={currentDayNumber} />
        
        <EditGoalsModal 
          profile={currentProfile}
          isOpen={isEditGoalsOpen}
          onClose={() => setIsEditGoalsOpen(false)}
          onSave={updateProfileData}
        />
      </div>
    );
  }

  return null;
}
