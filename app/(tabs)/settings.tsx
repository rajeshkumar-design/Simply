import { ScrollView, Text, View, TextInput, ActivityIndicator, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useHydration } from '@/lib/hydration-context';
import { useThemeContext } from '@/lib/theme-provider';
import { useColors } from '@/hooks/use-colors';
import { useAuth } from '@/hooks/use-auth';
import * as Haptics from 'expo-haptics';
import { SegmentedControl, SettingsSection, SettingsRow } from '@/components/hydration';
import { MIcon } from '@/components/ui/MIcon';
import type { ColorScheme } from '@/constants/theme';

const GOAL_PRESETS = [2000, 2500, 3000, 3500];

export default function SettingsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { state, updateSettings } = useHydration();
  const { logout } = useAuth();
  const { colorScheme, setColorScheme } = useThemeContext();
  const { settings, isLoading } = state;

  const [goalInput, setGoalInput] = useState(settings.daily_goal_ml.toString());
  const [unitPreference, setUnitPreference] = useState(settings.unit_preference);

  useEffect(() => {
    setGoalInput(settings.daily_goal_ml.toString());
    setUnitPreference(settings.unit_preference);
  }, [settings.daily_goal_ml, settings.unit_preference]);

  const handleGoalChange = async (text: string) => {
    setGoalInput(text);
    const goal = parseInt(text, 10);
    if (!isNaN(goal) && goal > 0) {
      await updateSettings({ daily_goal_ml: goal });
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePresetGoal = async (goal: number) => {
    setGoalInput(goal.toString());
    await updateSettings({ daily_goal_ml: goal });
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleUnitChange = async (unit: 'ml' | 'oz') => {
    setUnitPreference(unit);
    await updateSettings({ unit_preference: unit });
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleThemeChange = async (scheme: ColorScheme) => {
    setColorScheme(scheme);
    await updateSettings({ theme: scheme });
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const currentGoal = parseInt(goalInput, 10);

  return (
    <ScreenContainer className="p-4" containerClassName="bg-sky">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            className="w-10 h-10 rounded-full items-center justify-center -ml-2 mt-1"
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <MIcon name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>

          <View className="gap-0.5 px-1">
            <Text className="text-3xl font-extrabold text-foreground">Settings</Text>
            <Text className="text-sm text-muted">Customize your experience</Text>
          </View>

          <SettingsSection title="Daily goal">
            <SettingsRow
              label="Edit goal onboarding"
              onPress={() => router.push('/onboarding')}
              rightElement={<MIcon name="chevron-right" size={22} color={colors.muted} />}
            />
            <View className="px-4 py-4 gap-3">
              <Text className="text-xs text-muted">Custom (ml)</Text>
              <TextInput
                placeholder="3000"
                placeholderTextColor={colors.muted}
                value={goalInput}
                onChangeText={handleGoalChange}
                keyboardType="number-pad"
                className="rounded-xl px-4 py-3 text-foreground bg-background"
                style={{ color: colors.foreground, borderWidth: 1, borderColor: colors.border }}
              />
              <View className="flex-row flex-wrap gap-2">
                {GOAL_PRESETS.map((goal) => {
                  const active = currentGoal === goal;
                  return (
                    <Pressable
                      key={goal}
                      onPress={() => handlePresetGoal(goal)}
                      className="px-4 py-2 rounded-full"
                      style={{
                        backgroundColor: active ? colors.primary : colors.ringTrack,
                      }}
                    >
                      <Text
                        className="text-sm font-semibold"
                        style={{ color: active ? '#fff' : colors.foreground }}
                      >
                        {goal / 1000}L
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </SettingsSection>

          <SettingsSection title="Units">
            <View className="p-3">
              <SegmentedControl
                options={[
                  { value: 'ml' as const, label: 'Milliliters' },
                  { value: 'oz' as const, label: 'Ounces' },
                ]}
                value={unitPreference}
                onChange={handleUnitChange}
              />
            </View>
          </SettingsSection>

          <SettingsSection title="Appearance">
            <View className="p-3">
              <SegmentedControl
                options={[
                  { value: 'light' as const, label: 'Light' },
                  { value: 'dark' as const, label: 'Dark' },
                ]}
                value={colorScheme}
                onChange={handleThemeChange}
              />
            </View>
          </SettingsSection>

          <SettingsSection title="Containers">
            <SettingsRow
              label="Manage containers"
              onPress={() => router.push('/(tabs)/containers')}
              rightElement={<MIcon name="chevron-right" size={22} color={colors.muted} />}
              isLast
            />
          </SettingsSection>

          <SettingsSection title="Account">
            <SettingsRow
              label="Sign out"
              onPress={handleLogout}
              rightElement={<MIcon name="logout" size={20} color={colors.muted} />}
              isLast
            />
          </SettingsSection>

        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
