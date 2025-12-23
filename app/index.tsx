import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as GeoLocation from "../services/geolocation";
import StatusBar from "../components/StatusBar";
import TabBar from "../components/TabBar";
import InfoCard from "../components/InfoCard";
import WeatherBackground from "../components/WeatherBackground";
import { useWeather } from "../contexts/WeatherContext";
import { useSettings } from "../contexts/SettingsContext";
import { useThemeColors } from "../hooks/useThemeColors";

export default function Home() {
  const router = useRouter();
  const {
    currentWeather,
    isLoading,
    error,
    refreshWeatherData,
    loadWeatherByCoords,
  } = useWeather();
  const { getTemperatureSymbol, getWindSpeedSymbol } = useSettings();
  const colors = useThemeColors();
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleGeolocation = async () => {
    if (isGettingLocation) return; // Предотвращаем множественные вызовы

    try {
      setIsGettingLocation(true);
      const location = await GeoLocation.getCurrentPositionWithPermission();
      await loadWeatherByCoords(
        location.coords.latitude,
        location.coords.longitude,
      );
    } catch (error) {
      console.error("Ошибка получения геолокации:", error);

      // Улучшенная обработка ошибок с более понятными сообщениями
      let errorMessage = "Не удалось получить местоположение";

      if (error instanceof Error) {
        if (error.message.includes("разрешение")) {
          errorMessage =
            "Разрешите доступ к местоположению в настройках приложения";
        } else if (error.message.includes("местоположение")) {
          errorMessage = error.message;
        }
      }

      alert(errorMessage);
    } finally {
      setIsGettingLocation(false);
    }
  };

  if (isLoading) {
    return (
      <WeatherBackground>
        <View style={styles.container}>
          <StatusBar />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.loader} />
            <Text style={[styles.loadingText, { color: colors.text }]}>
              Загрузка данных...
            </Text>
          </View>
          <TabBar />
        </View>
      </WeatherBackground>
    );
  }

  if (error) {
    return (
      <WeatherBackground>
        <View style={styles.container}>
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
      </WeatherBackground>
    );
  }

  if (!currentWeather) {
    return (
      <WeatherBackground>
        <View style={styles.container}>
          <StatusBar />
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.text }]}>
              Нет данных о погоде
            </Text>
          </View>
          <TabBar />
        </View>
      </WeatherBackground>
    );
  }

  return (
    <WeatherBackground weatherCode={currentWeather.weatherCode}>
      <View style={styles.container}>
        <StatusBar />

        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.iconButton,
              {
                backgroundColor: colors.button,
                borderColor: colors.border,
                opacity: isGettingLocation ? 0.6 : 1,
              },
            ]}
            onPress={handleGeolocation}
            disabled={isGettingLocation}
          >
            {isGettingLocation ? (
              <ActivityIndicator size="small" color={colors.buttonText} />
            ) : (
              <Ionicons name="location" size={20} color={colors.buttonText} />
            )}
            <Text style={[styles.iconButtonText, { color: colors.buttonText }]}>
              {isGettingLocation ? "Определение..." : "Моя геолокация"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.iconButton,
              { backgroundColor: colors.button, borderColor: colors.border },
            ]}
            onPress={() => router.push("/search")}
          >
            <Ionicons name="search" size={20} color={colors.buttonText} />
            <Text style={[styles.iconButtonText, { color: colors.buttonText }]}>
              Поиск города
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
              icon="speedometer-outline"
              value={`${currentWeather.windSpeed} ${getWindSpeedSymbol()}`}
              label="Ветер"
            />
            <InfoCard
              icon="water-outline"
              value={`${currentWeather.humidity}%`}
              label="Влажность"
            />
            <InfoCard
              icon="speedometer"
              value={`${currentWeather.pressure}`}
              label="Давление"
            />
          </View>
        </View>

        <TabBar />
      </View>
    </WeatherBackground>
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
    gap: 10,
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderRadius: 8,
    gap: 6,
    flex: 1,
    justifyContent: "center",
  },
  iconButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderRadius: 8,
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
