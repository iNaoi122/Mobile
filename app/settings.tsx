import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
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
        <TouchableOpacity
          style={[styles.toggle, isActive && styles.toggleActive]}
          onPress={onToggle}
        >
          <View
            style={[
              styles.toggleThumb,
              isActive && styles.toggleThumbActive,
            ]}
          />
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
      <StatusBar color="#000" />

      <View style={styles.settingsHeader}>
        <Text style={styles.settingsTitle}>Настройки</Text>
      </View>

      <ScrollView style={styles.settingsContent}>
        <Text style={styles.sectionTitle}>ЕДИНИЦЫ ИЗМЕРЕНИЯ</Text>
        <SettingItem label="Температура" value="°C" />
        <SettingItem label="Скорость ветра" value="км/ч" />

        <Text style={styles.sectionTitle}>УВЕДОМЛЕНИЯ</Text>
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

        <Text style={styles.sectionTitle}>ВНЕШНИЙ ВИД</Text>
        <SettingItem
          label="Тёмная тема"
          isToggle
          isActive={darkTheme}
          onToggle={() => setDarkTheme(!darkTheme)}
        />
        <SettingItem label="Язык" value="Русский" />

        <Text style={styles.sectionTitle}>О ПРИЛОЖЕНИИ</Text>
        <SettingItem label="Версия" value="1.0.0" />
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingsTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#000",
  },
  settingsContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    marginTop: 30,
    marginBottom: 15,
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingLabel: {
    fontSize: 16,
    color: "#000",
  },
  settingValue: {
    fontSize: 16,
    color: "#999",
  },
  toggle: {
    width: 51,
    height: 31,
    borderRadius: 16,
    backgroundColor: "#e0e0e0",
    padding: 2,
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: "#667eea",
  },
  toggleThumb: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
});
