import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useThemeColors } from "../hooks/useThemeColors";

type TabItem = {
  label: string;
  path: string;
};

const tabs: TabItem[] = [
  { label: "Главная", path: "/" },
  { label: "Прогноз", path: "/forecast" },
  { label: "Настройки", path: "/settings" },
];

export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.tabBar, borderTopColor: colors.border },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <TouchableOpacity
            key={tab.path}
            style={styles.tabItem}
            onPress={() => router.push(tab.path as any)}
          >
            <Text style={[styles.tabLabel, { color: colors.text }]}>
              {isActive ? `[${tab.label}]` : tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 15,
    borderTopWidth: 1,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    flex: 1,
  },
  tabLabel: {
    fontSize: 14,
  },
});
