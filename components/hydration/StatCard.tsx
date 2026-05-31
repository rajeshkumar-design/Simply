import { View, Text } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { elevatedCardStyle } from './card-styles';
import type { IconSymbolName } from '@/components/ui/icon-symbol';

interface StatCardProps {
  label: string;
  value: string;
  icon: IconSymbolName;
  iconColor?: string;
}

export function StatCard({ label, value, icon, iconColor }: StatCardProps) {
  const colors = useColors();

  return (
    <View
      className="rounded-2xl p-4 flex-row justify-between items-center bg-surface"
      style={elevatedCardStyle()}
    >
      <View>
        <Text className="text-xs text-muted">{label}</Text>
        <Text className="text-lg font-bold text-foreground mt-1">{value}</Text>
      </View>
      <IconSymbol name={icon} size={24} color={iconColor ?? colors.primary} />
    </View>
  );
}
