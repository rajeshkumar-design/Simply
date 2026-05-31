import { useCallback, useState } from 'react';
import * as Haptics from 'expo-haptics';
import type { ToastState } from '@/components/hydration/ToastBanner';

const LOG_MESSAGES = ['Sip logged', 'Tiny win', 'Hydration boost', 'Nice sip'];
const GOAL_MESSAGE = 'Goal completed!';

export function useLogFeedback() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const dismissToast = useCallback(() => setToast(null), []);

  const showToast = useCallback((message: string, variant: ToastState['variant'] = 'default') => {
    setToast({ message, variant });
  }, []);

  const onLogSuccess = useCallback(
    async (prevTotalMl: number, addedMl: number, dailyGoalMl: number) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newTotal = prevTotalMl + addedMl;
      const wasBelowGoal = prevTotalMl < dailyGoalMl;
      const nowAtOrAboveGoal = newTotal >= dailyGoalMl;

      if (wasBelowGoal && nowAtOrAboveGoal) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast(GOAL_MESSAGE, 'success');
      } else {
        const msg = LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)];
        showToast(msg, 'default');
      }
    },
    [showToast],
  );

  const onUndo = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showToast('Entry removed');
  }, [showToast]);

  const onDelete = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showToast('Entry deleted');
  }, [showToast]);

  return {
    toast,
    dismissToast,
    showToast,
    onLogSuccess,
    onUndo,
    onDelete,
  };
}
