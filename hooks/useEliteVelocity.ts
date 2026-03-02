import { useState, useEffect, useCallback } from 'react';
import { Profile, ViewMode, DailyLog } from '@/types';
import { FASTING_PROTOCOLS, BADGES } from '@/utils/constants';
import { differenceInDays, startOfDay } from 'date-fns';
import { calculateProteinTarget } from '@/utils/nutrition-logic';

export const useEliteVelocity = (userId?: string) => {
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('loading');
  const [fastingStatus, setFastingStatus] = useState({
    state: 'CARREGANDO',
    hoursLeft: 0,
    minsLeft: 0,
    isFasting: false
  });

  // Load data on mount or when userId changes
  useEffect(() => {
    if (!userId) {
      setViewMode('loading');
      return;
    }

    const storageKey = `elite_tracker_profiles_${userId}`;
    const stored = localStorage.getItem(storageKey);
    
    // Migration logic: if user specific storage doesn't exist, check old storage
    const oldStored = localStorage.getItem('elite_tracker_profiles');
    if (!stored && oldStored) {
      localStorage.setItem(storageKey, oldStored);
    }

    const dataToLoad = stored || (oldStored && !stored ? oldStored : null);

    if (dataToLoad) {
      try {
        const parsed = JSON.parse(dataToLoad);
        setProfiles(parsed);
        if (Object.keys(parsed).length === 0) {
          setViewMode('onboarding');
        } else {
          setViewMode('profiles');
        }
      } catch (e) {
        console.error("Failed to parse profiles", e);
        setViewMode('onboarding');
      }
    } else {
      setViewMode('onboarding');
    }
  }, [userId]);

  const currentProfile = currentProfileId ? profiles[currentProfileId] : null;

  const saveProfile = useCallback((profile: Profile) => {
    if (!userId) return;
    const storageKey = `elite_tracker_profiles_${userId}`;
    
    const profileWithUser = { ...profile, userId };
    
    setProfiles(prev => {
      const next = { ...prev, [profileWithUser.id]: profileWithUser };
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [userId]);

  const updateProfileData = useCallback((partial: Partial<Profile>) => {
    if (!currentProfileId || !userId) return;
    const storageKey = `elite_tracker_profiles_${userId}`;

    setProfiles(prev => {
      const current = prev[currentProfileId];
      if (!current) return prev;
      const updated = { ...current, ...partial };
      const next = { ...prev, [currentProfileId]: updated };
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [currentProfileId, userId]);

  const deleteProfile = useCallback(() => {
    if (!currentProfileId || !userId) return;
    const storageKey = `elite_tracker_profiles_${userId}`;

    setProfiles(prev => {
      const next = { ...prev };
      delete next[currentProfileId];
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
    setCurrentProfileId(null);
    setViewMode('profiles');
  }, [currentProfileId, userId]);

  // Calculate Current Day
  const getCurrentDayNumber = useCallback(() => {
    if (!currentProfile) return 1;
    const start = startOfDay(new Date(currentProfile.startDate));
    const now = startOfDay(new Date());
    const diff = differenceInDays(now, start);
    return diff + 1;
  }, [currentProfile]);

  const currentDayNumber = getCurrentDayNumber();

  // Fasting Timer Logic
  useEffect(() => {
    if (!currentProfile) return;

    const calculateFasting = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();

      const [startH, startM] = currentProfile.startHour.split(':').map(Number);
      
      const protocol = FASTING_PROTOCOLS[currentProfile.protocol];
      if (!protocol) return;

      const eatingStart = new Date();
      eatingStart.setHours(startH, startM, 0, 0);
      
      const eatingEnd = new Date(eatingStart);
      eatingEnd.setHours(eatingStart.getHours() + protocol.eat);

      let isEating = false;
      let targetTime = new Date();

      if (now >= eatingStart && now < eatingEnd) {
        isEating = true;
        targetTime = eatingEnd;
      } else {
        if (now < eatingStart) {
           targetTime = eatingStart;
        } else {
           targetTime = new Date(eatingStart);
           targetTime.setDate(targetTime.getDate() + 1);
        }
      }

      const diffMs = targetTime.getTime() - now.getTime();
      const diffMinsTotal = Math.floor(diffMs / 60000);
      const hoursLeft = Math.floor(diffMinsTotal / 60);
      const minsLeft = diffMinsTotal % 60;

      setFastingStatus({
        state: isEating ? 'JANELA ALIMENTAR' : 'EM JEJUM',
        isFasting: !isEating,
        hoursLeft,
        minsLeft
      });
    };

    calculateFasting();
    const interval = setInterval(calculateFasting, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [currentProfile]);

  const markDayComplete = useCallback((dayNum: number, weight?: number, maxSpeed?: number) => {
    if (!currentProfile) return;
    
    const newLog: DailyLog = {
      completed: true,
      weight: weight,
      water: 0, // Default
      maxSpeed: maxSpeed,
      protein: 0,
      workoutCompleted: false,
      waterCompleted: false,
      proteinCompleted: false
    };

    const updatedLogs = {
      ...currentProfile.dailyLogs,
      [dayNum]: newLog
    };

    // Check Badges
    const newBadges = [...(currentProfile.badges || [])];
    
    // First Step
    if (!newBadges.includes('first_step')) {
      newBadges.push('first_step');
    }

    // Consistency 7
    let streak = 0;
    for (let i = dayNum; i > dayNum - 7; i--) {
      if (i === dayNum) streak++;
      else if (updatedLogs[i]?.completed) streak++;
    }
    if (streak >= 7 && !newBadges.includes('consistency_7')) {
      newBadges.push('consistency_7');
    }

    // Speed Demon
    if (maxSpeed && maxSpeed >= 20 && !newBadges.includes('speed_demon')) {
      newBadges.push('speed_demon');
    }

    updateProfileData({
      dailyLogs: updatedLogs,
      badges: newBadges,
      weight: weight ? weight.toString() : currentProfile.weight
    });

  }, [currentProfile, updateProfileData]);

  const updateWaterIntake = useCallback((dayNum: number, amount: number) => {
    if (!currentProfile) return;

    const currentLog = currentProfile.dailyLogs[dayNum] || {
      completed: false,
      water: 0,
      protein: 0,
      workoutCompleted: false,
      waterCompleted: false,
      proteinCompleted: false,
      weight: undefined,
      maxSpeed: undefined
    };

    const weight = parseFloat(currentProfile.weight);
    const target = Math.round((weight / 30) * 1000);
    const isGoalReached = amount >= target;

    const updatedLog = {
      ...currentLog,
      water: amount,
      waterCompleted: isGoalReached
    };

    const updatedLogs = {
      ...currentProfile.dailyLogs,
      [dayNum]: updatedLog
    };

    updateProfileData({
      dailyLogs: updatedLogs
    });
  }, [currentProfile, updateProfileData]);

  const updateProteinIntake = useCallback((dayNum: number, amount: number) => {
    if (!currentProfile) return;

    const currentLog = currentProfile.dailyLogs[dayNum] || {
      completed: false,
      water: 0,
      protein: 0,
      workoutCompleted: false,
      waterCompleted: false,
      proteinCompleted: false,
      weight: undefined,
      maxSpeed: undefined
    };

    const target = calculateProteinTarget(currentProfile);
    const isGoalReached = amount >= target;

    const updatedLog = {
      ...currentLog,
      protein: amount,
      proteinCompleted: isGoalReached
    };

    const updatedLogs = {
      ...currentProfile.dailyLogs,
      [dayNum]: updatedLog
    };

    updateProfileData({
      dailyLogs: updatedLogs
    });
  }, [currentProfile, updateProfileData]);

  const toggleWorkoutStatus = useCallback((dayNum: number, status: boolean) => {
    if (!currentProfile) return;

    const currentLog = currentProfile.dailyLogs[dayNum] || {
      completed: false,
      water: 0,
      protein: 0,
      workoutCompleted: false,
      waterCompleted: false,
      proteinCompleted: false,
      weight: undefined,
      maxSpeed: undefined
    };

    const updatedLog = {
      ...currentLog,
      workoutCompleted: status
    };

    const updatedLogs = {
      ...currentProfile.dailyLogs,
      [dayNum]: updatedLog
    };

    updateProfileData({
      dailyLogs: updatedLogs
    });
  }, [currentProfile, updateProfileData]);

  const updateExerciseNote = useCallback((dayNum: number, exercise: string, note: string) => {
    if (!currentProfile) return;

    const currentLog = currentProfile.dailyLogs[dayNum] || {
      completed: false,
      water: 0,
      protein: 0,
      workoutCompleted: false,
      waterCompleted: false,
      proteinCompleted: false,
      weight: undefined,
      maxSpeed: undefined,
      exerciseNotes: {}
    };

    const currentNotes = currentLog.exerciseNotes || {};
    
    const updatedLog = {
      ...currentLog,
      exerciseNotes: {
        ...currentNotes,
        [exercise]: note
      }
    };

    const updatedLogs = {
      ...currentProfile.dailyLogs,
      [dayNum]: updatedLog
    };

    updateProfileData({
      dailyLogs: updatedLogs
    });
  }, [currentProfile, updateProfileData]);

  const updateDistanceRun = useCallback((dayNum: number, distance: number) => {
    if (!currentProfile) return;

    const currentLog = currentProfile.dailyLogs[dayNum] || {
      completed: false,
      water: 0,
      protein: 0,
      workoutCompleted: false,
      waterCompleted: false,
      proteinCompleted: false,
      weight: undefined,
      maxSpeed: undefined,
      exerciseNotes: {},
      distanceRun: 0
    };

    const updatedLog = {
      ...currentLog,
      distanceRun: distance
    };

    const updatedLogs = {
      ...currentProfile.dailyLogs,
      [dayNum]: updatedLog
    };

    updateProfileData({
      dailyLogs: updatedLogs
    });
  }, [currentProfile, updateProfileData]);

  return {
    profiles,
    currentProfile,
    currentProfileId,
    setCurrentProfileId,
    viewMode,
    setViewMode,
    currentDayNumber,
    fastingStatus,
    saveProfile,
    updateProfileData,
    deleteProfile,
    markDayComplete,
    updateWaterIntake,
    updateProteinIntake,
    toggleWorkoutStatus,
    updateExerciseNote,
    updateDistanceRun
  };
};
