import { ScrollView, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useHydration } from '@/lib/hydration-context';
import { MIcon, MCIcon } from '@/components/ui/MIcon';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';
import type { Container } from '@/lib/types';
import { ContainerFormSheet, ToastBanner } from '@/components/hydration';
import type { ContainerFormData } from '@/components/hydration/ContainerFormSheet';
import { useLogFeedback } from '@/hooks/use-log-feedback';
import { elevatedCardStyle as cardStyle } from '@/components/hydration/card-styles';
import { resolveVesselIcon, VESSEL_ICONS } from '@/lib/vessel-icons';
import { createId } from '@/lib/id';

const DEFAULT_ICON_KEY = VESSEL_ICONS[0].key;

export default function ContainersScreen() {
  const router = useRouter();
  const colors = useColors();
  const { state, addContainer, updateContainer, deleteContainer } = useHydration();
  const { containers, isLoading } = state;
  const { toast, dismissToast, showToast } = useLogFeedback();

  const [showSheet, setShowSheet] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ContainerFormData>({
    name: '',
    capacity: '',
    emoji: DEFAULT_ICON_KEY,
  });

  const handleAddPress = () => {
    setEditingId(null);
    setFormData({ name: '', capacity: '250', emoji: DEFAULT_ICON_KEY });
    setShowSheet(true);
  };

  const handleEditPress = (container: Container) => {
    setEditingId(container.id);
    setFormData({
      name: container.name,
      capacity: container.capacity_ml.toString(),
      emoji: container.emoji,
    });
    setShowSheet(true);
  };

  const handleDeletePress = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await deleteContainer(id);
    showToast('Container removed');
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.capacity.trim()) return;

    const capacity = parseInt(formData.capacity, 10);
    if (isNaN(capacity) || capacity <= 0) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (editingId) {
      await updateContainer(editingId, {
        name: formData.name,
        capacity_ml: capacity,
        emoji: formData.emoji,
      });
      showToast('Container updated');
    } else {
      const newContainer: Container = {
        id: createId('container'),
        name: formData.name,
        capacity_ml: capacity,
        emoji: formData.emoji,
        created_at: Date.now(),
      };
      await addContainer(newContainer);
      showToast('Container created');
    }

    setShowSheet(false);
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.accent} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="px-4">
      <ToastBanner toast={toast} onDismiss={dismissToast} />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View className="gap-5">
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            className="w-10 h-10 rounded-full items-center justify-center -ml-2 mt-1"
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <MIcon name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>

          <View className="flex-row items-center justify-between px-1">
            <View className="gap-0.5">
              <Text className="text-3xl font-extrabold text-foreground">Containers</Text>
              <Text className="text-sm text-muted">{containers.length} saved</Text>
            </View>
            <Pressable
              onPress={handleAddPress}
              style={({ pressed }) => ({
                backgroundColor: colors.primary,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.94 : 1 }],
              })}
              className="w-11 h-11 rounded-full items-center justify-center"
            >
              <MIcon name="add" size={22} color={colors.background} />
            </Pressable>
          </View>

          {containers.length > 0 ? (
            <View className="flex-row flex-wrap gap-3">
              {containers.map((item) => (
                <View
                  key={item.id}
                  className="rounded-2xl p-4 bg-surfaceElevated"
                  style={[{ width: '47%' }, cardStyle()]}
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: colors.ringTrack }}
                  >
                    <MCIcon name={resolveVesselIcon(item.emoji)} size={26} color={colors.accent} />
                  </View>
                  <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="text-sm text-muted mt-0.5">{item.capacity_ml} ml</Text>
                  <View className="flex-row gap-3 mt-3">
                    <Pressable onPress={() => handleEditPress(item)} hitSlop={8}>
                      <MIcon name="edit" size={18} color={colors.accent} />
                    </Pressable>
                    <Pressable onPress={() => handleDeletePress(item.id)} hitSlop={8}>
                      <MIcon name="delete-outline" size={18} color={colors.muted} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="rounded-2xl p-8 items-center gap-3 mt-4 bg-surfaceElevated" style={cardStyle()}>
              <Text className="text-lg font-semibold text-foreground">No containers yet</Text>
              <Text className="text-sm text-muted text-center">
                Create bottles and cups for one-tap logging
              </Text>
              <Pressable
                onPress={handleAddPress}
                className="px-6 py-3 rounded-full mt-2"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="font-semibold" style={{ color: colors.background }}>
                  Create container
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      <ContainerFormSheet
        visible={showSheet}
        editing={!!editingId}
        formData={formData}
        onChange={setFormData}
        onClose={() => setShowSheet(false)}
        onSave={handleSave}
      />
    </ScreenContainer>
  );
}
