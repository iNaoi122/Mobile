import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemeColors } from "../hooks/useThemeColors";

export default function StatusBar() {
  const colors = useThemeColors();

  const time = new Date().toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.statusBar, borderBottomColor: colors.border },
      ]}
    >
      <Text style={[styles.text, { color: colors.text }]}>{time}</Text>
      <Text style={[styles.text, { color: colors.text }]}>Status</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  text: {
    fontSize: 14,
  },
});
