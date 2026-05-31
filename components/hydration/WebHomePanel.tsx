import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { MIcon, MCIcon } from '@/components/ui/MIcon';
import { useColors } from '@/hooks/use-colors';
import { createId } from '@/lib/id';
import { resolveVesselIcon } from '@/lib/vessel-icons';
import type { Container, LogEntry } from '@/lib/types';
import type { UnitPreference } from '@/lib/format-hydration';
import { LogTimeline } from './LogTimeline';

const DEFAULT_PRESETS = [
  { id: 'default:150', iconKey: 'mug', label: 'Small cup', amount: 150 },
  { id: 'default:300', iconKey: 'cup', label: 'Cup', amount: 300 },
  { id: 'default:500', iconKey: 'glass', label: 'Glass', amount: 500 },
  { id: 'default:800', iconKey: 'bottle', label: 'Bottle', amount: 800 },
  { id: 'default:1000', iconKey: 'tonic', label: 'Large bottle', amount: 1000 },
];

interface WebHomePanelProps {
  containers: Container[];
  entries: LogEntry[];
  unit: UnitPreference;
  onConfirm: (containerId: string, amountMl: number) => Promise<void>;
  onCreateAndLog: (container: Container, amountMl: number) => Promise<void>;
  onDeleteLog: (id: string) => Promise<void>;
  onSettings: () => void;
  onHistory: () => void;
}

export function WebHomePanel({
  containers,
  entries,
  unit,
  onConfirm,
  onCreateAndLog,
  onDeleteLog,
  onSettings,
  onHistory,
}: WebHomePanelProps) {
  const colors = useColors();
  const cards = useMemo(
    () =>
      containers.length > 0
        ? containers.map((container) => ({
            id: container.id,
            iconKey: container.emoji,
            label: container.name,
            amount: container.capacity_ml,
          }))
        : DEFAULT_PRESETS,
    [containers],
  );
  const [selectedId, setSelectedId] = useState(cards[2]?.id ?? cards[0].id);
  const selected = cards.find((card) => card.id === selectedId) ?? cards[0];
  const [amountText, setAmountText] = useState(String(selected.amount));

  useEffect(() => {
    const nextSelected = cards.find((card) => card.id === selectedId) ?? cards[0];
    setSelectedId(nextSelected.id);
    setAmountText(String(nextSelected.amount));
  }, [cards, selectedId]);

  const step = selected?.amount || 50;
  const amount = Math.max(0, parseInt(amountText || '0', 10) || 0);

  const changeAmount = (delta: number) => {
    setAmountText(String(Math.max(0, amount + delta)));
  };

  const handleSubmit = async () => {
    const safeAmount = Math.max(1, amount);
    if (selected.id.startsWith('default:')) {
      const container: Container = {
        id: createId('container'),
        name: selected.label,
        capacity_ml: safeAmount,
        emoji: selected.iconKey,
        created_at: Date.now(),
      };
      await onCreateAndLog(container, safeAmount);
      return;
    }

    await onConfirm(selected.id, safeAmount);
  };

  return (
    <View className="flex-1 bg-background px-8 py-8 border-l border-border">
      <View className="flex-row items-center justify-between mb-8">
        <View>
          <Text className="text-3xl font-extrabold text-foreground">Add Water</Text>
          <Text className="text-sm text-muted mt-1">Quick log from your desk</Text>
        </View>
        <View className="flex-row gap-2">
          <IconButton icon="settings" onPress={onSettings} />
          <IconButton icon="calendar-today" onPress={onHistory} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="gap-6">
          <View className="flex-row flex-wrap gap-3">
            {cards.map((card) => {
              const active = card.id === selectedId;
              return (
                <Pressable
                  key={card.id}
                  onPress={() => {
                    setSelectedId(card.id);
                    setAmountText(String(card.amount));
                  }}
                  className="w-16 h-16 rounded-2xl items-center justify-center"
                  style={({ pressed }) => ({
                    backgroundColor: active ? colors.sky : colors.ringTrack,
                    borderWidth: 1.5,
                    borderColor: active ? colors.primary : 'transparent',
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <MCIcon name={resolveVesselIcon(card.iconKey)} size={28} color={colors.foreground} />
                </Pressable>
              );
            })}
          </View>

          <View className="rounded-[28px] bg-surfaceElevated p-4 gap-3">
            <Text className="text-xs font-bold text-muted uppercase">Value</Text>
            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={() => changeAmount(-step)}
                className="w-12 h-12 rounded-2xl items-center justify-center bg-background"
              >
                <MIcon name="remove" size={22} color={colors.foreground} />
              </Pressable>
              <TextInput
                value={amountText}
                onChangeText={(text) => setAmountText(text.replace(/[^0-9]/g, '').slice(0, 5))}
                keyboardType="number-pad"
                className="flex-1 h-12 rounded-2xl px-4 text-center text-lg font-extrabold text-foreground bg-background"
                style={{ borderWidth: 1, borderColor: colors.border, color: colors.foreground }}
              />
              <Pressable
                onPress={() => changeAmount(step)}
                className="w-12 h-12 rounded-2xl items-center justify-center bg-background"
              >
                <MIcon name="add" size={22} color={colors.foreground} />
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={handleSubmit}
            className="h-14 rounded-2xl items-center justify-center"
            style={({ pressed }) => ({
              backgroundColor: colors.primary,
              opacity: pressed ? 0.82 : 1,
            })}
          >
            <Text className="text-base font-bold text-white">Add Water</Text>
          </Pressable>

          <LogTimeline entries={entries} containers={containers} unit={unit} onDelete={onDeleteLog} />
        </View>
      </ScrollView>
    </View>
  );
}

function IconButton({ icon, onPress }: { icon: 'settings' | 'calendar-today'; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      className="w-11 h-11 rounded-full items-center justify-center bg-surfaceElevated"
      style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
    >
      <MIcon name={icon} size={20} color={colors.foreground} />
    </Pressable>
  );
}
