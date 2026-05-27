/**
 * Global hydration state context for managing containers, logs, and settings
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Container, LogEntry, UserSettings, DailyStats } from './types';
import * as storage from './storage';

interface HydrationState {
  containers: Container[];
  logs: LogEntry[];
  settings: UserSettings;
  todayStats: DailyStats | null;
  isLoading: boolean;
}

type HydrationAction =
  | { type: 'SET_CONTAINERS'; payload: Container[] }
  | { type: 'ADD_CONTAINER'; payload: Container }
  | { type: 'UPDATE_CONTAINER'; payload: { id: string; updates: Partial<Container> } }
  | { type: 'DELETE_CONTAINER'; payload: string }
  | { type: 'SET_LOGS'; payload: LogEntry[] }
  | { type: 'ADD_LOG'; payload: LogEntry }
  | { type: 'DELETE_LOG'; payload: string }
  | { type: 'UNDO_LAST_LOG' }
  | { type: 'SET_SETTINGS'; payload: UserSettings }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'SET_TODAY_STATS'; payload: DailyStats }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: HydrationState = {
  containers: [],
  logs: [],
  settings: {
    daily_goal_ml: 3000,
    unit_preference: 'ml',
    theme: 'auto',
  },
  todayStats: null,
  isLoading: true,
};

function hydrationReducer(state: HydrationState, action: HydrationAction): HydrationState {
  switch (action.type) {
    case 'SET_CONTAINERS':
      return { ...state, containers: action.payload };
    case 'ADD_CONTAINER':
      return { ...state, containers: [...state.containers, action.payload] };
    case 'UPDATE_CONTAINER':
      return {
        ...state,
        containers: state.containers.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload.updates } : c
        ),
      };
    case 'DELETE_CONTAINER':
      return {
        ...state,
        containers: state.containers.filter(c => c.id !== action.payload),
      };
    case 'SET_LOGS':
      return { ...state, logs: action.payload };
    case 'ADD_LOG': {
      const newLogs = [...state.logs, action.payload];
      const todayStats = state.todayStats
        ? {
            ...state.todayStats,
            total_ml: state.todayStats.total_ml + action.payload.amount_ml,
            entries: [...state.todayStats.entries, action.payload].sort(
              (a, b) => a.timestamp - b.timestamp
            ),
          }
        : state.todayStats;
      return { ...state, logs: newLogs, todayStats };
    }
    case 'DELETE_LOG': {
      const deletedLog = state.logs.find(l => l.id === action.payload);
      const newLogs = state.logs.filter(l => l.id !== action.payload);
      const todayStats = state.todayStats && deletedLog
        ? {
            ...state.todayStats,
            total_ml: Math.max(0, state.todayStats.total_ml - deletedLog.amount_ml),
            entries: state.todayStats.entries.filter(e => e.id !== action.payload),
          }
        : state.todayStats;
      return { ...state, logs: newLogs, todayStats };
    }
    case 'UNDO_LAST_LOG': {
      if (state.logs.length === 0) return state;
      const lastLog = state.logs[state.logs.length - 1];
      const newLogs = state.logs.slice(0, -1);
      const todayStats = state.todayStats
        ? {
            ...state.todayStats,
            total_ml: Math.max(0, state.todayStats.total_ml - lastLog.amount_ml),
            entries: state.todayStats.entries.filter(e => e.id !== lastLog.id),
          }
        : state.todayStats;
      return { ...state, logs: newLogs, todayStats };
    }
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_TODAY_STATS':
      return { ...state, todayStats: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

interface HydrationContextType {
  state: HydrationState;
  addContainer: (container: Container) => Promise<void>;
  updateContainer: (id: string, updates: Partial<Container>) => Promise<void>;
  deleteContainer: (id: string) => Promise<void>;
  addLog: (log: LogEntry) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
  undoLastLog: () => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  refreshTodayStats: () => Promise<void>;
}

const HydrationContext = createContext<HydrationContextType | undefined>(undefined);

export function HydrationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(hydrationReducer, initialState);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const [containers, logs, settings, todayStats] = await Promise.all([
          storage.getContainers(),
          storage.getLogs(),
          storage.getSettings(),
          storage.getTodayStats(),
        ]);
        dispatch({ type: 'SET_CONTAINERS', payload: containers });
        dispatch({ type: 'SET_LOGS', payload: logs });
        dispatch({ type: 'SET_SETTINGS', payload: settings });
        dispatch({ type: 'SET_TODAY_STATS', payload: todayStats });
      } catch (error) {
        console.error('Error loading hydration data:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
    loadData();
  }, []);

  const addContainer = async (container: Container) => {
    dispatch({ type: 'ADD_CONTAINER', payload: container });
    await storage.addContainer(container);
  };

  const updateContainer = async (id: string, updates: Partial<Container>) => {
    dispatch({ type: 'UPDATE_CONTAINER', payload: { id, updates } });
    await storage.updateContainer(id, updates);
  };

  const deleteContainer = async (id: string) => {
    dispatch({ type: 'DELETE_CONTAINER', payload: id });
    await storage.deleteContainer(id);
  };

  const addLog = async (log: LogEntry) => {
    dispatch({ type: 'ADD_LOG', payload: log });
    await storage.addLog(log);
  };

  const deleteLog = async (id: string) => {
    dispatch({ type: 'DELETE_LOG', payload: id });
    await storage.deleteLog(id);
  };

  const undoLastLog = async () => {
    const lastLog = state.logs[state.logs.length - 1];
    if (lastLog) {
      dispatch({ type: 'UNDO_LAST_LOG' });
      await storage.deleteLog(lastLog.id);
    }
  };

  const updateSettings = async (settings: Partial<UserSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    await storage.saveSettings(settings);
  };

  const refreshTodayStats = async () => {
    const todayStats = await storage.getTodayStats();
    dispatch({ type: 'SET_TODAY_STATS', payload: todayStats });
  };

  const value: HydrationContextType = {
    state,
    addContainer,
    updateContainer,
    deleteContainer,
    addLog,
    deleteLog,
    undoLastLog,
    updateSettings,
    refreshTodayStats,
  };

  return (
    <HydrationContext.Provider value={value}>
      {children}
    </HydrationContext.Provider>
  );
}

export function useHydration(): HydrationContextType {
  const context = useContext(HydrationContext);
  if (!context) {
    throw new Error('useHydration must be used within HydrationProvider');
  }
  return context;
}
