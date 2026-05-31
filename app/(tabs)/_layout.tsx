import { Tabs } from 'expo-router';

// The traditional tab bar is hidden in favor of the Me+ style floating
// navigation rendered inside the Home screen. The Tabs shell is kept because
// Expo Router requires it for the route group, but the bar itself is invisible.
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="containers" />
      <Tabs.Screen name="analytics" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
