import { useEffect } from 'react';
import { Pressable, Text, View, LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/use-colors';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const colors = useColors();
  const segmentWidth = useSharedValue(0);
  const translateX = useSharedValue(0);
  const selectedIndex = options.findIndex((o) => o.value === value);

  useEffect(() => {
    if (segmentWidth.value > 0) {
      translateX.value = withSpring(selectedIndex * segmentWidth.value, {
        damping: 20,
        stiffness: 200,
      });
    }
  }, [selectedIndex, segmentWidth, translateX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: segmentWidth.value,
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width / options.length;
    segmentWidth.value = w;
    translateX.value = selectedIndex * w;
  };

  return (
    <View
      className="flex-row rounded-xl p-1 bg-surface"
      style={{ backgroundColor: colors.ringTrack }}
      onLayout={onLayout}
    >
      <Animated.View
        className="absolute top-1 bottom-1 left-1 rounded-lg"
        style={[{ backgroundColor: colors.surfaceElevated }, indicatorStyle, elevatedShadow()]}
      />
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className="flex-1 py-2.5 items-center justify-center z-10"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Text
              className="text-sm font-semibold capitalize"
              style={{ color: selected ? colors.foreground : colors.muted }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function elevatedShadow() {
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  };
}
