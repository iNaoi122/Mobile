import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import StatusBar from "../components/StatusBar";
import TabBar from "../components/TabBar";
import InfoCard from "../components/InfoCard";
import { useWeather } from "../contexts/WeatherContext";
import { useSettings } from "../contexts/SettingsContext";
import { useThemeColors } from "../hooks/useThemeColors";

export default function Home() {
  const router = useRouter();
  const { currentWeather, isLoading, error, refreshWeatherData } = useWeather();
  const { getTemperatureSymbol, getWindSpeedSymbol } = useSettings();
  const colors = useThemeColors();

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.loader} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Загрузка данных...
          </Text>
        </View>
        <TabBar />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Ошибка: {error}
          </Text>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.button, borderColor: colors.border },
            ]}
            onPress={refreshWeatherData}
          >
            <Text style={[styles.buttonText, { color: colors.buttonText }]}>
              Повторить
            </Text>
          </TouchableOpacity>
        </View>
        <TabBar />
      </View>
    );
  }

  if (!currentWeather) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Нет данных о погоде
          </Text>
        </View>
        <TabBar />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: colors.button, borderColor: colors.border },
          ]}
          onPress={() => alert("Геолокация")}
        >
          <Text style={[styles.buttonText, { color: colors.buttonText }]}>
            Геолокация
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: colors.button, borderColor: colors.border },
          ]}
          onPress={() => router.push("/search")}
        >
          <Text style={[styles.buttonText, { color: colors.buttonText }]}>
            Поиск
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.cityName, { color: colors.text }]}>
          {currentWeather.city}
          {currentWeather.country && `, ${currentWeather.country}`}
        </Text>
        <Text style={[styles.temperature, { color: colors.text }]}>
          {currentWeather.temperature}
          {getTemperatureSymbol()}
        </Text>
        <Text style={[styles.weatherDesc, { color: colors.text }]}>
          {currentWeather.description}
        </Text>

        <View style={styles.infoCards}>
          <InfoCard
            value={`${currentWeather.windSpeed} ${getWindSpeedSymbol()}`}
            label="Ветер"
          />
          <InfoCard value={`${currentWeather.humidity}%`} label="Влажность" />
          <InfoCard value={`${currentWeather.pressure}`} label="Давление" />
        </View>
      </View>

      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
  },
  buttonText: {
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
    marginBottom: 10,
  },
  temperature: {
    fontSize: 48,
    marginBottom: 10,
  },
  weatherDesc: {
    fontSize: 16,
    marginBottom: 30,
  },
  infoCards: {
    flexDirection: "row",
    width: "100%",
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
});
