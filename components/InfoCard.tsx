import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../hooks/useThemeColors";

type InfoCardProps = {
  value: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export default function InfoCard({ value, label, icon }: InfoCardProps) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={24}
          color={colors.text}
          style={{ opacity: 0.7, marginBottom: 8 }}
        />
      )}
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
  },
  label: {
    fontSize: 12,
    opacity: 0.7,
  },
});
