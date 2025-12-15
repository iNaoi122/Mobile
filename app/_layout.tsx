import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="splash"
    >
      <Stack.Screen name="splash" />
      <Stack.Screen name="index" />
      <Stack.Screen name="search" />
      <Stack.Screen name="forecast" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
