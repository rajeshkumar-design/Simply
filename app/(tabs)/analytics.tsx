import { ScrollView, Text, View, Pressable, FlatList, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useHydration } from "@/lib/hydration-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import * as storage from "@/lib/storage";
import { DailyStats } from "@/lib/types";

type TimePeriod = "day" | "week" | "month" | "year";

/**
 * Analytics Screen - View hydration history and trends
 * 
 * Shows:
 * - Day, Week, Month, Year tabs
 * - Bar chart visualization
 * - Summary statistics
 * - Date navigation
 */
export default function AnalyticsScreen() {
  const colors = useColors();
  const { state } = useHydration();
  const { settings, isLoading } = state;

  const [period, setPeriod] = useState<TimePeriod>("day");
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dailyGoal = settings.daily_goal_ml;

  useEffect(() => {
    loadStats();
  }, [period, selectedDate]);

  const loadStats = async () => {
    setLoading(true);
    try {
      let data: DailyStats[] = [];
      switch (period) {
        case "day":
          const todayStats = await storage.getTodayStats();
          data = [todayStats];
          break;
        case "week":
          data = await storage.getWeekStats();
          break;
        case "month":
          data = await storage.getMonthStats();
          break;
        case "year":
          data = await storage.getYearStats();
          break;
      }
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (ml: number): string => {
    if (settings.unit_preference === "oz") {
      const oz = (ml / 29.5735).toFixed(1);
      return `${oz} oz`;
    }
    return `${ml} ml`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + "T00:00:00");
    switch (period) {
      case "day":
        return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      case "week":
        return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      case "month":
        return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      case "year":
        return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    }
  };

  const getMaxValue = (): number => {
    const max = Math.max(...stats.map(s => s.total_ml), dailyGoal);
    return Math.ceil(max / 500) * 500; // Round up to nearest 500
  };

  const maxValue = getMaxValue();
  const totalIntake = stats.reduce((sum, s) => sum + s.total_ml, 0);
  const averageIntake = stats.length > 0 ? Math.round(totalIntake / stats.length) : 0;
  const goalsReached = stats.filter(s => s.total_ml >= dailyGoal).length;

  if (isLoading || loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Header */}
          <View className="gap-1">
            <Text className="text-2xl font-bold text-foreground">Analytics</Text>
            <Text className="text-sm text-muted">Track your hydration progress</Text>
          </View>

          {/* Time Period Tabs */}
          <View className="flex-row gap-2">
            {(["day", "week", "month", "year"] as TimePeriod[]).map((p) => (
              <Pressable
                key={p}
                onPress={() => setPeriod(p)}
                style={({ pressed }) => [
                  {
                    backgroundColor: period === p ? colors.primary : colors.surface,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                className="flex-1 py-2 rounded-lg items-center border border-border"
              >
                <Text
                  className="text-sm font-semibold capitalize"
                  style={{ color: period === p ? "white" : colors.foreground }}
                >
                  {p}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Chart */}
          <View className="bg-surface rounded-2xl p-4 gap-4">
            <View className="h-40 flex-row items-flex-end justify-between gap-1">
              {stats.map((stat, index) => {
                const height = maxValue > 0 ? (stat.total_ml / maxValue) * 100 : 0;
                const isGoalReached = stat.total_ml >= dailyGoal;
                return (
                  <View key={index} className="flex-1 items-center gap-1">
                    <View
                      className="w-full rounded-t-lg"
                      style={{
                        height: `${Math.max(height, 5)}%`,
                        backgroundColor: isGoalReached ? colors.success : colors.primary,
                      }}
                    />
                  </View>
                );
              })}
            </View>

            {/* Chart Labels */}
            <View className="flex-row justify-between text-xs text-muted">
              {stats.map((stat, index) => (
                <Text key={index} className="text-xs text-muted flex-1 text-center">
                  {period === "year" ? stat.date.slice(0, 7) : stat.date.slice(-2)}
                </Text>
              ))}
            </View>

            {/* Goal Line Info */}
            <View className="flex-row items-center gap-2 pt-2 border-t border-border">
              <View className="w-3 h-3 rounded" style={{ backgroundColor: colors.primary }} />
              <Text className="text-xs text-muted">Below goal</Text>
              <View className="w-3 h-3 rounded" style={{ backgroundColor: colors.success }} />
              <Text className="text-xs text-muted">Goal reached</Text>
            </View>
          </View>

          {/* Summary Stats */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-muted">Summary</Text>
            <View className="grid gap-2">
              <View className="bg-surface rounded-2xl p-4 flex-row justify-between items-center border border-border">
                <View>
                  <Text className="text-xs text-muted">Total intake</Text>
                  <Text className="text-lg font-bold text-foreground mt-1">
                    {formatAmount(totalIntake)}
                  </Text>
                </View>
                <IconSymbol name="drop.fill" size={24} color={colors.primary} />
              </View>

              <View className="bg-surface rounded-2xl p-4 flex-row justify-between items-center border border-border">
                <View>
                  <Text className="text-xs text-muted">Average per day</Text>
                  <Text className="text-lg font-bold text-foreground mt-1">
                    {formatAmount(averageIntake)}
                  </Text>
                </View>
                <IconSymbol name="chart.bar.fill" size={24} color={colors.primary} />
              </View>

              <View className="bg-surface rounded-2xl p-4 flex-row justify-between items-center border border-border">
                <View>
                  <Text className="text-xs text-muted">Goals reached</Text>
                  <Text className="text-lg font-bold text-foreground mt-1">
                    {goalsReached} / {stats.length}
                  </Text>
                </View>
                <IconSymbol name="drop.fill" size={24} color={colors.success} />
              </View>
            </View>
          </View>

          {/* Daily Details (for day view) */}
          {period === "day" && stats[0]?.entries.length > 0 && (
            <View className="gap-2">
              <Text className="text-sm font-semibold text-muted">Today's entries</Text>
              <FlatList
                data={stats[0].entries}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => {
                  const date = new Date(item.timestamp);
                  const hours = String(date.getHours()).padStart(2, "0");
                  const minutes = String(date.getMinutes()).padStart(2, "0");
                  return (
                    <View className="bg-surface rounded-lg p-3 flex-row justify-between items-center mb-2 border border-border">
                      <View>
                        <Text className="text-sm font-semibold text-foreground">
                          {hours}:{minutes}
                        </Text>
                        <Text className="text-xs text-muted">
                          {formatAmount(item.amount_ml)}
                        </Text>
                      </View>
                      <View
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: colors.primary + "20" }}
                      />
                    </View>
                  );
                }}
              />
            </View>
          )}

          {stats.length === 0 && (
            <View className="bg-surface rounded-2xl p-6 items-center gap-2 mt-4">
              <Text className="text-sm text-muted">No data yet</Text>
              <Text className="text-xs text-muted text-center">
                Start logging water to see your analytics
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
