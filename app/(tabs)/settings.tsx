import { ScrollView, Text, View, Pressable, TextInput, Switch, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useHydration } from "@/lib/hydration-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import * as Haptics from "expo-haptics";

/**
 * Settings Screen - Configure app preferences
 * 
 * Allows users to:
 * - Set daily hydration goal
 * - Choose unit preference (ml or oz)
 * - Toggle theme (light/dark)
 * - View app information
 */
export default function SettingsScreen() {
  const colors = useColors();
  const { state, updateSettings } = useHydration();
  const { colorScheme, setColorScheme } = useThemeContext();
  const { settings, isLoading } = state;

  const [goalInput, setGoalInput] = useState(settings.daily_goal_ml.toString());
  const [unitPreference, setUnitPreference] = useState(settings.unit_preference);
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");

  const handleGoalChange = async (text: string) => {
    setGoalInput(text);
    const goal = parseInt(text, 10);
    if (!isNaN(goal) && goal > 0) {
      await updateSettings({ daily_goal_ml: goal });
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleUnitChange = async (unit: "ml" | "oz") => {
    setUnitPreference(unit);
    await updateSettings({ unit_preference: unit });
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleThemeToggle = async (value: boolean) => {
    setIsDarkMode(value);
    const newScheme = value ? "dark" : "light";
    setColorScheme(newScheme);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePresetGoal = async (goal: number) => {
    setGoalInput(goal.toString());
    await updateSettings({ daily_goal_ml: goal });
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        <View className="gap-6">
          {/* Header */}
          <View className="gap-1">
            <Text className="text-2xl font-bold text-foreground">Settings</Text>
            <Text className="text-sm text-muted">Customize your experience</Text>
          </View>

          {/* Daily Goal Section */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-muted">Daily Goal</Text>
            <View className="bg-surface rounded-2xl p-4 gap-3 border border-border">
              <View className="gap-2">
                <Text className="text-xs text-muted">Custom goal (ml)</Text>
                <TextInput
                  placeholder="3000"
                  placeholderTextColor={colors.muted}
                  value={goalInput}
                  onChangeText={handleGoalChange}
                  keyboardType="number-pad"
                  className="bg-background border border-border rounded-lg p-3 text-foreground text-base"
                  style={{ color: colors.foreground }}
                />
              </View>

              <View className="border-t border-border pt-3">
                <Text className="text-xs text-muted mb-2">Quick presets</Text>
                <View className="flex-row gap-2">
                  {[2000, 2500, 3000, 3500].map((goal) => (
                    <Pressable
                      key={goal}
                      onPress={() => handlePresetGoal(goal)}
                      style={({ pressed }) => [
                        {
                          backgroundColor:
                            parseInt(goalInput) === goal ? colors.primary : colors.background,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                      className="flex-1 py-2 rounded-lg items-center border border-border"
                    >
                      <Text
                        className="text-sm font-semibold"
                        style={{
                          color: parseInt(goalInput) === goal ? "white" : colors.foreground,
                        }}
                      >
                        {goal / 1000}L
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Unit Preference Section */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-muted">Unit Preference</Text>
            <View className="bg-surface rounded-2xl p-4 gap-2 border border-border">
              {(["ml", "oz"] as const).map((unit) => (
                <Pressable
                  key={unit}
                  onPress={() => handleUnitChange(unit)}
                  style={({ pressed }) => [
                    {
                      backgroundColor: unitPreference === unit ? colors.primary + "10" : "transparent",
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                  className="flex-row items-center justify-between p-3 rounded-lg"
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className="w-5 h-5 rounded-full border-2"
                      style={{
                        borderColor: unitPreference === unit ? colors.primary : colors.border,
                        backgroundColor:
                          unitPreference === unit ? colors.primary : "transparent",
                      }}
                    />
                    <Text className="text-base font-semibold text-foreground capitalize">
                      {unit === "ml" ? "Milliliters (ml)" : "Fluid Ounces (fl oz)"}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Theme Section */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-muted">Appearance</Text>
            <View className="bg-surface rounded-2xl p-4 gap-3 border border-border flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <IconSymbol
                  name={isDarkMode ? "moon.stars.fill" : "sun.max.fill"}
                  size={20}
                  color={colors.primary}
                />
                <Text className="text-base font-semibold text-foreground">
                  {isDarkMode ? "Dark Mode" : "Light Mode"}
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={handleThemeToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={isDarkMode ? colors.primary : colors.surface}
              />
            </View>
          </View>

          {/* About Section */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-muted">About</Text>
            <View className="bg-surface rounded-2xl p-4 gap-3 border border-border">
              <View className="flex-row justify-between items-center pb-3 border-b border-border">
                <Text className="text-sm text-muted">App Version</Text>
                <Text className="text-sm font-semibold text-foreground">1.0.0</Text>
              </View>
              <View className="flex-row justify-between items-center pb-3 border-b border-border">
                <Text className="text-sm text-muted">Build</Text>
                <Text className="text-sm font-semibold text-foreground">1</Text>
              </View>
              <View>
                <Text className="text-xs text-muted">
                  Siply helps you stay hydrated by making water tracking simple and enjoyable.
                </Text>
              </View>
            </View>
          </View>

          {/* Tips Section */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-muted">Tips</Text>
            <View className="bg-primary/10 rounded-2xl p-4 gap-2 border border-primary/20">
              <Text className="text-sm font-semibold text-foreground">Stay hydrated!</Text>
              <Text className="text-xs text-muted leading-relaxed">
                Drinking enough water is essential for your health. Aim to spread your intake throughout the day for best results.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
