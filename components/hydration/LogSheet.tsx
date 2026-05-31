import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { QuickAddContainerSheet } from './QuickAddContainerSheet';
import type { Container } from '@/lib/types';
import { type UnitPreference } from '@/lib/format-hydration';
import { useColors } from '@/hooks/use-colors';
import { MCIcon, MIcon } from '@/components/ui/MIcon';
import { resolveVesselIcon } from '@/lib/vessel-icons';
import { elevatedCardStyle } from './card-styles';
import { createId } from '@/lib/id';

interface DefaultPreset {
  id: string;
  iconKey: string;
  label: string;
  amount: number;
}

const DEFAULT_PRESETS: DefaultPreset[] = [
  { id: 'default:150', iconKey: 'mug', label: 'Small cup', amount: 150 },
  { id: 'default:300', iconKey: 'cup', label: 'Cup', amount: 300 },
  { id: 'default:500', iconKey: 'glass', label: 'Glass', amount: 500 },
  { id: 'default:800', iconKey: 'bottle', label: 'Bottle', amount: 800 },
  { id: 'default:1000', iconKey: 'tonic', label: 'Large bottle', amount: 1000 },
];

interface LogSheetProps {
  visible: boolean;
  onClose: () => void;
  containers: Container[];
  unit: UnitPreference;
  onConfirm: (containerId: string, amountMl: number) => void;
  onCreateAndLog: (container: Container, amountMl: number) => void;
}

interface VesselCardData {
  id: string;
  iconKey: string;
  label: string;
  amount: number;
}

export function LogSheet({
  visible,
  onClose,
  containers,
  onConfirm,
  onCreateAndLog,
}: LogSheetProps) {
  const colors = useColors();
  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const [selectedId, setSelectedId] = useState(DEFAULT_PRESETS[2].id);
  const [amountText, setAmountText] = useState('500');

  // Show saved containers, or default presets when the user has none yet.
  const cards: VesselCardData[] = useMemo(
    () =>
      containers.length > 0
        ? containers.map((c) => ({
            id: c.id,
            iconKey: c.emoji,
            label: c.name,
            amount: c.capacity_ml,
          }))
        : DEFAULT_PRESETS.map((p) => ({
            id: p.id,
            iconKey: p.iconKey,
            label: p.label,
            amount: p.amount,
          })),
    [containers],
  );

  useEffect(() => {
    if (!visible) return;
    const initial = cards.find((card) => card.amount === 500) ?? cards[0];
    setSelectedId(initial.id);
    setAmountText(String(initial.amount));
  }, [visible, cards]);

  const handleSelect = (card: VesselCardData) => {
    setSelectedId(card.id);
    setAmountText(String(card.amount));
  };

  const appendDigit = (digit: string) => {
    setAmountText((current) => {
      const next = current === '0' ? digit : `${current}${digit}`;
      return next.slice(0, 4);
    });
  };

  const backspace = () => {
    setAmountText((current) => (current.length <= 1 ? '0' : current.slice(0, -1)));
  };

  const confirm = () => {
    const amount = Math.max(1, parseInt(amountText || '0', 10));
    if (selectedId.startsWith('default:')) {
      const preset = cards.find((card) => card.id === selectedId) ?? cards[0];
      onCreateAndLog(
        {
          id: createId('container'),
          name: preset.label,
          capacity_ml: amount,
          emoji: preset.iconKey,
          created_at: Date.now(),
        },
        amount,
      );
    } else {
      onConfirm(selectedId, amount);
    }
    onClose();
  };

  const handleCreateAndLog = (container: Container, amountMl: number) => {
    onCreateAndLog(container, amountMl);
    onClose();
  };

  return (
    <>
      <BottomSheet visible={visible} onClose={onClose} title="Add Water">
        <View className="items-center mb-5">
          <Text className="text-5xl font-extrabold text-foreground">
            {amountText}
            <Text className="text-3xl font-bold"> ml</Text>
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 4 }}>
            {cards.map((card) => (
              <Pressable
                key={card.id}
                onPress={() => handleSelect(card)}
                className="rounded-full items-center justify-center bg-surface"
                style={({ pressed }) => [
                  elevatedCardStyle(),
                  {
                    width: 52,
                    height: 52,
                    borderWidth: 1,
                    borderColor: selectedId === card.id ? colors.primary : colors.border,
                    opacity: pressed ? 0.7 : 1,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  },
                ]}
              >
                <MCIcon name={resolveVesselIcon(card.iconKey)} size={24} color={colors.foreground} />
              </Pressable>
            ))}

            <Pressable
              onPress={() => setQuickAddVisible(true)}
              className="rounded-full items-center justify-center"
              style={({ pressed }) => ({
                width: 52,
                height: 52,
                borderWidth: 1.5,
                borderColor: colors.border,
                borderStyle: 'dashed',
                backgroundColor: colors.surface,
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              <MIcon name="add" size={24} color={colors.foreground} />
            </Pressable>
        </ScrollView>

        <View className="mt-3 mb-5 flex-row justify-between px-1">
          {cards.slice(0, 5).map((card) => (
            <Text key={card.id} className="text-xs text-foreground text-center" style={{ width: 52 }}>
              {card.amount >= 1000 ? '1L' : `${card.amount}ml`}
            </Text>
          ))}
          <Text className="text-xs text-muted text-center" style={{ width: 52 }}>
            New
          </Text>
        </View>

        <View style={{ gap: 10 }}>
          {[
            ['7', '8', '9'],
            ['4', '5', '6'],
            ['1', '2', '3'],
          ].map((row) => (
            <View key={row.join('')} className="flex-row" style={{ gap: 10 }}>
              {row.map((digit) => (
                <KeyButton key={digit} label={digit} onPress={() => appendDigit(digit)} />
              ))}
            </View>
          ))}
          <View className="flex-row" style={{ gap: 10 }}>
            <KeyButton label="backspace" icon="backspace" onPress={backspace} muted />
            <KeyButton label="0" onPress={() => appendDigit('0')} />
            <KeyButton label="check" icon="check" onPress={confirm} dark />
          </View>
        </View>
      </BottomSheet>

      <QuickAddContainerSheet
        visible={quickAddVisible}
        onClose={() => setQuickAddVisible(false)}
        onSaveAndAdd={handleCreateAndLog}
      />
    </>
  );
}

function KeyButton({
  label,
  icon,
  onPress,
  dark,
  muted,
}: {
  label: string;
  icon?: 'backspace' | 'check';
  onPress: () => void;
  dark?: boolean;
  muted?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 h-14 rounded-xl items-center justify-center"
      style={({ pressed }) => ({
        backgroundColor: dark ? colors.primary : muted ? colors.ringTrack : colors.surface,
        opacity: pressed ? 0.72 : 1,
      })}
    >
      {icon ? (
        <MIcon name={icon} size={22} color={dark ? colors.background : colors.foreground} />
      ) : (
        <Text className="text-xl font-semibold" style={{ color: colors.foreground }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
