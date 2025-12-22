import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import StatusBar from "../components/StatusBar";
import TabBar from "../components/TabBar";
import { useSettings } from "../contexts/SettingsContext";
import { useThemeColors } from "../hooks/useThemeColors";

type SettingItemProps = {
  label: string;
  value?: string;
  isToggle?: boolean;
  isActive?: boolean;
  onToggle?: () => void;
  onPress?: () => void;
};

function SettingItem({
  label,
  value,
  isToggle,
  isActive,
  onToggle,
  onPress,
}: SettingItemProps) {
  const colors = useThemeColors();

  const handlePress = () => {
    if (onToggle) {
      onToggle();
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onPress={handlePress}
      disabled={!isToggle && !onPress}
    >
      <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
      {isToggle ? (
        <Text style={[styles.toggleText, { color: colors.text }]}>
          {isActive ? "[ON]" : "[OFF]"}
        </Text>
      ) : (
        <Text style={[styles.settingValue, { color: colors.text }]}>
          {value}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default function Settings() {
  const {
    theme,
    temperatureUnit,
    windSpeedUnit,
    pushNotifications,
    weatherAlerts,
    setTheme,
    setTemperatureUnit,
    setWindSpeedUnit,
    setPushNotifications,
    setWeatherAlerts,
    getTemperatureSymbol,
    getWindSpeedSymbol,
  } = useSettings();
  const colors = useThemeColors();

  const handleToggleTheme = async () => {
    try {
      await setTheme(theme === "light" ? "dark" : "light");
    } catch (error) {
      console.error("Error toggling theme:", error);
    }
  };

  const handleToggleTemperature = async () => {
    try {
      await setTemperatureUnit(
        temperatureUnit === "metric" ? "imperial" : "metric",
      );
    } catch (error) {
      console.error("Error toggling temperature unit:", error);
    }
  };

  const handleToggleWindSpeed = async () => {
    try {
      await setWindSpeedUnit(windSpeedUnit === "kmh" ? "mph" : "kmh");
    } catch (error) {
      console.error("Error toggling wind speed unit:", error);
    }
  };

  const handleTogglePushNotifications = async () => {
    try {
      await setPushNotifications(!pushNotifications);
    } catch (error) {
      console.error("Error toggling push notifications:", error);
    }
  };

  const handleToggleWeatherAlerts = async () => {
    try {
      await setWeatherAlerts(!weatherAlerts);
    } catch (error) {
      console.error("Error toggling weather alerts:", error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar />

      <View
        style={[
          styles.settingsHeader,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.settingsTitle, { color: colors.text }]}>
          Настройки
        </Text>
      </View>

      <ScrollView style={styles.settingsContent}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          ЕДИНИЦЫ ИЗМЕРЕНИЯ
        </Text>
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SettingItem
            label="Температура"
            value={getTemperatureSymbol()}
            onPress={handleToggleTemperature}
          />
          <SettingItem
            label="Скорость ветра"
            value={getWindSpeedSymbol()}
            onPress={handleToggleWindSpeed}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          УВЕДОМЛЕНИЯ
        </Text>
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SettingItem
            label="Push уведомления"
            isToggle
            isActive={pushNotifications}
            onToggle={handleTogglePushNotifications}
          />
          <SettingItem
            label="Погодные предупреждения"
            isToggle
            isActive={weatherAlerts}
            onToggle={handleToggleWeatherAlerts}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          ВНЕШНИЙ ВИД
        </Text>
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SettingItem
            label="Тёмная тема"
            isToggle
            isActive={theme === "dark"}
            onToggle={handleToggleTheme}
          />
          <SettingItem label="Язык" value="Русский" />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          О ПРИЛОЖЕНИИ
        </Text>
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SettingItem label="Версия" value="1.0.0" />
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
  settingsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  settingsTitle: {
    fontSize: 24,
  },
  settingsContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 20,
    letterSpacing: 1,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 16,
  },
  toggleText: {
    fontSize: 14,
  },
});
