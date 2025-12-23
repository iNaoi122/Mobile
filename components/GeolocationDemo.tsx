/**
 * Демонстрационный компонент для тестирования платформо-специфичной геолокации
 * Показывает текущие координаты, точность и платформу
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as GeoLocation from "../services/geolocation";
import { useThemeColors } from "../hooks/useThemeColors";

export default function GeolocationDemo() {
  const colors = useThemeColors();
  const [location, setLocation] = useState<GeoLocation.GeolocationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await GeoLocation.getCurrentPositionWithPermission();
      setLocation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка получения геолокации");
    } finally {
      setIsLoading(false);
    }
  };

  const getPlatformName = () => {
    switch (Platform.OS) {
      case "android":
        return "Android (Native)";
      case "ios":
        return "iOS (Native)";
      case "web":
        return "Web Browser";
      default:
        return Platform.OS;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.button }]}>
      <View style={styles.header}>
        <Ionicons name="location" size={24} color={colors.text} />
        <Text style={[styles.title, { color: colors.text }]}>
          Тест геолокации
        </Text>
      </View>

      <Text style={[styles.platform, { color: colors.text }]}>
        Платформа: {getPlatformName()}
      </Text>

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: colors.statusBar, borderColor: colors.border },
        ]}
        onPress={handleGetLocation}
        disabled={isLoading}
      >
        <Text style={[styles.buttonText, { color: colors.buttonText }]}>
          {isLoading ? "Получение..." : "Получить координаты"}
        </Text>
      </TouchableOpacity>

      {error && (
        <View style={[styles.errorBox, { backgroundColor: "#ffebee" }]}>
          <Ionicons name="alert-circle" size={20} color="#c62828" />
          <Text style={[styles.errorText, { color: "#c62828" }]}>{error}</Text>
        </View>
      )}

      {location && (
        <View style={[styles.infoBox, { borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.text }]}>Широта:</Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {location.coords.latitude.toFixed(6)}°
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.text }]}>Долгота:</Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {location.coords.longitude.toFixed(6)}°
            </Text>
          </View>

          {location.coords.accuracy && (
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: colors.text }]}>Точность:</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                ±{location.coords.accuracy.toFixed(0)} м
              </Text>
            </View>
          )}

          {location.coords.altitude !== null && location.coords.altitude !== undefined && (
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: colors.text }]}>Высота:</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {location.coords.altitude.toFixed(1)} м
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.text }]}>Время:</Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {new Date(location.timestamp).toLocaleTimeString("ru-RU")}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    margin: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  platform: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  infoBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  value: {
    fontSize: 14,
  },
});
