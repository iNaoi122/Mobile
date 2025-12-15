import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import StatusBar from "../components/StatusBar";
import TabBar from "../components/TabBar";

type HourlyItemProps = {
  time: string;
  icon: string;
  temp: string;
};

function HourlyItem({ time, icon, temp }: HourlyItemProps) {
  return (
    <View style={styles.hourlyItem}>
      <Text style={styles.hourlyTime}>{time}</Text>
      <Text style={styles.hourlyIcon}>{icon}</Text>
      <Text style={styles.hourlyTemp}>{temp}°</Text>
    </View>
  );
}

type DailyItemProps = {
  day: string;
  icon: string;
  high: string;
  low: string;
};

function DailyItem({ day, icon, high, low }: DailyItemProps) {
  return (
    <View style={styles.dailyItem}>
      <Text style={styles.dailyDay}>{day}</Text>
      <Text style={styles.dailyIcon}>{icon}</Text>
      <View style={styles.dailyTemps}>
        <Text style={styles.tempHigh}>{high}°</Text>
        <Text style={styles.tempLow}>{low}°</Text>
      </View>
    </View>
  );
}

export default function Forecast() {
  return (
    <View style={styles.container}>
      <View style={styles.statusBarContainer}>
        <StatusBar color="#fff" />
      </View>

      <View style={styles.forecastHeader}>
        <Text style={styles.forecastCity}>Будапешт</Text>
        <Text style={styles.forecastSubtitle}>Прогноз на неделю</Text>
      </View>

      <ScrollView style={styles.content}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.hourlyScroll}
        >
          <HourlyItem time="Сейчас" icon="☀️" temp="24" />
          <HourlyItem time="14:00" icon="🌤️" temp="26" />
          <HourlyItem time="15:00" icon="⛅" temp="25" />
          <HourlyItem time="16:00" icon="🌥️" temp="23" />
          <HourlyItem time="17:00" icon="☁️" temp="22" />
          <HourlyItem time="18:00" icon="🌤️" temp="21" />
        </ScrollView>

        <View style={styles.dailyList}>
          <DailyItem day="Сегодня" icon="⛅" high="26" low="18" />
          <DailyItem day="Завтра" icon="🌤️" high="28" low="19" />
          <DailyItem day="Четверг" icon="☀️" high="30" low="21" />
          <DailyItem day="Пятница" icon="⛅" high="27" low="20" />
          <DailyItem day="Суббота" icon="🌧️" high="22" low="16" />
          <DailyItem day="Воскресенье" icon="🌤️" high="24" low="17" />
          <DailyItem day="Понедельник" icon="☀️" high="26" low="18" />
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
  statusBarContainer: {
    backgroundColor: "#667eea",
  },
  forecastHeader: {
    backgroundColor: "#667eea",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  forecastCity: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 5,
  },
  forecastSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  content: {
    flex: 1,
  },
  hourlyScroll: {
    backgroundColor: "#f8f9ff",
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  hourlyItem: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
    paddingHorizontal: 15,
  },
  hourlyTime: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  hourlyIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  hourlyTemp: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  dailyList: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  dailyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dailyDay: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    flex: 1,
  },
  dailyIcon: {
    fontSize: 28,
    marginHorizontal: 20,
  },
  dailyTemps: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 80,
    justifyContent: "flex-end",
  },
  tempHigh: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginRight: 10,
  },
  tempLow: {
    fontSize: 18,
    fontWeight: "400",
    color: "#999",
  },
});
