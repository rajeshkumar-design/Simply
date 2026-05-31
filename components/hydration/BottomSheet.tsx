import { useEffect, useState } from 'react';
import { Modal, Pressable, View, Text, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/use-colors';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);
  const translateY = useSharedValue(height);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.value = height;
      backdropOpacity.value = 0;
      requestAnimationFrame(() => {
        translateY.value = withTiming(0, { duration: 320 });
        backdropOpacity.value = withTiming(1, { duration: 220 });
      });
      return;
    }

    translateY.value = withTiming(height, { duration: 260 }, (finished) => {
      if (finished) runOnJS(setMounted)(false);
    });
    backdropOpacity.value = withTiming(0, { duration: 200 });
  }, [visible, height, translateY, backdropOpacity]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!mounted) return null;

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end"
      >
        <Pressable className="flex-1" onPress={onClose}>
          <Animated.View
            className="flex-1"
            style={[{ backgroundColor: 'rgba(0,0,0,0.28)' }, backdropStyle]}
          />
        </Pressable>
        <Animated.View
          className="rounded-t-3xl px-5 pt-3 bg-background"
          style={[{ paddingBottom: Math.max(insets.bottom, 16) }, sheetStyle]}
        >
          <View className="w-10 h-1 rounded-full self-center mb-4" style={{ backgroundColor: colors.border }} />
          <View className="flex-row items-center justify-between mb-4">
            <Pressable onPress={onClose} hitSlop={12} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
              <Text className="text-sm font-semibold text-foreground">Cancel</Text>
            </Pressable>
            <Text className="text-base font-bold text-foreground">{title}</Text>
            <View style={{ width: 48 }} />
          </View>
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
