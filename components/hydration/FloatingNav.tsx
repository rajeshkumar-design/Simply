import { View, Text, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { MIcon } from '@/components/ui/MIcon';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FloatingNavProps {
  onSettings: () => void;
  onAddWater: () => void;
  onHistory: () => void;
}

function RoundButton({ icon, onPress }: { icon: 'settings' | 'calendar-today'; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.88, { damping: 15, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      }}
      style={[
        animatedStyle,
        {
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#12213F',
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
    >
      <MIcon name={icon} size={24} color="#FFFFFF" />
    </AnimatedPressable>
  );
}

export function FloatingNav({ onSettings, onAddWater, onHistory }: FloatingNavProps) {
  const pillScale = useSharedValue(1);
  const pillStyle = useAnimatedStyle(() => ({ transform: [{ scale: pillScale.value }] }));

  return (
    <View className="flex-row items-center justify-between px-5" style={{ gap: 12 }}>
      <RoundButton icon="settings" onPress={onSettings} />

      <AnimatedPressable
        onPress={onAddWater}
        onPressIn={() => {
          pillScale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
        }}
        onPressOut={() => {
          pillScale.value = withSpring(1, { damping: 15, stiffness: 400 });
        }}
        style={[
          pillStyle,
          {
            flex: 1,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#12213F',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          },
        ]}
      >
        <MIcon name="add" size={22} color="#FFFFFF" />
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Add Water</Text>
      </AnimatedPressable>

      <RoundButton icon="calendar-today" onPress={onHistory} />
    </View>
  );
}
