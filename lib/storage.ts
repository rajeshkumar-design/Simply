/**
 * AsyncStorage utilities for persisting water tracking data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Container, LogEntry, UserSettings, DailyStats } from './types';

const STORAGE_KEYS = {
  CONTAINERS: '@siply_containers',
  LOGS: '@siply_logs',
  SETTINGS: '@siply_settings',
};

// ============ Containers ============

export async function getContainers(): Promise<Container[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CONTAINERS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading containers:', error);
    return [];
  }
}

export async function saveContainers(containers: Container[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CONTAINERS, JSON.stringify(containers));
  } catch (error) {
    console.error('Error saving containers:', error);
  }
}

export async function addContainer(container: Container): Promise<void> {
  const containers = await getContainers();
  containers.push(container);
  await saveContainers(containers);
}

export async function updateContainer(id: string, updates: Partial<Container>): Promise<void> {
  const containers = await getContainers();
  const index = containers.findIndex(c => c.id === id);
  if (index !== -1) {
    containers[index] = { ...containers[index], ...updates };
    await saveContainers(containers);
  }
}

export async function deleteContainer(id: string): Promise<void> {
  const containers = await getContainers();
  const filtered = containers.filter(c => c.id !== id);
  await saveContainers(filtered);
}

// ============ Logs ============

export async function getLogs(): Promise<LogEntry[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LOGS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading logs:', error);
    return [];
  }
}

export async function saveLogs(logs: LogEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch (error) {
    console.error('Error saving logs:', error);
  }
}

export async function addLog(log: LogEntry): Promise<void> {
  const logs = await getLogs();
  logs.push(log);
  await saveLogs(logs);
}

export async function deleteLog(id: string): Promise<void> {
  const logs = await getLogs();
  const filtered = logs.filter(l => l.id !== id);
  await saveLogs(filtered);
}

export async function getTodayLogs(): Promise<LogEntry[]> {
  const logs = await getLogs();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowTime = tomorrow.getTime();
  
  return logs.filter(log => log.timestamp >= todayTime && log.timestamp < tomorrowTime);
}

export async function getLogsForDate(date: Date): Promise<LogEntry[]> {
  const logs = await getLogs();
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const startTime = startOfDay.getTime();
  
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);
  const endTime = endOfDay.getTime();
  
  return logs.filter(log => log.timestamp >= startTime && log.timestamp < endTime);
}

export async function getLastLog(): Promise<LogEntry | null> {
  const logs = await getLogs();
  return logs.length > 0 ? logs[logs.length - 1] : null;
}

// ============ Settings ============

const DEFAULT_SETTINGS: UserSettings = {
  daily_goal_ml: 3000,
  unit_preference: 'ml',
  theme: 'auto',
};

export async function getSettings(): Promise<UserSettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error reading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Partial<UserSettings>): Promise<void> {
  try {
    const current = await getSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// ============ Helpers ============

export async function getTodayStats(): Promise<DailyStats> {
  const entries = await getTodayLogs();
  const total_ml = entries.reduce((sum, entry) => sum + entry.amount_ml, 0);
  const today = new Date().toISOString().split('T')[0];
  
  return {
    date: today,
    total_ml,
    entries: entries.sort((a, b) => a.timestamp - b.timestamp),
  };
}

export async function getWeekStats(): Promise<DailyStats[]> {
  const stats: DailyStats[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const entries = await getLogsForDate(date);
    const total_ml = entries.reduce((sum, entry) => sum + entry.amount_ml, 0);
    const dateStr = date.toISOString().split('T')[0];
    stats.push({
      date: dateStr,
      total_ml,
      entries: entries.sort((a, b) => a.timestamp - b.timestamp),
    });
  }
  return stats;
}

export async function getMonthStats(): Promise<DailyStats[]> {
  const stats: DailyStats[] = [];
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(today.getFullYear(), today.getMonth(), day);
    const entries = await getLogsForDate(date);
    const total_ml = entries.reduce((sum, entry) => sum + entry.amount_ml, 0);
    const dateStr = date.toISOString().split('T')[0];
    stats.push({
      date: dateStr,
      total_ml,
      entries: entries.sort((a, b) => a.timestamp - b.timestamp),
    });
  }
  return stats;
}

export async function getYearStats(): Promise<DailyStats[]> {
  const stats: DailyStats[] = [];
  const today = new Date();
  const year = today.getFullYear();
  
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let monthTotal = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const entries = await getLogsForDate(date);
      monthTotal += entries.reduce((sum, entry) => sum + entry.amount_ml, 0);
    }
    
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    stats.push({
      date: dateStr,
      total_ml: monthTotal,
      entries: [],
    });
  }
  return stats;
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.CONTAINERS,
      STORAGE_KEYS.LOGS,
      STORAGE_KEYS.SETTINGS,
    ]);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}
