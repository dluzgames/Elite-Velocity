export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
}

export interface DailyLog {
  completed: boolean;
  weight?: number;
  water: number;
  protein: number;
  workoutCompleted: boolean;
  waterCompleted: boolean;
  proteinCompleted: boolean;
  maxSpeed?: number;
  notes?: string;
  exerciseNotes?: Record<string, string>;
  distanceRun?: number;
}

export interface Profile {
  id: string;
  userId?: string;
  studentName: string;
  weight: string;
  height: string;
  targetLostWeight: string;
  targetDistance: string;
  duration: string;
  fastingDays: number[];
  protocol: string;
  startHour: string;
  workoutProtocol: string;
  gender: 'm' | 'f';
  focuses: string[];
  startDate: string;
  dailyLogs: Record<number, DailyLog>;
  runDays: number[];
  runDistances: Record<number, string>;
  runningDifficulty: 'none' | 'beginner' | 'advanced' | 'expert';
  badges: string[];
}

export type ViewMode = 'loading' | 'profiles' | 'onboarding' | 'dashboard' | 'history' | 'spreadsheet';

export interface FastingProtocolData {
  label: string;
  fast: number;
  eat: number;
}

export interface Badge {
  id: string;
  label: string;
  icon: string;
  desc: string;
}
