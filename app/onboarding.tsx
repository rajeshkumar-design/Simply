import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useHydration } from "@/lib/hydration-context";
import { useColors } from "@/hooks/use-colors";
import { MIcon } from "@/components/ui/MIcon";
import type { UserSettings } from "@/lib/types";

const GOAL_PRESETS = [1500, 2000, 2500, 3000];
const MIN_GOAL = 500;
const MAX_GOAL = 5000;

export default function OnboardingScreen() {
  const router = useRouter();
  const colors = useColors();
  const { state, updateSettings } = useHydration();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(state.settings.daily_goal_ml || 2000);
  const [unit, setUnit] = useState<UserSettings["unit_preference"]>(state.settings.unit_preference || "ml");
  const [wakeTime, setWakeTime] = useState(state.settings.wake_time || "07:00");
  const [sleepTime, setSleepTime] = useState(state.settings.sleep_time || "22:00");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setGoal(state.settings.daily_goal_ml || 2000);
    setUnit(state.settings.unit_preference || "ml");
    setWakeTime(state.settings.wake_time || "07:00");
    setSleepTime(state.settings.sleep_time || "22:00");
  }, [state.settings]);

  const progress = useMemo(() => (goal - MIN_GOAL) / (MAX_GOAL - MIN_GOAL), [goal]);
  const clampedProgress = Math.max(0, Math.min(1, progress));

  const adjustGoal = async (delta: number) => {
    setGoal((current) => Math.max(MIN_GOAL, Math.min(MAX_GOAL, current + delta)));
    await Haptics.selectionAsync();
  };

  const finish = async () => {
    setSaving(true);
    await updateSettings({
      daily_goal_ml: goal,
      unit_preference: unit,
      wake_time: wakeTime,
      sleep_time: sleepTime,
    });
    setSaving(false);
    router.replace("/(tabs)");
  };

  return (
    <ScreenContainer containerClassName="bg-sky" className="px-5">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingVertical: 20 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-between gap-8">
          <View className="gap-2">
            <Text className="text-sm font-bold text-muted">Setup</Text>
            <Text className="text-4xl font-extrabold text-foreground">
              {step === 0 ? "Set your daily goal" : step === 1 ? "Choose your units" : "Reminder window"}
            </Text>
            <Text className="text-base text-muted">
              {step === 0
                ? "Pick a target before you start tracking. You can edit this later."
                : step === 1
                  ? "Use the unit that feels natural for you."
                  : "Optional, but useful for future reminder scheduling."}
            </Text>
          </View>

          {step === 0 ? (
            <View className="items-center gap-6">
              <View
                className="w-64 h-64 rounded-full items-center justify-center"
                style={{
                  borderWidth: 18,
                  borderColor: colors.ringTrack,
                  backgroundColor: colors.surfaceElevated,
                }}
              >
                <View
                  className="absolute rounded-full"
                  style={{
                    width: 238,
                    height: 238,
                    borderWidth: 18,
                    borderColor: colors.primary,
                    opacity: 0.25 + clampedProgress * 0.6,
                  }}
                />
                <Text className="text-5xl font-extrabold text-foreground">{goal}</Text>
                <Text className="text-base font-semibold text-muted">ml / day</Text>
              </View>

              <View className="flex-row items-center gap-4">
                <RoundButton icon="remove" onPress={() => adjustGoal(-100)} />
                <View className="rounded-2xl px-5 py-3 bg-surfaceElevated">
                  <Text className="text-sm font-bold text-foreground">100 ml steps</Text>
                </View>
                <RoundButton icon="add" onPress={() => adjustGoal(100)} />
              </View>

              <View className="flex-row flex-wrap justify-center gap-2">
                {GOAL_PRESETS.map((preset) => (
                  <Pressable
                    key={preset}
                    onPress={() => setGoal(preset)}
                    className="px-5 py-3 rounded-full"
                    style={{
                      backgroundColor: goal === preset ? colors.primary : colors.surfaceElevated,
                    }}
                  >
                    <Text
                      className="font-bold"
                      style={{ color: goal === preset ? "#FFFFFF" : colors.foreground }}
                    >
                      {preset / 1000}L
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {step === 1 ? (
            <View className="gap-3">
              <UnitCard label="Milliliters" value="ml" selected={unit === "ml"} onPress={() => setUnit("ml")} />
              <UnitCard label="Ounces" value="oz" selected={unit === "oz"} onPress={() => setUnit("oz")} />
            </View>
          ) : null}

          {step === 2 ? (
            <View className="rounded-[32px] p-5 bg-surfaceElevated gap-4">
              <TimeField label="Wake time" value={wakeTime} onChangeText={setWakeTime} />
              <TimeField label="Sleep time" value={sleepTime} onChangeText={setSleepTime} />
              <Text className="text-xs text-muted">Use 24-hour format, for example 07:00 and 22:00.</Text>
            </View>
          ) : null}

          <View className="gap-3">
            <View className="flex-row gap-2 justify-center">
              {[0, 1, 2].map((item) => (
                <View
                  key={item}
                  className="h-2 rounded-full"
                  style={{
                    width: item === step ? 28 : 8,
                    backgroundColor: item === step ? colors.primary : colors.border,
                  }}
                />
              ))}
            </View>

            <View className="flex-row gap-3">
              {step > 0 ? (
                <Pressable
                  onPress={() => setStep((current) => current - 1)}
                  className="h-14 px-6 rounded-2xl items-center justify-center bg-surfaceElevated"
                >
                  <Text className="font-bold text-foreground">Back</Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={step < 2 ? () => setStep((current) => current + 1) : finish}
                disabled={saving}
                className="h-14 rounded-2xl items-center justify-center flex-1"
                style={{ backgroundColor: colors.primary, opacity: saving ? 0.75 : 1 }}
              >
                <Text className="font-bold text-white">{step < 2 ? "Continue" : "Start tracking"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function RoundButton({ icon, onPress }: { icon: "add" | "remove"; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      className="w-14 h-14 rounded-full items-center justify-center"
      style={({ pressed }) => ({
        backgroundColor: colors.surfaceElevated,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <MIcon name={icon} size={24} color={colors.foreground} />
    </Pressable>
  );
}

function UnitCard({
  label,
  value,
  selected,
  onPress,
}: {
  label: string;
  value: "ml" | "oz";
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      className="rounded-[28px] p-5 bg-surfaceElevated flex-row items-center justify-between"
      style={{ borderWidth: 1.5, borderColor: selected ? colors.primary : colors.border }}
    >
      <View>
        <Text className="text-xl font-extrabold text-foreground">{label}</Text>
        <Text className="text-sm text-muted mt-1">{value === "ml" ? "Metric tracking" : "US fluid ounces"}</Text>
      </View>
      <Text className="text-lg font-extrabold" style={{ color: selected ? colors.primary : colors.muted }}>
        {value}
      </Text>
    </Pressable>
  );
}

function TimeField({ label, value, onChangeText }: { label: string; value: string; onChangeText: (text: string) => void }) {
  const colors = useColors();
  return (
    <View className="gap-2">
      <Text className="text-xs font-semibold text-muted">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="07:00"
        placeholderTextColor={colors.muted}
        className="h-14 rounded-2xl px-4 text-base text-foreground bg-background"
        style={{ borderWidth: 1, borderColor: colors.border, color: colors.foreground }}
      />
    </View>
  );
}
