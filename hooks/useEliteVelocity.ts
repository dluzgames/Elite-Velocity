import { useState, useEffect, useCallback } from 'react';
import { Profile, ViewMode, DailyLog } from '@/types';
import { FASTING_PROTOCOLS, BADGES } from '@/utils/constants';
import { differenceInDays, startOfDay } from 'date-fns';

const STORAGE_KEY = 'elite_tracker_profiles';

export const useEliteVelocity = () => {
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('loading');
  const [fastingStatus, setFastingStatus] = useState({
    state: 'CARREGANDO',
    hoursLeft: 0,
    minsLeft: 0,
    isFasting: false
  });

  // Load data on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setProfiles(parsed);
        // If only one profile exists, select it automatically (optional, but good for UX)
        // For now, let's go to profiles screen if multiple, or onboarding if none.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentProfile = currentProfileId ? profiles[currentProfileId] : null;

  const saveProfile = useCallback((profile: Profile) => {
    setProfiles(prev => {
      const next = { ...prev, [profile.id]: profile };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateProfileData = useCallback((partial: Partial<Profile>) => {
    if (!currentProfileId) return;
    setProfiles(prev => {
      const current = prev[currentProfileId];
      if (!current) return prev;
      const updated = { ...current, ...partial };
      const next = { ...prev, [currentProfileId]: updated };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [currentProfileId]);

  const deleteProfile = useCallback(() => {
    if (!currentProfileId) return;
    setProfiles(prev => {
      const next = { ...prev };
      delete next[currentProfileId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setCurrentProfileId(null);
    setViewMode('profiles');
  }, [currentProfileId]);

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
      const nowInMins = currentHour * 60 + currentMin;

      const [startH, startM] = currentProfile.startHour.split(':').map(Number);
      const startEatingInMins = startH * 60 + startM;
      
      const protocol = FASTING_PROTOCOLS[currentProfile.protocol];
      if (!protocol) return;

      const eatingWindowMins = protocol.eat * 60;
      const endEatingInMins = (startEatingInMins + eatingWindowMins) % (24 * 60);

      // Simple logic for window crossing midnight
      // This is a simplified version. A robust version needs full Date objects.
      
      // Let's use full Date objects for accuracy
      const eatingStart = new Date();
      eatingStart.setHours(startH, startM, 0, 0);
      
      const eatingEnd = new Date(eatingStart);
      eatingEnd.setHours(eatingStart.getHours() + protocol.eat);

      // If eating window ends tomorrow (e.g. starts 20:00, 8h window -> ends 04:00)
      // We need to handle the "current time" relative to these windows.
      
      // Simplified State Logic:
      // Are we inside the eating window?
      // If now is between start and end.
      
      // We need to find the *relevant* window for "now".
      // The window could be from yesterday's cycle, today's cycle, or tomorrow's.
      
      // Let's assume the cycle is anchored to the startHour of the current day.
      
      let isEating = false;
      let targetTime = new Date();

      // Check today's window
      if (now >= eatingStart && now < eatingEnd) {
        isEating = true;
        targetTime = eatingEnd;
      } else {
        // We are fasting.
        // Are we before today's window?
        if (now < eatingStart) {
           targetTime = eatingStart;
        } else {
           // We are after today's window, waiting for tomorrow's start
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
      maxSpeed: maxSpeed
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
    // Check last 7 days
    let streak = 0;
    for (let i = dayNum; i > dayNum - 7; i--) {
      if (i === dayNum) streak++; // Current day is being completed
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
      weight: weight ? weight.toString() : currentProfile.weight // Update current weight
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
    markDayComplete
  };
};
