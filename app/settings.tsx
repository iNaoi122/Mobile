import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StatusBar from "../components/StatusBar";
import TabBar from "../components/TabBar";
import WeatherBackground from "../components/WeatherBackground";
import { useSettings } from "../contexts/SettingsContext";
import { useThemeColors } from "../hooks/useThemeColors";

type SettingItemProps = {
  label: string;
  value?: string;
  isToggle?: boolean;
  isActive?: boolean;
  onToggle?: () => void;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
};

function SettingItem({
  label,
  value,
  isToggle,
  isActive,
  onToggle,
  onPress,
  icon,
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
      <View style={styles.settingLeft}>
        {icon && (
          <Ionicons
            name={icon}
            size={22}
            color={colors.text}
            style={{ opacity: 0.7 }}
          />
        )}
        <Text style={[styles.settingLabel, { color: colors.text }]}>
          {label}
        </Text>
      </View>
      <View style={styles.settingRight}>
        {isToggle ? (
          <View
            style={[
              styles.toggle,
              { backgroundColor: isActive ? "#4CAF50" : colors.border },
            ]}
          >
            <View
              style={[
                styles.toggleKnob,
                {
                  backgroundColor: "#FFFFFF",
                  transform: [{ translateX: isActive ? 18 : 2 }],
                },
              ]}
            />
          </View>
        ) : (
          <>
            <Text style={[styles.settingValue, { color: colors.text }]}>
              {value}
            </Text>
            {onPress && (
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.text}
                style={{ opacity: 0.4 }}
              />
            )}
          </>
        )}
      </View>
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
    <WeatherBackground>
      <View style={styles.container}>
        <StatusBar />

        <View
          style={[
            styles.settingsHeader,
            {
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
              icon="thermometer-outline"
              label="Температура"
              value={getTemperatureSymbol()}
              onPress={handleToggleTemperature}
            />
            <SettingItem
              icon="speedometer-outline"
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
              icon="notifications-outline"
              label="Push уведомления"
              isToggle
              isActive={pushNotifications}
              onToggle={handleTogglePushNotifications}
            />
            <SettingItem
              icon="alert-circle-outline"
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
              icon="moon-outline"
              label="Тёмная тема"
              isToggle
              isActive={theme === "dark"}
              onToggle={handleToggleTheme}
            />
            <SettingItem icon="language-outline" label="Язык" value="Русский" />
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
            <SettingItem
              icon="information-circle-outline"
              label="Версия"
              value="1.0.0"
            />
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
    borderRadius: 12,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingValue: {
    fontSize: 15,
    opacity: 0.7,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
