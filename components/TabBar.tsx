import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";

type TabItem = {
  icon: string;
  label: string;
  path: string;
};

const tabs: TabItem[] = [
  { icon: "🏠", label: "Главная", path: "/" },
  { icon: "📊", label: "Прогноз", path: "/forecast" },
  { icon: "⚙️", label: "Настройки", path: "/settings" },
];

export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <TouchableOpacity
            key={tab.path}
            style={styles.tabItem}
            onPress={() => router.push(tab.path as any)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                isActive && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    flex: 1,
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    color: "#999",
  },
  tabLabelActive: {
    color: "#667eea",
    fontWeight: "600",
  },
});
