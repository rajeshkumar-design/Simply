import { ScrollView, Text, View, Pressable, FlatList, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useHydration } from "@/lib/hydration-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { v4 as uuidv4 } from "uuid";
import { Container, LogEntry } from "@/lib/types";

/**
 * Home Screen - Water Tracking Dashboard
 * 
 * Displays:
 * - Today's date and header
 * - Progress ring showing goal completion
 * - Remaining water amount
 * - Quick-add container cards
 * - Today's timeline with logged entries
 */
export default function HomeScreen() {
  const colors = useColors();
  const { state, addLog, deleteLog, undoLastLog } = useHydration();
  const [showUndoButton, setShowUndoButton] = useState(false);

  const { todayStats, settings, containers, isLoading } = state;
  const totalToday = todayStats?.total_ml ?? 0;
  const dailyGoal = settings.daily_goal_ml;
  const remaining = Math.max(0, dailyGoal - totalToday);
  const progress = Math.min(1, totalToday / dailyGoal);
  const entries = todayStats?.entries ?? [];

  // Show undo button if there are entries
  useEffect(() => {
    setShowUndoButton(entries.length > 0);
  }, [entries.length]);

  const handleContainerTap = async (container: Container) => {
    // Haptic feedback
    if (container) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Create log entry
    const logEntry: LogEntry = {
      id: uuidv4(),
      container_id: container.id,
      amount_ml: container.capacity_ml,
      timestamp: Date.now(),
    };

    await addLog(logEntry);
  };

  const handleDeleteEntry = async (entryId: string) => {
    await deleteLog(entryId);
  };

  const handleUndo = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await undoLastLog();
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatAmount = (ml: number): string => {
    if (settings.unit_preference === "oz") {
      const oz = (ml / 29.5735).toFixed(1);
      return `${oz} oz`;
    }
    return `${ml} ml`;
  };

  const getContainerName = (containerId: string): string => {
    const container = containers.find(c => c.id === containerId);
    return container ? container.name : "Unknown";
  };

  const getContainerEmoji = (containerId: string): string => {
    const container = containers.find(c => c.id === containerId);
    return container?.emoji ?? "🥤";
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-1">
            <Text className="text-sm text-muted">Today</Text>
            <Text className="text-2xl font-bold text-foreground">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </Text>
          </View>

          {/* Progress Ring and Stats */}
          <View className="bg-surface rounded-3xl p-6 gap-4 items-center">
            {/* Progress Ring (Simple Circle) */}
            <View className="w-32 h-32 rounded-full border-4 items-center justify-center" style={{ borderColor: colors.primary }}>
              <View className="absolute w-32 h-32 rounded-full" style={{
                backgroundColor: colors.primary,
                opacity: progress * 0.1,
              }} />
              <View className="items-center gap-1">
                <Text className="text-3xl font-bold text-foreground">
                  {(progress * 100).toFixed(0)}%
                </Text>
                <Text className="text-xs text-muted">of goal</Text>
              </View>
            </View>

            {/* Stats */}
            <View className="w-full gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Total today</Text>
                <Text className="text-lg font-semibold text-foreground">
                  {formatAmount(totalToday)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Daily goal</Text>
                <Text className="text-lg font-semibold text-foreground">
                  {formatAmount(dailyGoal)}
                </Text>
              </View>
              <View className="flex-row justify-between border-t border-border pt-2">
                <Text className="text-sm text-muted">Remaining</Text>
                <Text className="text-lg font-semibold" style={{ color: remaining === 0 ? colors.success : colors.primary }}>
                  {formatAmount(remaining)}
                </Text>
              </View>
            </View>

            {/* Undo Button */}
            {showUndoButton && (
              <Pressable
                onPress={handleUndo}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.error,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                className="w-full py-2 rounded-lg flex-row items-center justify-center gap-2"
              >
                <IconSymbol name="arrow.uturn.left" size={16} color="white" />
                <Text className="text-sm font-semibold text-white">Undo last</Text>
              </Pressable>
            )}
          </View>

          {/* Quick-Add Containers */}
          {containers.length > 0 ? (
            <View className="gap-2">
              <Text className="text-sm font-semibold text-muted">Quick add</Text>
              <FlatList
                data={containers}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleContainerTap(item)}
                    style={({ pressed }) => [
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        borderWidth: 1,
                        opacity: pressed ? 0.7 : 1,
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                      },
                    ]}
                    className="p-4 rounded-2xl flex-row items-center justify-between mb-2"
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <Text className="text-3xl">{item.emoji}</Text>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground">
                          {item.name}
                        </Text>
                        <Text className="text-xs text-muted">
                          +{formatAmount(item.capacity_ml)}
                        </Text>
                      </View>
                    </View>
                    <IconSymbol name="plus" size={20} color={colors.primary} />
                  </Pressable>
                )}
              />
            </View>
          ) : (
            <View className="bg-surface rounded-2xl p-4 items-center gap-2">
              <Text className="text-sm text-muted">No containers yet</Text>
              <Text className="text-xs text-muted text-center">
                Go to Containers tab to create your first bottle or cup
              </Text>
            </View>
          )}

          {/* Today's Timeline */}
          {entries.length > 0 ? (
            <View className="gap-2">
              <Text className="text-sm font-semibold text-muted">Today's log</Text>
              <FlatList
                data={entries}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View className="bg-surface rounded-xl p-3 flex-row items-center justify-between mb-2 border border-border">
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: colors.primary + "20" }}>
                        <Text className="text-lg">{getContainerEmoji(item.container_id)}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground">
                          {getContainerName(item.container_id)}
                        </Text>
                        <View className="flex-row items-center gap-2">
                          <IconSymbol name="clock" size={12} color={colors.muted} />
                          <Text className="text-xs text-muted">
                            {formatTime(item.timestamp)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="flex-row items-center gap-3">
                      <Text className="text-sm font-semibold text-primary">
                        +{formatAmount(item.amount_ml)}
                      </Text>
                      <Pressable
                        onPress={() => handleDeleteEntry(item.id)}
                        style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
                      >
                        <IconSymbol name="trash" size={18} color={colors.error} />
                      </Pressable>
                    </View>
                  </View>
                )}
              />
            </View>
          ) : (
            <View className="bg-surface rounded-2xl p-4 items-center gap-2 mb-4">
              <Text className="text-sm text-muted">No entries yet</Text>
              <Text className="text-xs text-muted text-center">
                Tap a container to log your first sip!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
