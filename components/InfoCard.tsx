import React from "react";
import { View, Text, StyleSheet } from "react-native";

type InfoCardProps = {
  value: string;
  label: string;
};

export default function InfoCard({ value, label }: InfoCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  value: {
    fontSize: 16,
    color: "#000",
    marginBottom: 5,
  },
  label: {
    fontSize: 12,
    color: "#000",
  },
});
