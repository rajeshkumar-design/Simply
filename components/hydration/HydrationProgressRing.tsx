import { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/use-colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 180;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = SIZE / 2;

interface HydrationProgressRingProps {
  progress: number;
  centerLabel?: string;
  centerSubLabel?: string;
}

export function HydrationProgressRing({
  progress,
  centerLabel,
  centerSubLabel,
}: HydrationProgressRingProps) {
  const colors = useColors();
  const animatedProgress = useSharedValue(progress);

  useEffect(() => {
    animatedProgress.value = withSpring(Math.min(1, Math.max(0, progress)), {
      damping: 18,
      stiffness: 120,
    });
  }, [progress, animatedProgress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - animatedProgress.value),
  }));

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke={colors.ringTrack}
          strokeWidth={STROKE}
          fill="none"
        />
        <G rotation="-90" origin={`${CENTER}, ${CENTER}`}>
          <AnimatedCircle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke={colors.primary}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={animatedProps}
          />
        </G>
      </Svg>
      <View className="items-center gap-0.5 px-4">
        {centerLabel ? (
          <Text className="text-3xl font-bold text-foreground text-center">{centerLabel}</Text>
        ) : null}
        {centerSubLabel ? (
          <Text className="text-xs text-muted text-center">{centerSubLabel}</Text>
        ) : null}
      </View>
    </View>
  );
}
