import { View, Text, Pressable } from 'react-native';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View className="gap-2">
      <Text className="text-xs font-semibold text-muted uppercase tracking-wide px-1">{title}</Text>
      <View className="rounded-2xl overflow-hidden bg-surface">
        {children}
      </View>
    </View>
  );
}

interface SettingsRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  isLast?: boolean;
}

export function SettingsRow({ label, value, onPress, rightElement, isLast }: SettingsRowProps) {
  const content = (
    <View
      className={`flex-row items-center justify-between px-4 py-3.5 ${!isLast ? 'border-b border-border' : ''}`}
    >
      <Text className="text-base text-foreground">{label}</Text>
      {rightElement ?? (value ? <Text className="text-sm text-muted">{value}</Text> : null)}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
        {content}
      </Pressable>
    );
  }

  return content;
}
