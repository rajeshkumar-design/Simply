import { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { useColors } from '@/hooks/use-colors';
import { MCIcon } from '@/components/ui/MIcon';
import { VESSEL_ICONS } from '@/lib/vessel-icons';
import type { Container } from '@/lib/types';
import { createId } from '@/lib/id';

interface QuickAddContainerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSaveAndAdd: (container: Container, amountMl: number) => void;
}

export function QuickAddContainerSheet({ visible, onClose, onSaveAndAdd }: QuickAddContainerSheetProps) {
  const colors = useColors();
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(250);
  const [iconKey, setIconKey] = useState(VESSEL_ICONS[0].key);

  useEffect(() => {
    if (visible) {
      setName('');
      setCapacity(250);
      setIconKey(VESSEL_ICONS[0].key);
    }
  }, [visible]);

  const adjust = (delta: number) => setCapacity((c) => Math.max(50, Math.min(2000, c + delta)));

  const handleSave = () => {
    const container: Container = {
      id: createId('container'),
      name: name.trim() || VESSEL_ICONS.find((v) => v.key === iconKey)!.label,
      capacity_ml: capacity,
      emoji: iconKey,
      created_at: Date.now(),
    };
    onSaveAndAdd(container, capacity);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="New container">
      <Text className="text-sm text-muted mb-2">Icon</Text>
      <View className="flex-row flex-wrap gap-2 mb-5">
        {VESSEL_ICONS.map((vessel) => {
          const active = vessel.key === iconKey;
          return (
            <Pressable
              key={vessel.key}
              onPress={() => setIconKey(vessel.key)}
              className="w-14 h-14 rounded-2xl items-center justify-center"
              style={{
                backgroundColor: active ? colors.accent : colors.surface,
                borderWidth: 1.5,
                borderColor: active ? colors.accent : colors.border,
              }}
            >
              <MCIcon name={vessel.icon} size={26} color={active ? '#FFFFFF' : colors.foreground} />
            </Pressable>
          );
        })}
      </View>

      <Text className="text-sm text-muted mb-2">Name</Text>
      <TextInput
        placeholder="e.g. Steel bottle"
        placeholderTextColor={colors.muted}
        value={name}
        onChangeText={setName}
        className="rounded-xl px-4 py-3 mb-5 text-foreground bg-surface"
        style={{ color: colors.foreground, borderWidth: 1, borderColor: colors.border }}
      />

      <Text className="text-sm text-muted mb-2">Capacity</Text>
      <View className="flex-row items-center justify-center gap-5 mb-6">
        <Pressable
          onPress={() => adjust(-50)}
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <MCIcon name="minus" size={22} color={colors.foreground} />
        </Pressable>
        <Text className="text-2xl font-bold text-foreground" style={{ minWidth: 110, textAlign: 'center' }}>
          {capacity} ml
        </Text>
        <Pressable
          onPress={() => adjust(50)}
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <MCIcon name="plus" size={22} color={colors.foreground} />
        </Pressable>
      </View>

      <Pressable
        onPress={handleSave}
        className="py-4 rounded-2xl items-center"
        style={({ pressed }) => ({ backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 })}
      >
        <Text className="text-base font-bold" style={{ color: colors.background }}>
          Save & Add {capacity} ml
        </Text>
      </Pressable>
    </BottomSheet>
  );
}
