import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../hooks/useThemeColors";

export default function StatusBar() {
  const colors = useThemeColors();
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Date().toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    return () => {
      clearInterval(timeInterval);
    };
  }, []);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.statusBar, borderBottomColor: colors.border },
      ]}
    >
      <Text style={[styles.text, { color: colors.text }]}>{time}</Text>
      <View style={styles.batteryContainer}>
        <Ionicons
          name="globe-outline"
          size={18}
          color={colors.text}
        />
        <Text style={[styles.text, { color: colors.text, marginLeft: 4 }]}>
          Web
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
