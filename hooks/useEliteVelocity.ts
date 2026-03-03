import { useState, useEffect, useCallback } from 'react';
import { Profile, ViewMode, DailyLog } from '@/types';
import { FASTING_PROTOCOLS } from '@/utils/constants';
import { differenceInDays, startOfDay } from 'date-fns';
import { calculateProteinTarget } from '@/utils/nutrition-logic';

const PROFILES_STORAGE_KEY = 'elite_velocity_profiles';

export const useEliteVelocity = (userId?: string) => {
  const [profiles, setProfiles] = useState<Record<string, Profile>>(() => {
    if (typeof window !== 'undefined' && userId) {
      const savedProfiles = localStorage.getItem(PROFILES_STORAGE_KEY);
      if (savedProfiles) {
        try {
          const allProfiles = JSON.parse(savedProfiles);
          const userProfiles: Record<string, Profile> = {};
          Object.keys(allProfiles).forEach(id => {
            if (allProfiles[id].userId === userId) {
              userProfiles[id] = allProfiles[id];
            }
          });
          return userProfiles;
        } catch (e) {
          console.error("Error parsing saved profiles", e);
        }
      }
    }
    return {};
  });
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined' && userId) {
      const savedProfiles = localStorage.getItem(PROFILES_STORAGE_KEY);
      if (savedProfiles) {
        try {
          const allProfiles = JSON.parse(savedProfiles);
          const hasProfiles = Object.values(allProfiles).some((p: any) => p.userId === userId);
          return hasProfiles ? 'profiles' : 'onboarding';
        } catch (e) {
          return 'onboarding';
        }
      }
      return 'onboarding';
    }
    return 'loading';
  });
  const [fastingStatus, setFastingStatus] = useState({
    state: 'CARREGANDO',
    hoursLeft: 0,
    minsLeft: 0,
    isFasting: false
  });

  // Sync profiles when userId changes
  useEffect(() => {
    if (!userId) {
      setProfiles({});
      setViewMode('loading');
      return;
    }

    const savedProfiles = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (savedProfiles) {
      try {
        const allProfiles = JSON.parse(savedProfiles);
        const userProfiles: Record<string, Profile> = {};
        Object.keys(allProfiles).forEach(id => {
          if (allProfiles[id].userId === userId) {
            userProfiles[id] = allProfiles[id];
          }
        });
        
        setProfiles(userProfiles);
        setViewMode(Object.keys(userProfiles).length === 0 ? 'onboarding' : 'profiles');
      } catch (e) {
        setProfiles({});
        setViewMode('onboarding');
      }
    } else {
      setProfiles({});
      setViewMode('onboarding');
    }
  }, [userId]);

  const currentProfile = currentProfileId ? profiles[currentProfileId] : null;

  const saveProfile = useCallback(async (profile: Profile) => {
    if (!userId) return;
    
    const profileWithUser = { ...profile, userId };
    
    setProfiles(prev => {
      const updated = { ...prev, [profile.id]: profileWithUser };
      
      // Save all profiles to localStorage
      const allProfiles = JSON.parse(localStorage.getItem(PROFILES_STORAGE_KEY) || '{}');
      allProfiles[profile.id] = profileWithUser;
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(allProfiles));
      
      return updated;
    });
  }, [userId]);

  const updateProfileData = useCallback(async (partial: Partial<Profile>) => {
    if (!currentProfileId || !userId) return;

    setProfiles(prev => {
      if (!prev[currentProfileId]) return prev;
      
      const updatedProfile = { ...prev[currentProfileId], ...partial };
      const updated = { ...prev, [currentProfileId]: updatedProfile };
      
      // Save all profiles to localStorage
      const allProfiles = JSON.parse(localStorage.getItem(PROFILES_STORAGE_KEY) || '{}');
      allProfiles[currentProfileId] = updatedProfile;
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(allProfiles));
      
      return updated;
    });
  }, [currentProfileId, userId]);

  const deleteProfile = useCallback(async () => {
    if (!currentProfileId || !userId) return;

    setProfiles(prev => {
      const { [currentProfileId]: removed, ...rest } = prev;
      
      // Save all profiles to localStorage
      const allProfiles = JSON.parse(localStorage.getItem(PROFILES_STORAGE_KEY) || '{}');
      delete allProfiles[currentProfileId];
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(allProfiles));
      
      return rest;
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

    let finalWeight = weight !== undefined ? weight : currentLog.weight;
    if (finalWeight === undefined) {
      if (dayNum > 1 && currentProfile.dailyLogs[dayNum - 1]?.weight !== undefined) {
        finalWeight = currentProfile.dailyLogs[dayNum - 1].weight;
      } else {
        finalWeight = parseFloat(currentProfile.weight);
      }
    }

    let finalMaxSpeed = maxSpeed !== undefined ? maxSpeed : currentLog.maxSpeed;
    if (finalMaxSpeed === undefined) {
      if (dayNum > 1 && currentProfile.dailyLogs[dayNum - 1]?.maxSpeed !== undefined) {
        finalMaxSpeed = currentProfile.dailyLogs[dayNum - 1].maxSpeed;
      }
    }

    const newLog: DailyLog = {
      ...currentLog,
      completed: true,
      weight: finalWeight,
      maxSpeed: finalMaxSpeed
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
    if (finalMaxSpeed && finalMaxSpeed >= 20 && !newBadges.includes('speed_demon')) {
      newBadges.push('speed_demon');
    }

    updateProfileData({
      dailyLogs: updatedLogs,
      badges: newBadges,
      weight: finalWeight ? finalWeight.toString() : currentProfile.weight
    });

  }, [currentProfile, updateProfileData]);

  const updateWeight = useCallback((dayNum: number, weight: number) => {
    if (!currentProfile || isNaN(weight)) return;

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
      weight: weight
    };

    const updatedLogs = {
      ...currentProfile.dailyLogs,
      [dayNum]: updatedLog
    };

    updateProfileData({
      dailyLogs: updatedLogs,
      weight: weight.toString()
    });
  }, [currentProfile, updateProfileData]);

  const updateMaxSpeed = useCallback((dayNum: number, maxSpeed: number) => {
    if (!currentProfile || isNaN(maxSpeed)) return;

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
      maxSpeed: maxSpeed
    };

    const updatedLogs = {
      ...currentProfile.dailyLogs,
      [dayNum]: updatedLog
    };

    updateProfileData({
      dailyLogs: updatedLogs
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

  const resetDay = useCallback((dayNum: number) => {
    if (!currentProfile) return;

    const updatedLogs = { ...currentProfile.dailyLogs };
    delete updatedLogs[dayNum];

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
    updateDistanceRun,
    updateWeight,
    updateMaxSpeed,
    resetDay
  };
};
