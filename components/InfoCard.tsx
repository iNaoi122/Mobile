import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemeColors } from "../hooks/useThemeColors";

type InfoCardProps = {
  value: string;
  label: string;
};

export default function InfoCard({ value, label }: InfoCardProps) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  value: {
    fontSize: 16,
    marginBottom: 5,
  },
  label: {
    fontSize: 12,
  },
});
