import { View, Text, Pressable, TextInput } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { useColors } from '@/hooks/use-colors';
import { MCIcon } from '@/components/ui/MIcon';
import { VESSEL_ICONS } from '@/lib/vessel-icons';

export interface ContainerFormData {
  name: string;
  capacity: string;
  emoji: string;
}

interface ContainerFormSheetProps {
  visible: boolean;
  editing: boolean;
  formData: ContainerFormData;
  onChange: (data: ContainerFormData) => void;
  onClose: () => void;
  onSave: () => void;
}

export function ContainerFormSheet({
  visible,
  editing,
  formData,
  onChange,
  onClose,
  onSave,
}: ContainerFormSheetProps) {
  const colors = useColors();
  const canSave = formData.name.trim().length > 0 && formData.capacity.trim().length > 0;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={editing ? 'Edit container' : 'New container'}>
      <Text className="text-sm text-muted mb-2">Icon</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {VESSEL_ICONS.map((vessel) => {
          const active = formData.emoji === vessel.key;
          return (
            <Pressable
              key={vessel.key}
              onPress={() => onChange({ ...formData, emoji: vessel.key })}
              className="w-12 h-12 rounded-xl items-center justify-center"
              style={{
                backgroundColor: active ? colors.accent : colors.ringTrack,
              }}
            >
              <MCIcon name={vessel.icon} size={24} color={active ? '#FFFFFF' : colors.foreground} />
            </Pressable>
          );
        })}
      </View>

      <Text className="text-sm text-muted mb-2">Name</Text>
      <TextInput
        placeholder="e.g. Steel bottle"
        placeholderTextColor={colors.muted}
        value={formData.name}
        onChangeText={(name) => onChange({ ...formData, name })}
        className="rounded-xl px-4 py-3 mb-4 text-foreground bg-surface"
        style={{ color: colors.foreground, borderWidth: 1, borderColor: colors.border }}
      />

      <Text className="text-sm text-muted mb-2">Capacity (ml)</Text>
      <View className="flex-row items-center gap-3 mb-4">
        <Pressable
          onPress={() => {
            const n = Math.max(50, parseInt(formData.capacity || '250', 10) - 50);
            onChange({ ...formData, capacity: String(n) });
          }}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.ringTrack }}
        >
          <Text className="text-lg text-foreground">−</Text>
        </Pressable>
        <TextInput
          placeholder="250"
          placeholderTextColor={colors.muted}
          value={formData.capacity}
          onChangeText={(capacity) => onChange({ ...formData, capacity })}
          keyboardType="number-pad"
          className="flex-1 rounded-xl px-4 py-3 text-center text-foreground bg-surface"
          style={{ color: colors.foreground, borderWidth: 1, borderColor: colors.border }}
        />
        <Pressable
          onPress={() => {
            const n = Math.min(2000, parseInt(formData.capacity || '250', 10) + 50);
            onChange({ ...formData, capacity: String(n) });
          }}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.ringTrack }}
        >
          <Text className="text-lg text-foreground">+</Text>
        </Pressable>
      </View>

      <View className="flex-row gap-3">
        <Pressable
          onPress={onClose}
          className="flex-1 py-3 rounded-2xl items-center"
          style={{ backgroundColor: colors.ringTrack }}
        >
          <Text className="font-semibold text-foreground">Cancel</Text>
        </Pressable>
        <Pressable
          onPress={onSave}
          disabled={!canSave}
          className="flex-1 py-3 rounded-2xl items-center"
          style={{ backgroundColor: colors.primary, opacity: canSave ? 1 : 0.5 }}
        >
          <Text className="font-semibold text-white">{editing ? 'Update' : 'Create'}</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
