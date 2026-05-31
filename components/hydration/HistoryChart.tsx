import { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useColors } from '@/hooks/use-colors';

const CHART_HEIGHT = 160;

export interface ChartDay {
  label: string;
  total: number;
}

interface HistoryChartProps {
  days: ChartDay[];
  goal: number;
}

function AnimatedBar({ heightPx, color }: { heightPx: number; color: string }) {
  const h = useSharedValue(0);
  useEffect(() => {
    h.value = withSpring(heightPx, { damping: 16, stiffness: 90 });
  }, [heightPx, h]);
  const style = useAnimatedStyle(() => ({ height: h.value }));
  return <Animated.View className="w-full rounded-t-md" style={[style, { backgroundColor: color }]} />;
}

export function HistoryChart({ days, goal }: HistoryChartProps) {
  const colors = useColors();
  const maxValue = Math.max(goal, ...days.map((d) => d.total), 1) * 1.1;
  const goalY = CHART_HEIGHT * (1 - goal / maxValue);

  return (
    <View>
      <View style={{ height: CHART_HEIGHT }} className="flex-row items-end justify-between gap-2">
        {/* Goal reference line */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: goalY,
            height: 2,
            backgroundColor: colors.warning,
            opacity: 0.9,
          }}
        />
        {days.map((d, i) => {
          const heightPx = Math.max((d.total / maxValue) * CHART_HEIGHT, d.total > 0 ? 6 : 0);
          const reached = d.total >= goal && goal > 0;
          return (
            <View key={i} className="flex-1 h-full justify-end">
              <AnimatedBar heightPx={heightPx} color={reached ? colors.accent : colors.accent + '66'} />
            </View>
          );
        })}
      </View>
      <View className="flex-row justify-between mt-2">
        {days.map((d, i) => (
          <Text key={i} className="text-[11px] text-muted flex-1 text-center">
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
