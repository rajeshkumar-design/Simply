import { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/use-colors';
import type { DailyStats } from '@/lib/types';
import { elevatedCardStyle } from './card-styles';

const CHART_HEIGHT = 140;

interface AnimatedBarChartProps {
  stats: DailyStats[];
  dailyGoal: number;
  formatLabel: (date: string, index: number) => string;
}

function Bar({
  heightPercent,
  color,
}: {
  heightPercent: number;
  color: string;
}) {
  const targetHeight = (Math.max(heightPercent, 4) / 100) * CHART_HEIGHT;
  const animatedHeight = useSharedValue(0);

  useEffect(() => {
    animatedHeight.value = withSpring(targetHeight, {
      damping: 16,
      stiffness: 90,
    });
  }, [targetHeight, animatedHeight]);

  const style = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    backgroundColor: color,
  }));

  return <Animated.View className="w-full rounded-t-lg" style={style} />;
}

export function AnimatedBarChart({ stats, dailyGoal, formatLabel }: AnimatedBarChartProps) {
  const colors = useColors();
  const maxValue = Math.max(...stats.map((s) => s.total_ml), dailyGoal, 1);
  const roundedMax = Math.ceil(maxValue / 500) * 500 || 500;

  return (
    <View className="rounded-2xl p-4 bg-surface gap-4" style={elevatedCardStyle()}>
      <View style={{ height: CHART_HEIGHT }} className="flex-row items-end justify-between gap-1.5">
        {stats.map((stat, index) => {
          const heightPercent = (stat.total_ml / roundedMax) * 100;
          const isGoalReached = stat.total_ml >= dailyGoal;
          return (
            <View key={stat.date + index} className="flex-1 items-center justify-end h-full">
              <Bar
                heightPercent={heightPercent}
                color={isGoalReached ? colors.success : colors.primary}
              />
            </View>
          );
        })}
      </View>
      <View className="flex-row justify-between">
        {stats.map((stat, index) => (
          <Text
            key={stat.date + index}
            className="text-[10px] text-muted flex-1 text-center"
            numberOfLines={1}
          >
            {formatLabel(stat.date, index)}
          </Text>
        ))}
      </View>
      <View className="flex-row items-center gap-4 pt-2 border-t border-border">
        <View className="flex-row items-center gap-1.5">
          <View className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colors.primary }} />
          <Text className="text-xs text-muted">Below goal</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colors.success }} />
          <Text className="text-xs text-muted">Goal reached</Text>
        </View>
      </View>
    </View>
  );
}
