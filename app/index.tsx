import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import StatusBar from "../components/StatusBar";
import TabBar from "../components/TabBar";
import InfoCard from "../components/InfoCard";

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar color="#fff" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => alert("Геолокация")}
        >
          <Text style={styles.iconText}>📍</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.push("/search")}
        >
          <Text style={styles.iconText}>🔍</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.cityName}>Будапешт</Text>
        <Text style={styles.temperature}>24°</Text>
        <Text style={styles.weatherIcon}>⛅</Text>
        <Text style={styles.weatherDesc}>Частично облачно</Text>

        <View style={styles.infoCards}>
          <InfoCard value="12 км/ч" label="Ветер" />
          <InfoCard value="65%" label="Влажность" />
          <InfoCard value="1013" label="Давление" />
        </View>
      </View>

      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#667eea",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  cityName: {
    fontSize: 32,
    fontWeight: "300",
    color: "#fff",
    marginBottom: 10,
  },
  temperature: {
    fontSize: 72,
    fontWeight: "200",
    color: "#fff",
    marginBottom: 20,
  },
  weatherIcon: {
    fontSize: 64,
    marginBottom: 10,
  },
  weatherDesc: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 40,
  },
  infoCards: {
    flexDirection: "row",
    width: "100%",
    marginTop: 20,
  },
});
