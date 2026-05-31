import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeOut, Layout } from 'react-native-reanimated';
import type { LogEntry, Container } from '@/lib/types';
import { formatAmount, type UnitPreference } from '@/lib/format-hydration';
import { useColors } from '@/hooks/use-colors';
import { MCIcon, MIcon } from '@/components/ui/MIcon';
import { elevatedCardStyle } from './card-styles';
import { resolveVesselIcon } from '@/lib/vessel-icons';

interface LogTimelineProps {
  entries: LogEntry[];
  containers: Container[];
  unit: UnitPreference;
  onDelete: (id: string) => void;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function LogTimeline({ entries, containers, unit, onDelete }: LogTimelineProps) {
  const colors = useColors();

  const getContainer = (id: string) => containers.find((c) => c.id === id);

  if (entries.length === 0) {
    return (
      <View className="rounded-2xl p-6 items-center gap-2 bg-surface" style={elevatedCardStyle()}>
        <Text className="text-sm text-muted">No entries yet</Text>
        <Text className="text-xs text-muted text-center">Tap a container above to log your first sip</Text>
      </View>
    );
  }

  const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-muted px-1">Today&apos;s log</Text>
      <View className="gap-2">
        {sorted.map((entry, index) => {
          const container = getContainer(entry.container_id);
          return (
            <Animated.View
              key={entry.id}
              entering={FadeInDown.delay(index * 40).springify().damping(18)}
              exiting={FadeOut.duration(200)}
              layout={Layout.springify()}
            >
              <View
                className="flex-row items-center justify-between rounded-2xl px-4 py-3 bg-surface"
                style={elevatedCardStyle()}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.primary + '20' }}
                  >
                    <MCIcon name={resolveVesselIcon(container?.emoji ?? 'glass')} size={20} color={colors.accent} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">
                      {container?.name ?? 'Water'}
                    </Text>
                    <View className="flex-row items-center gap-1.5 mt-0.5">
                      <MIcon name="schedule" size={11} color={colors.muted} />
                      <Text className="text-xs text-muted">{formatTime(entry.timestamp)}</Text>
                    </View>
                  </View>
                </View>
                <View className="flex-row items-center gap-3">
                  <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                    +{formatAmount(entry.amount_ml, unit)}
                  </Text>
                  <Pressable
                    onPress={() => onDelete(entry.id)}
                    hitSlop={8}
                    style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1 })}
                  >
                    <MIcon name="delete-outline" size={17} color={colors.muted} />
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}
