import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import StatusBar from "../components/StatusBar";
import TabBar from "../components/TabBar";

type SettingItemProps = {
  label: string;
  value?: string;
  isToggle?: boolean;
  isActive?: boolean;
  onToggle?: () => void;
};

function SettingItem({
  label,
  value,
  isToggle,
  isActive,
  onToggle,
}: SettingItemProps) {
  return (
    <View style={styles.settingItem}>
      <Text style={styles.settingLabel}>{label}</Text>
      {isToggle ? (
        <TouchableOpacity onPress={onToggle}>
          <Text style={styles.toggleText}>{isActive ? "[ON]" : "[OFF]"}</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.settingValue}>{value}</Text>
      )}
    </View>
  );
}

export default function Settings() {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weatherAlerts, setWeatherAlerts] = useState(true);
  const [darkTheme, setDarkTheme] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar />

      <View style={styles.settingsHeader}>
        <Text style={styles.settingsTitle}>Настройки</Text>
      </View>

      <ScrollView style={styles.settingsContent}>
        <Text style={styles.sectionTitle}>ЕДИНИЦЫ ИЗМЕРЕНИЯ</Text>
        <View style={styles.section}>
          <SettingItem label="Температура" value="°C" />
          <SettingItem label="Скорость ветра" value="км/ч" />
        </View>

        <Text style={styles.sectionTitle}>УВЕДОМЛЕНИЯ</Text>
        <View style={styles.section}>
          <SettingItem
            label="Push уведомления"
            isToggle
            isActive={pushNotifications}
            onToggle={() => setPushNotifications(!pushNotifications)}
          />
          <SettingItem
            label="Погодные предупреждения"
            isToggle
            isActive={weatherAlerts}
            onToggle={() => setWeatherAlerts(!weatherAlerts)}
          />
        </View>

        <Text style={styles.sectionTitle}>ВНЕШНИЙ ВИД</Text>
        <View style={styles.section}>
          <SettingItem
            label="Тёмная тема"
            isToggle
            isActive={darkTheme}
            onToggle={() => setDarkTheme(!darkTheme)}
          />
          <SettingItem label="Язык" value="Русский" />
        </View>

        <Text style={styles.sectionTitle}>О ПРИЛОЖЕНИИ</Text>
        <View style={styles.section}>
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
    backgroundColor: "#fff",
  },
  settingsHeader: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  settingsTitle: {
    fontSize: 24,
    color: "#000",
  },
  settingsContent: {
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
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#000",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  settingLabel: {
    fontSize: 16,
    color: "#000",
  },
  settingValue: {
    fontSize: 16,
    color: "#000",
  },
  toggleText: {
    fontSize: 14,
    color: "#000",
  },
});
