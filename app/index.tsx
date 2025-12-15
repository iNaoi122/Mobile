import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import StatusBar from "../components/StatusBar";
import TabBar from "../components/TabBar";
import InfoCard from "../components/InfoCard";

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => alert("Геолокация")}
        >
          <Text style={styles.buttonText}>Геолокация</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/search")}
        >
          <Text style={styles.buttonText}>Поиск</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.cityName}>Будапешт</Text>
        <Text style={styles.temperature}>24°</Text>
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
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#000",
  },
  buttonText: {
    color: "#000",
    fontSize: 14,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  cityName: {
    fontSize: 24,
    color: "#000",
    marginBottom: 10,
  },
  temperature: {
    fontSize: 48,
    color: "#000",
    marginBottom: 10,
  },
  weatherDesc: {
    fontSize: 16,
    color: "#000",
    marginBottom: 30,
  },
  infoCards: {
    flexDirection: "row",
    width: "100%",
    marginTop: 20,
  },
});
