import { View, Text, Pressable } from 'react-native';
import { HydrationProgressRing } from './HydrationProgressRing';
import { formatAmount, type UnitPreference } from '@/lib/format-hydration';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { elevatedCardStyle } from './card-styles';

interface HydrationHeroProps {
  totalToday: number;
  dailyGoal: number;
  remaining: number;
  progress: number;
  unit: UnitPreference;
  onUndo?: () => void;
  showUndo?: boolean;
}

export function HydrationHero({
  totalToday,
  dailyGoal,
  remaining,
  progress,
  unit,
  onUndo,
  showUndo,
}: HydrationHeroProps) {
  const colors = useColors();
  const goalReached = remaining <= 0 && totalToday > 0;

  const heroTitle = goalReached ? 'Goal complete' : formatAmount(remaining, unit);
  const heroSubtitle = goalReached ? 'Nice, you hydrated!' : 'remaining today';
  const ringLabel = goalReached ? '100%' : `${Math.round(progress * 100)}%`;

  return (
    <View
      className="rounded-3xl p-6 items-center gap-4 bg-surface"
      style={elevatedCardStyle()}
    >
      <HydrationProgressRing
        progress={progress}
        centerLabel={ringLabel}
        centerSubLabel="of goal"
      />
      <View className="items-center gap-1 w-full">
        <Text className="text-3xl font-bold text-foreground text-center">{heroTitle}</Text>
        <Text className="text-sm text-muted">{heroSubtitle}</Text>
        <Text className="text-sm text-muted mt-1">
          {formatAmount(totalToday, unit)} / {formatAmount(dailyGoal, unit)}
        </Text>
      </View>
      {showUndo && onUndo ? (
        <Pressable
          onPress={onUndo}
          className="flex-row items-center gap-1.5 py-2 px-3 rounded-full"
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <IconSymbol name="arrow.uturn.left" size={14} color={colors.muted} />
          <Text className="text-sm text-muted font-medium">Undo last sip</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
