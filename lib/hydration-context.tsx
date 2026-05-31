/**
 * Global hydration state context for managing containers, logs, and settings
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useMemo } from 'react';
import { Container, LogEntry, UserSettings, DailyStats } from './types';
import { trpc } from './trpc';
import { useAuth } from '@/hooks/use-auth';

interface HydrationState {
  containers: Container[];
  logs: LogEntry[];
  settings: UserSettings;
  hasSettings: boolean;
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
  | { type: 'SET_SETTINGS'; payload: { settings: UserSettings; hasSettings: boolean } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'SET_TODAY_STATS'; payload: DailyStats }
  | { type: 'SET_LOADING'; payload: boolean };

const DEFAULT_SETTINGS: UserSettings = {
  daily_goal_ml: 3000,
  unit_preference: 'ml',
  theme: 'auto',
  wake_time: null,
  sleep_time: null,
};

const initialState: HydrationState = {
  containers: [],
  logs: [],
  settings: DEFAULT_SETTINGS,
  hasSettings: false,
  todayStats: null,
  isLoading: true,
};

function getTodayStats(logs: LogEntry[]): DailyStats {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const entries = logs
    .filter((log) => log.timestamp >= start.getTime() && log.timestamp < end.getTime())
    .sort((a, b) => a.timestamp - b.timestamp);

  return {
    date: start.toISOString().split('T')[0],
    total_ml: entries.reduce((sum, entry) => sum + entry.amount_ml, 0),
    entries,
  };
}

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
      return { ...state, logs: action.payload, todayStats: getTodayStats(action.payload) };
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
      return {
        ...state,
        settings: action.payload.settings,
        hasSettings: action.payload.hasSettings,
      };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload }, hasSettings: true };
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
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const containersQuery = trpc.hydration.containers.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const logsQuery = trpc.hydration.logs.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const settingsQuery = trpc.hydration.settings.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const upsertContainerMutation = trpc.hydration.containers.upsert.useMutation();
  const deleteContainerMutation = trpc.hydration.containers.delete.useMutation();
  const addLogMutation = trpc.hydration.logs.add.useMutation();
  const deleteLogMutation = trpc.hydration.logs.delete.useMutation();
  const updateSettingsMutation = trpc.hydration.settings.update.useMutation();

  const isQueryLoading = useMemo(
    () =>
      isAuthenticated &&
      (containersQuery.isLoading || logsQuery.isLoading || settingsQuery.isLoading),
    [containersQuery.isLoading, isAuthenticated, logsQuery.isLoading, settingsQuery.isLoading],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch({ type: 'SET_CONTAINERS', payload: [] });
      dispatch({ type: 'SET_LOGS', payload: [] });
      dispatch({ type: 'SET_SETTINGS', payload: { settings: DEFAULT_SETTINGS, hasSettings: false } });
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: isQueryLoading });
  }, [isAuthenticated, isQueryLoading]);

  useEffect(() => {
    if (containersQuery.data) {
      dispatch({ type: 'SET_CONTAINERS', payload: containersQuery.data });
    }
  }, [containersQuery.data]);

  useEffect(() => {
    if (logsQuery.data) {
      dispatch({ type: 'SET_LOGS', payload: logsQuery.data });
    }
  }, [logsQuery.data]);

  useEffect(() => {
    if (settingsQuery.data !== undefined) {
      dispatch({
        type: 'SET_SETTINGS',
        payload: {
          settings: settingsQuery.data ? { ...DEFAULT_SETTINGS, ...settingsQuery.data } : DEFAULT_SETTINGS,
          hasSettings: Boolean(settingsQuery.data),
        },
      });
    }
  }, [settingsQuery.data]);

  const addContainer = async (container: Container) => {
    dispatch({ type: 'ADD_CONTAINER', payload: container });
    await upsertContainerMutation.mutateAsync(container);
    await utils.hydration.containers.list.invalidate();
  };

  const updateContainer = async (id: string, updates: Partial<Container>) => {
    const current = state.containers.find((container) => container.id === id);
    if (!current) return;
    const updated = { ...current, ...updates };
    dispatch({ type: 'UPDATE_CONTAINER', payload: { id, updates } });
    await upsertContainerMutation.mutateAsync(updated);
    await utils.hydration.containers.list.invalidate();
  };

  const deleteContainer = async (id: string) => {
    dispatch({ type: 'DELETE_CONTAINER', payload: id });
    await deleteContainerMutation.mutateAsync({ id });
    await utils.hydration.containers.list.invalidate();
  };

  const addLog = async (log: LogEntry) => {
    dispatch({ type: 'ADD_LOG', payload: log });
    await addLogMutation.mutateAsync(log);
    await utils.hydration.logs.list.invalidate();
  };

  const deleteLog = async (id: string) => {
    dispatch({ type: 'DELETE_LOG', payload: id });
    await deleteLogMutation.mutateAsync({ id });
    await utils.hydration.logs.list.invalidate();
  };

  const undoLastLog = async () => {
    const lastLog = state.logs[state.logs.length - 1];
    if (lastLog) {
      dispatch({ type: 'UNDO_LAST_LOG' });
      await deleteLogMutation.mutateAsync({ id: lastLog.id });
      await utils.hydration.logs.list.invalidate();
    }
  };

  const updateSettings = async (settings: Partial<UserSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    await updateSettingsMutation.mutateAsync(settings);
    await utils.hydration.settings.get.invalidate();
  };

  const refreshTodayStats = async () => {
    dispatch({ type: 'SET_TODAY_STATS', payload: getTodayStats(state.logs) });
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
