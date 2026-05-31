/**
 * Data types for the Siply water tracking app
 */

export interface Container {
  id: string;
  name: string;
  capacity_ml: number;
  emoji: string;
  created_at: number; // timestamp
}

export interface LogEntry {
  id: string;
  container_id: string;
  amount_ml: number;
  timestamp: number; // milliseconds since epoch
}

export interface UserSettings {
  daily_goal_ml: number;
  unit_preference: 'ml' | 'oz'; // ml or oz
  theme: 'light' | 'dark' | 'auto';
  wake_time?: string | null;
  sleep_time?: string | null;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  total_ml: number;
  entries: LogEntry[];
}
