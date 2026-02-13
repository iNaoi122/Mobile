import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StatusBar from "../components/StatusBar";
import TabBar from "../components/TabBar";
import WeatherBackground from "../components/WeatherBackground";
import { useWeather } from "../contexts/WeatherContext";
import { useSettings } from "../contexts/SettingsContext";
import { useThemeColors } from "../hooks/useThemeColors";

type HourlyItemProps = {
  time: string;
  temp: string;
  weatherCode?: number;
};

function HourlyItem({ time, temp, weatherCode }: HourlyItemProps) {
  const colors = useThemeColors();

  const getWeatherIcon = (code?: number) => {
    if (code === undefined) return "cloudy";
    if (code <= 1) return "sunny";
    if (code <= 3) return "partly-sunny";
    if (code >= 95) return "thunderstorm";
    if (code >= 71) return "snow";
    if (code >= 51) return "rainy";
    if (code >= 45) return "cloudy";
    return "cloudy";
  };

  return (
    <View style={styles.hourlyItem}>
      <Text style={[styles.hourlyTime, { color: colors.text }]}>{time}</Text>
      <Ionicons
        name={getWeatherIcon(weatherCode)}
        size={28}
        color={colors.text}
        style={{ marginVertical: 8 }}
      />
      <Text style={[styles.hourlyTemp, { color: colors.text }]}>{temp}</Text>
    </View>
  );
}

type DailyItemProps = {
  day: string;
  high: string;
  low: string;
  weatherCode?: number;
};

function DailyItem({ day, high, low, weatherCode }: DailyItemProps) {
  const colors = useThemeColors();

  const getWeatherIcon = (code?: number) => {
    if (code === undefined) return "cloudy";
    if (code <= 1) return "sunny";
    if (code <= 3) return "partly-sunny";
    if (code >= 95) return "thunderstorm";
    if (code >= 71) return "snow";
    if (code >= 51) return "rainy";
    if (code >= 45) return "cloudy";
    return "cloudy";
  };

  return (
    <View style={[styles.dailyItem, { borderBottomColor: colors.border }]}>
      <Text style={[styles.dailyDay, { color: colors.text }]}>{day}</Text>
      <View style={styles.dailyContent}>
        <Ionicons
          name={getWeatherIcon(weatherCode)}
          size={24}
          color={colors.text}
        />
        <View style={styles.dailyTemps}>
          <View style={styles.tempItem}>
            <Ionicons name="arrow-up" size={14} color="#FF6B6B" />
            <Text style={[styles.temp, { color: colors.text }]}>{high}</Text>
          </View>
          <View style={styles.tempItem}>
            <Ionicons name="arrow-down" size={14} color="#4ECDC4" />
            <Text style={[styles.temp, { color: colors.text }]}>{low}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function Forecast() {
  const { currentWeather, forecast, isLoading, error } = useWeather();
  const { getTemperatureSymbol } = useSettings();
  const colors = useThemeColors();

  if (isLoading) {
    return (
      <WeatherBackground>
        <View style={styles.container}>
          <StatusBar />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.loader} />
            <Text style={[styles.loadingText, { color: colors.text }]}>
              Загрузка прогноза...
            </Text>
          </View>
          <TabBar />
        </View>
      </WeatherBackground>
    );
  }

  if (error || !forecast || !currentWeather) {
    return (
      <WeatherBackground>
        <View style={styles.container}>
          <StatusBar />
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.text }]}>
              {error || "Нет данных прогноза"}
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

        <View
          style={[
            styles.forecastHeader,
            {
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.forecastCity, { color: colors.text }]}>
            {currentWeather.city}
          </Text>
          <Text style={[styles.forecastSubtitle, { color: colors.text }]}>
            Прогноз на неделю
          </Text>
        </View>

        <ScrollView style={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            ПОЧАСОВОЙ ПРОГНОЗ
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[
              styles.hourlyScroll,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {forecast.hourly.map((item, index) => (
              <HourlyItem
                key={index}
                time={item.time}
                temp={`${item.temperature}${getTemperatureSymbol()}`}
                weatherCode={item.weatherCode}
              />
            ))}
          </ScrollView>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            НА НЕДЕЛЮ
          </Text>
          <View
            style={[
              styles.dailyList,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {forecast.daily.map((item, index) => (
              <DailyItem
                key={index}
                day={item.day}
                high={`${item.tempMax}${getTemperatureSymbol()}`}
                low={`${item.tempMin}${getTemperatureSymbol()}`}
                weatherCode={item.weatherCode}
              />
            ))}
          </View>
        </ScrollView>

        <TabBar />
      </View>
    </WeatherBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  forecastHeader: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  forecastCity: {
    fontSize: 24,
    marginBottom: 5,
  },
  forecastSubtitle: {
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 20,
    letterSpacing: 1,
  },
  hourlyScroll: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginHorizontal: 20,
    borderWidth: 1,
    borderRadius: 12,
  },
  hourlyItem: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  hourlyTime: {
    fontSize: 13,
    marginBottom: 6,
    fontWeight: "500",
  },
  hourlyTemp: {
    fontSize: 16,
    fontWeight: "600",
  },
  dailyList: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  dailyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  dailyDay: {
    fontSize: 16,
    flex: 1,
    fontWeight: "500",
  },
  dailyContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dailyTemps: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tempItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  temp: {
    fontSize: 15,
    fontWeight: "500",
    minWidth: 40,
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
  },
});
