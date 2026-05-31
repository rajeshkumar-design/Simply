import { View, Text, Pressable, ActivityIndicator, useWindowDimensions, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useHydration } from '@/lib/hydration-context';
import { useLogFeedback } from '@/hooks/use-log-feedback';
import { WaveIllustration, FloatingNav, ToastBanner, LogSheet, WebHomePanel } from '@/components/hydration';
import { MIcon } from '@/components/ui/MIcon';
import { useColors } from '@/hooks/use-colors';
import { createId } from '@/lib/id';
import type { Container, LogEntry } from '@/lib/types';

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { state, addLog, addContainer, deleteLog, undoLastLog } = useHydration();
  const { toast, dismissToast, onLogSuccess, onUndo } = useLogFeedback();
  const [logSheetVisible, setLogSheetVisible] = useState(false);

  const { todayStats, settings, containers, isLoading } = state;
  const totalToday = todayStats?.total_ml ?? 0;
  const dailyGoal = settings.daily_goal_ml;
  const progress = dailyGoal > 0 ? Math.min(1, totalToday / dailyGoal) : 0;
  const entries = todayStats?.entries ?? [];

  const logWater = async (containerId: string, amountMl: number) => {
    const logEntry: LogEntry = {
      id: createId('log'),
      container_id: containerId,
      amount_ml: amountMl,
      timestamp: Date.now(),
    };
    await addLog(logEntry);
    await onLogSuccess(totalToday, amountMl, dailyGoal);
  };

  const handleCreateAndLog = async (container: Container, amountMl: number) => {
    await addContainer(container);
    await logWater(container.id, amountMl);
  };

  const handleUndo = async () => {
    await undoLastLog();
    await onUndo();
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-sky">
        <ActivityIndicator size="large" color={colors.oceanDeep} />
      </View>
    );
  }

  if (Platform.OS === 'web') {
    const leftWidth = Math.max(420, Math.round(width * 0.62));
    return (
      <View className="flex-1 flex-row bg-sky">
        <ToastBanner toast={toast} onDismiss={dismissToast} />
        <View className="relative overflow-hidden" style={{ width: leftWidth }}>
          <WaveIllustration progress={progress} width={leftWidth} height={height} />
          <View className="absolute inset-0 items-center justify-center px-10">
            <Text
              className="text-6xl font-extrabold text-foreground text-center"
              style={{ letterSpacing: -1.2 }}
            >
              {Math.round(totalToday)}
              <Text className="text-4xl font-bold text-foreground">/{Math.round(dailyGoal)}ml</Text>
            </Text>
            <Text className="text-lg font-semibold mt-4 text-muted">Waves</Text>
          </View>
        </View>
        <WebHomePanel
          containers={containers}
          entries={entries}
          unit={settings.unit_preference}
          onConfirm={logWater}
          onCreateAndLog={handleCreateAndLog}
          onDeleteLog={deleteLog}
          onSettings={() => router.push('/(tabs)/settings')}
          onHistory={() => router.push('/(tabs)/analytics')}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-sky">
      <WaveIllustration progress={progress} width={width} height={height} />

      <ToastBanner toast={toast} onDismiss={dismissToast} />

      <View className="flex-1" style={{ paddingTop: insets.top + 8 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5">
          <Text className="text-lg font-bold text-foreground">Today</Text>
          {entries.length > 0 ? (
            <Pressable
              onPress={handleUndo}
              hitSlop={10}
              className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={({ pressed }) => ({
                backgroundColor: 'rgba(255,255,255,0.5)',
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <MIcon name="undo" size={16} color={colors.foreground} />
              <Text className="text-xs font-semibold text-foreground">Undo</Text>
            </Pressable>
          ) : null}
        </View>

        {/* Hero intake */}
        <Animated.View entering={FadeIn.duration(400)} className="items-center mt-16 px-6">
          <Text className="text-5xl font-extrabold text-foreground text-center" style={{ letterSpacing: -1 }}>
            {Math.round(totalToday)}
            <Text className="text-3xl font-bold text-foreground">/{Math.round(dailyGoal)}ml</Text>
          </Text>
          <Text className="text-base font-medium mt-2" style={{ color: colors.foreground, opacity: 0.7 }}>
            Water intake & your goal
          </Text>
          {progress >= 1 ? (
            <View className="flex-row items-center gap-1.5 mt-3 px-4 py-1.5 rounded-full" style={{ backgroundColor: colors.success }}>
              <MIcon name="check-circle" size={16} color="#FFFFFF" />
              <Text className="text-sm font-bold text-white">Goal reached</Text>
            </View>
          ) : null}
        </Animated.View>

        <View className="flex-1" />

        {/* Floating navigation */}
        <View style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
          <FloatingNav
            onSettings={() => router.push('/(tabs)/settings')}
            onAddWater={() => setLogSheetVisible(true)}
            onHistory={() => router.push('/(tabs)/analytics')}
          />
        </View>
      </View>

      <LogSheet
        visible={logSheetVisible}
        onClose={() => setLogSheetVisible(false)}
        containers={containers}
        unit={settings.unit_preference}
        onConfirm={logWater}
        onCreateAndLog={handleCreateAndLog}
      />
    </View>
  );
}
