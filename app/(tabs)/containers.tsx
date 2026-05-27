import { ScrollView, Text, View, Pressable, FlatList, TextInput, Modal, ActivityIndicator } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useHydration } from "@/lib/hydration-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { v4 as uuidv4 } from "uuid";
import { Container } from "@/lib/types";

const EMOJI_OPTIONS = ["🍾", "🥤", "🧃", "☕", "🍵", "🧋", "🥛", "🧉", "💧", "🌊"];

/**
 * Containers Screen - Manage custom drink containers
 * 
 * Allows users to:
 * - View all saved containers
 * - Add new containers
 * - Edit existing containers
 * - Delete containers
 */
export default function ContainersScreen() {
  const colors = useColors();
  const { state, addContainer, updateContainer, deleteContainer } = useHydration();
  const { containers, isLoading } = state;

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    emoji: "🥤",
  });

  const handleAddPress = () => {
    setEditingId(null);
    setFormData({ name: "", capacity: "", emoji: "🥤" });
    setShowModal(true);
  };

  const handleEditPress = (container: Container) => {
    setEditingId(container.id);
    setFormData({
      name: container.name,
      capacity: container.capacity_ml.toString(),
      emoji: container.emoji,
    });
    setShowModal(true);
  };

  const handleDeletePress = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await deleteContainer(id);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.capacity.trim()) {
      return;
    }

    const capacity = parseInt(formData.capacity, 10);
    if (isNaN(capacity) || capacity <= 0) {
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (editingId) {
      await updateContainer(editingId, {
        name: formData.name,
        capacity_ml: capacity,
        emoji: formData.emoji,
      });
    } else {
      const newContainer: Container = {
        id: uuidv4(),
        name: formData.name,
        capacity_ml: capacity,
        emoji: formData.emoji,
        created_at: Date.now(),
      };
      await addContainer(newContainer);
    }

    setShowModal(false);
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="gap-1">
              <Text className="text-2xl font-bold text-foreground">My Containers</Text>
              <Text className="text-sm text-muted">{containers.length} saved</Text>
            </View>
            <Pressable
              onPress={handleAddPress}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                },
              ]}
              className="w-12 h-12 rounded-full items-center justify-center"
            >
              <IconSymbol name="plus" size={24} color="white" />
            </Pressable>
          </View>

          {/* Containers List */}
          {containers.length > 0 ? (
            <FlatList
              data={containers}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View className="bg-surface rounded-2xl p-4 mb-3 border border-border flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3 flex-1">
                    <Text className="text-4xl">{item.emoji}</Text>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">
                        {item.name}
                      </Text>
                      <Text className="text-sm text-muted">
                        {item.capacity_ml} ml
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => handleEditPress(item)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
                    >
                      <IconSymbol name="square.and.pencil" size={20} color={colors.primary} />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeletePress(item.id)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
                    >
                      <IconSymbol name="trash" size={20} color={colors.error} />
                    </Pressable>
                  </View>
                </View>
              )}
            />
          ) : (
            <View className="bg-surface rounded-2xl p-6 items-center gap-3 mt-8">
              <Text className="text-lg font-semibold text-foreground">No containers yet</Text>
              <Text className="text-sm text-muted text-center">
                Create your first container to get started with tracking
              </Text>
              <Pressable
                onPress={handleAddPress}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                className="px-6 py-3 rounded-full mt-2"
              >
                <Text className="text-white font-semibold">Create Container</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 gap-4">
            {/* Header */}
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-foreground">
                {editingId ? "Edit Container" : "New Container"}
              </Text>
              <Pressable onPress={() => setShowModal(false)}>
                <Text className="text-lg text-muted">✕</Text>
              </Pressable>
            </View>

            {/* Emoji Selector */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-muted">Choose emoji</Text>
              <View className="flex-row flex-wrap gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <Pressable
                    key={emoji}
                    onPress={() => setFormData({ ...formData, emoji })}
                    style={({ pressed }) => [
                      {
                        backgroundColor: formData.emoji === emoji ? colors.primary : colors.surface,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                    className="w-12 h-12 rounded-lg items-center justify-center border border-border"
                  >
                    <Text className="text-2xl">{emoji}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Name Input */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-muted">Container name</Text>
              <TextInput
                placeholder="e.g., Steel Bottle"
                placeholderTextColor={colors.muted}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                className="bg-surface border border-border rounded-lg p-3 text-foreground"
                style={{ color: colors.foreground }}
              />
            </View>

            {/* Capacity Input */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-muted">Capacity (ml)</Text>
              <TextInput
                placeholder="e.g., 750"
                placeholderTextColor={colors.muted}
                value={formData.capacity}
                onChangeText={(text) => setFormData({ ...formData, capacity: text })}
                keyboardType="number-pad"
                className="bg-surface border border-border rounded-lg p-3 text-foreground"
                style={{ color: colors.foreground }}
              />
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-4">
              <Pressable
                onPress={() => setShowModal(false)}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.surface,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                className="flex-1 py-3 rounded-lg items-center border border-border"
              >
                <Text className="font-semibold text-foreground">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={!formData.name.trim() || !formData.capacity.trim()}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                className="flex-1 py-3 rounded-lg items-center"
              >
                <Text className="font-semibold text-white">
                  {editingId ? "Update" : "Create"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
