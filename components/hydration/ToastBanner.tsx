import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useColors } from '@/hooks/use-colors';
import { elevatedCardStyle } from './card-styles';

export type ToastVariant = 'default' | 'success';

export interface ToastState {
  message: string;
  variant?: ToastVariant;
}

interface ToastBannerProps {
  toast: ToastState | null;
  onDismiss: () => void;
  durationMs?: number;
}

export function ToastBanner({ toast, onDismiss, durationMs = 2200 }: ToastBannerProps) {
  const colors = useColors();

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(id);
  }, [toast, durationMs, onDismiss]);

  if (!toast) return null;

  const isSuccess = toast.variant === 'success';
  const bg = isSuccess ? colors.success : colors.surfaceElevated;
  const textColor = isSuccess ? '#FFFFFF' : colors.foreground;

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(16)}
      exiting={FadeOutUp.duration(200)}
      className="absolute left-4 right-4 z-50"
      style={{ top: 8 }}
      pointerEvents="none"
    >
      <View
        className="rounded-2xl px-4 py-3 items-center"
        style={[{ backgroundColor: bg }, !isSuccess ? elevatedCardStyle() : undefined]}
      >
        <Text style={{ color: textColor, fontWeight: '600', fontSize: 14 }}>{toast.message}</Text>
      </View>
    </Animated.View>
  );
}
