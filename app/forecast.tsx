import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import StatusBar from "../components/StatusBar";
import TabBar from "../components/TabBar";

type HourlyItemProps = {
  time: string;
  temp: string;
};

function HourlyItem({ time, temp }: HourlyItemProps) {
  return (
    <View style={styles.hourlyItem}>
      <Text style={styles.hourlyTime}>{time}</Text>
      <Text style={styles.hourlyTemp}>{temp}°</Text>
    </View>
  );
}

type DailyItemProps = {
  day: string;
  high: string;
  low: string;
};

function DailyItem({ day, high, low }: DailyItemProps) {
  return (
    <View style={styles.dailyItem}>
      <Text style={styles.dailyDay}>{day}</Text>
      <View style={styles.dailyTemps}>
        <Text style={styles.temp}>{high}°</Text>
        <Text style={styles.temp}>{low}°</Text>
      </View>
    </View>
  );
}

export default function Forecast() {
  return (
    <View style={styles.container}>
      <StatusBar />

      <View style={styles.forecastHeader}>
        <Text style={styles.forecastCity}>Будапешт</Text>
        <Text style={styles.forecastSubtitle}>Прогноз на неделю</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>ПОЧАСОВОЙ ПРОГНОЗ</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.hourlyScroll}
        >
          <HourlyItem time="Сейчас" temp="24" />
          <HourlyItem time="14:00" temp="26" />
          <HourlyItem time="15:00" temp="25" />
          <HourlyItem time="16:00" temp="23" />
          <HourlyItem time="17:00" temp="22" />
          <HourlyItem time="18:00" temp="21" />
        </ScrollView>

        <Text style={styles.sectionTitle}>НА НЕДЕЛЮ</Text>
        <View style={styles.dailyList}>
          <DailyItem day="Сегодня" high="26" low="18" />
          <DailyItem day="Завтра" high="28" low="19" />
          <DailyItem day="Четверг" high="30" low="21" />
          <DailyItem day="Пятница" high="27" low="20" />
          <DailyItem day="Суббота" high="22" low="16" />
          <DailyItem day="Воскресенье" high="24" low="17" />
          <DailyItem day="Понедельник" high="26" low="18" />
        </View>
      </ScrollView>

      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  forecastHeader: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  forecastCity: {
    fontSize: 24,
    color: "#000",
    marginBottom: 5,
  },
  forecastSubtitle: {
    fontSize: 14,
    color: "#000",
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    color: "#000",
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 20,
    letterSpacing: 1,
  },
  hourlyScroll: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#000",
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
    color: "#000",
    marginBottom: 8,
  },
  hourlyTemp: {
    fontSize: 16,
    color: "#000",
  },
  dailyList: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#000",
  },
  dailyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  dailyDay: {
    fontSize: 16,
    color: "#000",
    flex: 1,
  },
  dailyTemps: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  temp: {
    fontSize: 16,
    color: "#000",
  },
});
