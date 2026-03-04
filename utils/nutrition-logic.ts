import { Profile, Meal } from '@/types';

export const calculateProteinTarget = (profile: Profile): number => {
  const weight = parseFloat(profile.weight);
  const height = parseFloat(profile.height) / 100; // Convert cm to m
  
  if (!weight || !height) return Math.round(weight * 2); // Fallback if data missing

  const imc = weight / (height * height);
  let multiplier = 1.8; // Base multiplier

  // Adjust based on Workout Protocol
  if (profile.workoutProtocol === 'resistance' || profile.workoutProtocol === 'classic') {
    multiplier += 0.2;
  } else if (profile.workoutProtocol === 'tabata') {
    multiplier += 0.1;
  }

  // Adjust based on Focuses
  if (profile.focuses?.includes('sup') || profile.focuses?.includes('inf')) {
    multiplier += 0.1;
  }

  // Adjust based on IMC
  if (imc > 25) {
    multiplier += 0.1; // Higher protein for satiety during weight loss
  } else if (imc < 18.5) {
    multiplier -= 0.1; // Lower protein to allow more calories from carbs/fats for gain
  }

  // Cap multiplier
  multiplier = Math.max(1.6, Math.min(2.5, multiplier));

  return Math.round(weight * multiplier);
};

export const calculateCaloriesTarget = (profile: Profile): number => {
  const weight = parseFloat(profile.weight);
  // Simple calorie estimation based on goal
  // Maintenance ~ 30-32 kcal/kg
  // Loss ~ 24-26 kcal/kg
  // Gain ~ 35+ kcal/kg
  
  // Since we don't have explicit "gain/loss" flag other than targetLostWeight, 
  // we infer: if targetLostWeight > 0 -> Loss. Else -> Maintenance/Gain.
  
  const targetLost = parseFloat(profile.targetLostWeight);
  
  if (targetLost > 0) {
    return Math.round(weight * 24); // Deficit
  } else {
    return Math.round(weight * 32); // Maintenance/Gain
  }
};

export const getCurrentWeight = (profile: Profile, currentDay: number): number => {
  // Try to find the latest weight logged up to current day
  for (let i = currentDay; i >= 1; i--) {
    if (profile.dailyLogs[i]?.weight) {
      return profile.dailyLogs[i].weight!;
    }
  }
  // Fallback to initial weight
  return parseFloat(profile.weight);
};

export const calculateBMI = (weight: number, heightCm: number): string => {
  const heightM = heightCm / 100;
  const bmi = weight / (heightM * heightM);
  return bmi.toFixed(1);
};

export const getBMIStatus = (bmi: number): string => {
  if (bmi < 18.5) return 'Abaixo do Peso';
  if (bmi < 24.9) return 'Peso Normal';
  if (bmi < 29.9) return 'Sobrepeso';
  return 'Obesidade';
};

export const calculateMealTotals = (meals: Meal[] = []) => {
  return meals.reduce((acc, meal) => ({
    calories: acc.calories + (meal.calories || 0),
    protein: acc.protein + (meal.protein || 0),
    carbs: acc.carbs + (meal.carbs || 0),
    fats: acc.fats + (meal.fats || 0),
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
};
