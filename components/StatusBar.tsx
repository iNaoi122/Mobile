import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../hooks/useThemeColors";

// Условный импорт Battery только для нативных платформ
let Battery: any = null;
if (Platform.OS !== "web") {
  Battery = require("expo-battery");
}

export default function StatusBar() {
  const colors = useThemeColors();
  const [time, setTime] = useState("");
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [batteryState, setBatteryState] = useState<number>(
    Platform.OS === "web" ? 0 : Battery?.BatteryState?.UNKNOWN || 0,
  );

  useEffect(() => {
    // Обновление времени каждую секунду
    const updateTime = () => {
      setTime(
        new Date().toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    // Получение уровня заряда батареи (только для нативных платформ)
    let batteryLevelSubscription: any;
    let batteryStateSubscription: any;

    const getBatteryInfo = async () => {
      if (Platform.OS === "web") {
        // На веб-платформе батарея недоступна
        setBatteryLevel(null);
        return;
      }

      try {
        const level = await Battery.getBatteryLevelAsync();
        const state = await Battery.getBatteryStateAsync();
        setBatteryLevel(Math.round(level * 100));
        setBatteryState(state);
      } catch (error) {
        console.error("Ошибка получения данных батареи:", error);
      }
    };

    getBatteryInfo();

    // Подписка на изменения уровня батареи (только для нативных платформ)
    if (Platform.OS !== "web") {
      batteryLevelSubscription = Battery.addBatteryLevelListener(
        ({ batteryLevel }: any) => {
          setBatteryLevel(Math.round(batteryLevel * 100));
        },
      );

      batteryStateSubscription = Battery.addBatteryStateListener(
        ({ batteryState }: any) => {
          setBatteryState(batteryState);
        },
      );
    }

    return () => {
      clearInterval(timeInterval);
      if (batteryLevelSubscription) {
        batteryLevelSubscription.remove();
      }
      if (batteryStateSubscription) {
        batteryStateSubscription.remove();
      }
    };
  }, []);

  const getBatteryIcon = () => {
    if (batteryLevel === null) return "battery-half";

    // Проверка состояния зарядки (только для нативных платформ)
    if (
      Platform.OS !== "web" &&
      Battery &&
      batteryState === Battery.BatteryState.CHARGING
    ) {
      return "battery-charging";
    }

    if (batteryLevel >= 90) return "battery-full";
    if (batteryLevel >= 60) return "battery-half";
    if (batteryLevel >= 30) return "battery-half";
    return "battery-dead";
  };

  const getBatteryColor = () => {
    // Проверка состояния зарядки (только для нативных платформ)
    if (
      Platform.OS !== "web" &&
      Battery &&
      batteryState === Battery.BatteryState.CHARGING
    ) {
      return "#4CAF50"; // Зеленый при зарядке
    }

    if (batteryLevel === null) return colors.text;
    if (batteryLevel >= 30) return colors.text;
    if (batteryLevel >= 15) return "#FF9800"; // Оранжевый
    return "#F44336"; // Красный
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.statusBar, borderBottomColor: colors.border },
      ]}
    >
      <Text style={[styles.text, { color: colors.text }]}>{time}</Text>
      <View style={styles.batteryContainer}>
        <Ionicons name={getBatteryIcon()} size={18} color={getBatteryColor()} />
        <Text style={[styles.text, { color: colors.text, marginLeft: 4 }]}>
          {batteryLevel !== null ? `${batteryLevel}%` : "—"}
        </Text>
      </View>
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
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
  },
  batteryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
