import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";

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

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <TouchableOpacity
            key={tab.path}
            style={styles.tabItem}
            onPress={() => router.push(tab.path as any)}
          >
            <Text style={styles.tabLabel}>
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
    backgroundColor: "#fff",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#000",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    flex: 1,
  },
  tabLabel: {
    fontSize: 14,
    color: "#000",
  },
});
