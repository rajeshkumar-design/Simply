import { ScrollView, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import type { Container } from '@/lib/types';
import { formatAmountCompact, type UnitPreference } from '@/lib/format-hydration';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { elevatedCardStyle } from './card-styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ContainerQuickAddProps {
  containers: Container[];
  unit: UnitPreference;
  onSelect: (container: Container) => void;
  onCustomPress: () => void;
}

function QuickAddChip({
  emoji,
  label,
  sublabel,
  onPress,
}: {
  emoji: string;
  label: string;
  sublabel: string;
  onPress: () => void;
}) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      }}
      style={[
        animatedStyle,
        elevatedCardStyle(),
        {
          backgroundColor: colors.surfaceElevated,
          minWidth: 88,
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderRadius: 16,
          alignItems: 'center',
          gap: 4,
        },
      ]}
    >
      <Text style={{ fontSize: 28 }}>{emoji}</Text>
      <Text className="text-xs font-semibold text-foreground" numberOfLines={1}>
        {label}
      </Text>
      <Text className="text-xs text-muted">+{sublabel}</Text>
    </AnimatedPressable>
  );
}

export function ContainerQuickAdd({
  containers,
  unit,
  onSelect,
  onCustomPress,
}: ContainerQuickAddProps) {
  const colors = useColors();

  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-muted px-1">Quick add</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingHorizontal: 4, paddingVertical: 4 }}
      >
        {containers.map((container) => (
          <QuickAddChip
            key={container.id}
            emoji={container.emoji}
            label={container.name}
            sublabel={formatAmountCompact(container.capacity_ml, unit)}
            onPress={() => onSelect(container)}
          />
        ))}
        <Pressable
          onPress={onCustomPress}
          style={({ pressed }) => [
            elevatedCardStyle(),
            {
              minWidth: 72,
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.primary + '18',
              borderWidth: 1.5,
              borderColor: colors.primary + '40',
              borderStyle: 'dashed',
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
          ]}
        >
          <IconSymbol name="plus" size={24} color={colors.primary} />
          <Text className="text-xs font-medium mt-1" style={{ color: colors.primary }}>
            Custom
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
