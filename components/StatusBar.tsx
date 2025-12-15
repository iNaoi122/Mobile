import { View, Text, StyleSheet } from "react-native";

export default function StatusBar({ color = "#000" }: { color?: string }) {
  const time = new Date().toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color }]}>{time}</Text>
      <Text style={[styles.text, { color }]}>📶 🔋</Text>
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
    paddingBottom: 5,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
  },
});
