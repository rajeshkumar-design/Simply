import { ScrollView, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useHydration } from '@/lib/hydration-context';
import { LogEntry } from '@/lib/types';
import { formatAmount } from '@/lib/format-hydration';
import { HistoryChart } from '@/components/hydration';
import type { ChartDay } from '@/components/hydration/HistoryChart';
import { MIcon } from '@/components/ui/MIcon';
import { useColors } from '@/hooks/use-colors';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface DayData {
  date: Date;
  total: number;
  entries: LogEntry[];
}

function startOfWeek(weekOffset: number): Date {
  const now = new Date();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - now.getDay() + weekOffset * 7);
  sunday.setHours(0, 0, 0, 0);
  return sunday;
}

function fmt(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}/${m}/${d}`;
}

export default function AnalyticsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { state } = useHydration();
  const { settings, isLoading, logs } = state;
  const dailyGoal = settings.daily_goal_ml;
  const unit = settings.unit_preference;

  const [weekOffset, setWeekOffset] = useState(0);
  const [week, setWeek] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(false);

  const loadWeek = useCallback(async () => {
    setLoading(true);
    try {
      const sunday = startOfWeek(weekOffset);
      const days: DayData[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(sunday);
        date.setDate(sunday.getDate() + i);
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        const entries = logs.filter(
          (entry) => entry.timestamp >= dayStart.getTime() && entry.timestamp < dayEnd.getTime(),
        );
        const total = entries.reduce((sum, e) => sum + e.amount_ml, 0);
        days.push({ date, total, entries });
      }
      setWeek(days);
    } finally {
      setLoading(false);
    }
  }, [logs, weekOffset]);

  useEffect(() => {
    loadWeek();
  }, [loadWeek]);

  const weekStart = startOfWeek(weekOffset);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const totalIntake = week.reduce((sum, d) => sum + d.total, 0);
  const avgDaily = week.length > 0 ? Math.round(totalIntake / 7) : 0;
  const complianceDays = week.filter((d) => d.total >= dailyGoal && dailyGoal > 0).length;
  const glasses = week.reduce((sum, d) => sum + d.entries.length, 0);

  const chartDays: ChartDay[] = week.map((d, i) => ({ label: DAY_LABELS[i], total: d.total }));
  const trackerDays = week.filter((d) => d.entries.length > 0).sort((a, b) => b.date.getTime() - a.date.getTime());

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.accent} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="px-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View className="gap-5">
          {/* Header */}
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            className="w-10 h-10 rounded-full items-center justify-center -ml-2 mt-1"
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <MIcon name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>

          <Text className="text-3xl font-extrabold text-foreground">History</Text>

          {/* Avg metric */}
          <View>
            <Text className="text-sm text-muted">Avg Daily Drinking</Text>
            <Text className="text-3xl font-extrabold text-foreground mt-0.5">
              {formatAmount(avgDaily, unit)}
            </Text>
          </View>

          {/* Chart card */}
          <View className="rounded-3xl p-5 bg-surfaceElevated">
            {loading ? (
              <View className="h-48 items-center justify-center">
                <ActivityIndicator color={colors.accent} />
              </View>
            ) : (
              <HistoryChart days={chartDays} goal={dailyGoal} />
            )}
            <View className="flex-row items-center gap-4 mt-4 pt-3 border-t border-border">
              <View className="flex-row items-center gap-1.5">
                <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.warning }} />
                <Text className="text-xs text-muted">Your goal</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.accent }} />
                <Text className="text-xs text-muted">Water intake</Text>
              </View>
            </View>
          </View>

          {/* Week navigation */}
          <View className="flex-row items-center justify-center gap-6">
            <Pressable onPress={() => setWeekOffset((w) => w - 1)} hitSlop={10}>
              <MIcon name="chevron-left" size={26} color={colors.foreground} />
            </Pressable>
            <Text className="text-base font-semibold text-foreground">
              {fmt(weekStart).slice(5)}~{fmt(weekEnd).slice(5)}
            </Text>
            <Pressable
              onPress={() => setWeekOffset((w) => Math.min(0, w + 1))}
              hitSlop={10}
              disabled={weekOffset >= 0}
            >
              <MIcon name="chevron-right" size={26} color={weekOffset >= 0 ? colors.muted : colors.foreground} />
            </Pressable>
          </View>

          {/* Key indicators */}
          <View className="gap-2">
            <Text className="text-lg font-bold text-foreground">Key indicators</Text>
            <View className="rounded-3xl px-5 bg-surfaceElevated">
              <Indicator label="Compliance days" value={`${complianceDays} days`} />
              <Indicator label="Number of glasses" value={`${glasses} times`} />
              <Indicator label="Weekly intake" value={formatAmount(totalIntake, unit)} isLast />
            </View>
          </View>

          {/* Hydration tracker */}
          <View className="gap-2">
            <Text className="text-lg font-bold text-foreground">Hydration Tracker</Text>
            <View className="rounded-3xl px-5 bg-surfaceElevated">
              {trackerDays.length > 0 ? (
                trackerDays.map((d, i) => (
                  <View
                    key={d.date.toISOString()}
                    className={`flex-row items-center justify-between py-4 ${i < trackerDays.length - 1 ? 'border-b border-border' : ''}`}
                  >
                    <View className="flex-row items-center gap-2">
                      <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.accent }} />
                      <Text className="text-base font-semibold text-foreground">
                        {d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                    <Text className="text-sm text-muted">Total: {formatAmount(d.total, unit)}</Text>
                  </View>
                ))
              ) : (
                <Text className="text-sm text-muted py-6 text-center">No entries this week</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function Indicator({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
  return (
    <View className={`flex-row items-center justify-between py-4 ${!isLast ? 'border-b border-border' : ''}`}>
      <Text className="text-base text-foreground">{label}</Text>
      <Text className="text-base font-bold text-foreground">{value}</Text>
    </View>
  );
}
