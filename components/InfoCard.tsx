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
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 5,
  },
  label: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
});
