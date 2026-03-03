import { useState, useEffect, useCallback } from 'react';
import { Profile, ViewMode, DailyLog } from '@/types';
import { FASTING_PROTOCOLS } from '@/utils/constants';
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

  // Sync profiles when userId changes
  useEffect(() => {
    if (!userId) {
      setProfiles({});
      setViewMode('loading');
      return;
    }

    const fetchProfiles = async () => {
      try {
        const res = await fetch(`/api/profiles?userId=${userId}`);
        const data = await res.json();
        if (data.success) {
          setProfiles(data.profiles);
          setViewMode(Object.keys(data.profiles).length === 0 ? 'onboarding' : 'profiles');
        } else {
          setProfiles({});
          setViewMode('onboarding');
        }
      } catch (e) {
        console.error('Error fetching profiles', e);
        setProfiles({});
        setViewMode('onboarding');
      }
    };

    fetchProfiles();
  }, [userId]);

  const currentProfile = currentProfileId ? profiles[currentProfileId] : null;

  const saveProfile = useCallback(async (profile: Profile) => {
    if (!userId) return;
    
    const profileWithUser = { ...profile, userId };
    
    try {
      await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileWithUser),
      });
      
      setProfiles(prev => ({ ...prev, [profile.id]: profileWithUser }));
    } catch (e) {
      console.error('Error saving profile', e);
    }
  }, [userId]);

  const updateProfileData = useCallback(async (partial: Partial<Profile>) => {
    if (!currentProfileId || !userId) return;

    try {
      const res = await fetch(`/api/profiles/${currentProfileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...partial, userId }),
      });
      const data = await res.json();
      
      if (data.success) {
        setProfiles(prev => ({ ...prev, [currentProfileId]: data.profile }));
      }
    } catch (e) {
      console.error('Error updating profile', e);
    }
  }, [currentProfileId, userId]);

  const deleteProfile = useCallback(async () => {
    if (!currentProfileId || !userId) return;

    try {
      await fetch(`/api/profiles/${currentProfileId}?userId=${userId}`, {
        method: 'DELETE',
      });
      
      setProfiles(prev => {
        const { [currentProfileId]: removed, ...rest } = prev;
        return rest;
      });
      
      setCurrentProfileId(null);
      setViewMode('profiles');
    } catch (e) {
      console.error('Error deleting profile', e);
    }
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
