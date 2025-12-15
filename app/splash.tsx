import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    // Переход на главный экран через 2 секунды
    const timer = setTimeout(() => {
      router.replace("/");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>☀️</Text>
      <Text style={styles.appName}>Weather</Text>
      <Text style={styles.subtitle}>Прогноз погоды</Text>
      <ActivityIndicator size="large" color="#fff" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});
