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
}

export interface Profile {
  id: string; // Added ID for easier management
  studentName: string;
  weight: string;
  height: string;
  targetLostWeight: string;
  targetDistance: string;
  duration: string;
  fastingDays: number[];
  protocol: string; // Fasting protocol
  startHour: string;
  footballDays: number[];
  workoutProtocol: string; // Added to separate from fasting protocol
  gender: 'm' | 'f';
  focuses: string[];
  startDate: string;
  dailyLogs: Record<number, DailyLog>;
  runDays: number[];
  runDistances: Record<number, string>;
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
