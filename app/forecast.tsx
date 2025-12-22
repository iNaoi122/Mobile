import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import StatusBar from "../components/StatusBar";
import TabBar from "../components/TabBar";
import { useWeather } from "../contexts/WeatherContext";
import { useSettings } from "../contexts/SettingsContext";
import { useThemeColors } from "../hooks/useThemeColors";

type HourlyItemProps = {
  time: string;
  temp: string;
};

function HourlyItem({ time, temp }: HourlyItemProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.hourlyItem}>
      <Text style={[styles.hourlyTime, { color: colors.text }]}>{time}</Text>
      <Text style={[styles.hourlyTemp, { color: colors.text }]}>{temp}</Text>
    </View>
  );
}

type DailyItemProps = {
  day: string;
  high: string;
  low: string;
};

function DailyItem({ day, high, low }: DailyItemProps) {
  const colors = useThemeColors();

  return (
    <View style={[styles.dailyItem, { borderBottomColor: colors.border }]}>
      <Text style={[styles.dailyDay, { color: colors.text }]}>{day}</Text>
      <View style={styles.dailyTemps}>
        <Text style={[styles.temp, { color: colors.text }]}>{high}</Text>
        <Text style={[styles.temp, { color: colors.text }]}>{low}</Text>
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.loader} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Загрузка прогноза...
          </Text>
        </View>
        <TabBar />
      </View>
    );
  }

  if (error || !forecast || !currentWeather) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            {error || "Нет данных прогноза"}
          </Text>
        </View>
        <TabBar />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar />

      <View
        style={[
          styles.forecastHeader,
          {
            backgroundColor: colors.background,
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
            />
          ))}
        </View>
      </ScrollView>

      <TabBar />
    </View>
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
  },
  hourlyItem: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  hourlyTime: {
    fontSize: 14,
    marginBottom: 8,
  },
  hourlyTemp: {
    fontSize: 16,
  },
  dailyList: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
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
  },
  dailyTemps: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  temp: {
    fontSize: 16,
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
