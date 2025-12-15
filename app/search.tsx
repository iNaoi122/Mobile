import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import StatusBar from "../components/StatusBar";

type CityItemProps = {
  name: string;
  country: string;
  temp: string;
  onPress: () => void;
};

function CityItem({ name, country, temp, onPress }: CityItemProps) {
  return (
    <TouchableOpacity style={styles.cityItem} onPress={onPress}>
      <View style={styles.cityInfo}>
        <Text style={styles.cityName}>{name}</Text>
        <Text style={styles.cityCountry}>{country}</Text>
      </View>
      <Text style={styles.cityTemp}>{temp}°</Text>
    </TouchableOpacity>
  );
}

export default function Search() {
  const router = useRouter();

  const selectCity = (city: string, temp: string) => {
    alert(`Выбран город: ${city}, ${temp}°`);
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar color="#000" />

      <View style={styles.searchHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.backBtnText}>← Назад</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchInputContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск города..."
          placeholderTextColor="#999"
        />
      </View>

      <ScrollView style={styles.searchResults}>
        <Text style={styles.sectionTitle}>НЕДАВНИЕ</Text>
        <CityItem
          name="Будапешт"
          country="Венгрия"
          temp="24"
          onPress={() => selectCity("Будапешт", "24")}
        />
        <CityItem
          name="Париж"
          country="Франция"
          temp="20"
          onPress={() => selectCity("Париж", "20")}
        />

        <Text style={styles.sectionTitle}>ПОПУЛЯРНЫЕ ГОРОДА</Text>
        <CityItem
          name="Лондон"
          country="Великобритания"
          temp="16"
          onPress={() => selectCity("Лондон", "16")}
        />
        <CityItem
          name="Москва"
          country="Россия"
          temp="18"
          onPress={() => selectCity("Москва", "18")}
        />
        <CityItem
          name="Токио"
          country="Япония"
          temp="22"
          onPress={() => selectCity("Токио", "22")}
        />
        <CityItem
          name="Нью-Йорк"
          country="США"
          temp="19"
          onPress={() => selectCity("Нью-Йорк", "19")}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtn: {
    paddingVertical: 8,
  },
  backBtnText: {
    fontSize: 16,
    color: "#667eea",
    fontWeight: "500",
  },
  searchInputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchResults: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: 1,
  },
  cityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  cityCountry: {
    fontSize: 14,
    color: "#999",
  },
  cityTemp: {
    fontSize: 24,
    fontWeight: "300",
    color: "#000",
  },
});
