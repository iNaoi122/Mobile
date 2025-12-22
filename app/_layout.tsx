import React from "react";
import { Stack } from "expo-router";
import { SettingsProvider } from "../contexts/SettingsContext";
import { WeatherProvider } from "../contexts/WeatherContext";

export default function RootLayout() {
  return (
    <SettingsProvider>
      <WeatherProvider>
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
      </WeatherProvider>
    </SettingsProvider>
  );
}
