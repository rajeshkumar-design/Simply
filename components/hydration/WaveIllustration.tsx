import { useEffect } from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/use-colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/**
 * Builds a closed, filled sinusoidal wave path from the crest down to the
 * bottom of the canvas. Runs as a worklet so it can be invoked from the
 * useAnimatedProps callbacks on the UI thread.
 */
function buildWavePath(
  width: number,
  height: number,
  topY: number,
  phase: number,
  amplitude: number,
  wavelength: number,
): string {
  'worklet';
  const steps = 24;
  let d = `M 0 ${topY + Math.sin(phase) * amplitude}`;
  for (let i = 1; i <= steps; i++) {
    const x = (width / steps) * i;
    const y = topY + Math.sin(x / wavelength + phase) * amplitude;
    d += ` L ${x} ${y}`;
  }
  d += ` L ${width} ${height} L 0 ${height} Z`;
  return d;
}

interface WaveIllustrationProps {
  /** Hydration progress from 0 to 1. */
  progress: number;
  width: number;
  height: number;
}

export function WaveIllustration({ progress, width, height }: WaveIllustrationProps) {
  const colors = useColors();
  const phase = useSharedValue(0);
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    phase.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 3200, easing: Easing.linear }),
      -1,
      false,
    );
  }, [phase]);

  useEffect(() => {
    animatedProgress.value = withSpring(Math.min(1, Math.max(0, progress)), {
      damping: 14,
      stiffness: 80,
    });
  }, [progress, animatedProgress]);

  // Maps progress to the vertical crest position: low progress keeps water near
  // the bottom, full progress raises it toward the top.
  const waterTop = (p: number) => {
    'worklet';
    return height * (0.82 - p * 0.32);
  };

  const backProps = useAnimatedProps(() => ({
    d: buildWavePath(width, height, waterTop(animatedProgress.value) - 12, phase.value, 11, width / 1.5),
  }));

  const frontProps = useAnimatedProps(() => ({
    d: buildWavePath(
      width,
      height,
      waterTop(animatedProgress.value),
      phase.value + Math.PI,
      15,
      width / 2,
    ),
  }));

  return (
    <Svg width={width} height={height} style={{ position: 'absolute', bottom: 0, left: 0 }}>
      <AnimatedPath animatedProps={backProps} fill={colors.oceanShallow} opacity={0.55} />
      <AnimatedPath animatedProps={frontProps} fill={colors.oceanDeep} />
      {/* Decorative bubbles rising in the deep water */}
      <Circle cx={width * 0.2} cy={height * 0.82} r={5} fill="#FFFFFF" opacity={0.16} />
      <Circle cx={width * 0.28} cy={height * 0.9} r={3} fill="#FFFFFF" opacity={0.14} />
      <Circle cx={width * 0.72} cy={height * 0.86} r={6} fill="#FFFFFF" opacity={0.14} />
      <Circle cx={width * 0.8} cy={height * 0.93} r={3.5} fill="#FFFFFF" opacity={0.12} />
    </Svg>
  );
}
