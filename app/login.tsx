import { useState } from "react";
import type { ComponentProps } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { SegmentedControl } from "@/components/hydration";
import { useColors } from "@/hooks/use-colors";
import { setAuthenticatedUser } from "@/hooks/use-auth";
import * as Api from "@/lib/_core/api";
import * as Auth from "@/lib/_core/auth";
import { MIcon } from "@/components/ui/MIcon";

type Mode = "login" | "register";

function toAuthUser(user: Api.AuthUserResponse): Auth.User {
  return {
    id: user.id,
    openId: user.openId,
    name: user.name,
    email: user.email,
    loginMethod: user.loginMethod,
    lastSignedIn: new Date(user.lastSignedIn),
  };
}

export default function LoginScreen() {
  const router = useRouter();
  const colors = useColors();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === "register";

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError("Enter your email and password");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const result = isRegister
        ? await Api.register(email.trim(), password, name.trim())
        : await Api.login(email.trim(), password);
      const user = toAuthUser(result.user);
      await Auth.setSessionToken(result.app_session_id);
      await Auth.setUserInfo(user);
      setAuthenticatedUser(user);
      router.replace(isRegister ? "/onboarding" : "/(tabs)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer containerClassName="bg-sky" className="px-5">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-center"
      >
        <View className="gap-8">
          <View className="items-center gap-3">
            <View
              className="w-16 h-16 rounded-3xl items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <MIcon name="water-drop" size={34} color="#FFFFFF" />
            </View>
            <View className="items-center gap-1">
              <Text className="text-4xl font-extrabold text-foreground">Siply</Text>
              <Text className="text-base text-muted text-center">
                Sign in once, track water everywhere.
              </Text>
            </View>
          </View>

          <View className="rounded-[32px] bg-surfaceElevated p-5 gap-4">
            <SegmentedControl
              options={[
                { value: "login" as const, label: "Login" },
                { value: "register" as const, label: "Register" },
              ]}
              value={mode}
              onChange={setMode}
            />

            {isRegister ? (
              <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" />
            ) : null}
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder={isRegister ? "8+ characters" : "Your password"}
              secureTextEntry
            />

            {error ? (
              <Text className="text-sm font-medium" style={{ color: colors.error }}>
                {error}
              </Text>
            ) : null}

            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              className="h-14 rounded-2xl items-center justify-center"
              style={({ pressed }) => ({
                backgroundColor: colors.primary,
                opacity: pressed || submitting ? 0.75 : 1,
              })}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-base font-bold text-white">
                  {isRegister ? "Create account" : "Sign in"}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

type FieldProps = ComponentProps<typeof TextInput> & {
  label: string;
};

function Field({ label, ...props }: FieldProps) {
  const colors = useColors();
  return (
    <View className="gap-2">
      <Text className="text-xs font-semibold text-muted">{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={colors.muted}
        className="h-13 rounded-2xl px-4 text-base text-foreground bg-background"
        style={{ borderWidth: 1, borderColor: colors.border, color: colors.foreground }}
      />
    </View>
  );
}
