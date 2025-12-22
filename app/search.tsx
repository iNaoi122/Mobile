import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import StatusBar from "../components/StatusBar";
import { useWeather } from "../contexts/WeatherContext";
import { searchCities, CityData, POPULAR_CITIES } from "../services/weatherApi";
import { useThemeColors } from "../hooks/useThemeColors";

type CityItemProps = {
  name: string;
  country: string;
  onPress: () => void;
};

function CityItem({ name, country, onPress }: CityItemProps) {
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      style={[styles.cityItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
    >
      <View style={styles.cityInfo}>
        <Text style={[styles.cityName, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.cityCountry, { color: colors.text }]}>
          {country}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function Search() {
  const router = useRouter();
  const { setCity, recentCities } = useWeather();
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CityData[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchCities(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching cities:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCitySelect = async (city: CityData) => {
    try {
      await setCity(city);
      router.back();
    } catch (error) {
      console.error("Error selecting city:", error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar />

      <View style={[styles.searchHeader, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.backBtn,
            { borderColor: colors.border, backgroundColor: colors.button },
          ]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backBtnText, { color: colors.buttonText }]}>
            ← Назад
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchInputContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: colors.input,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="Поиск города..."
          placeholderTextColor={colors.inputPlaceholder}
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="words"
          autoCorrect={false}
        />
      </View>

      <ScrollView style={styles.searchResults}>
        {isSearching && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.loader} />
            <Text style={[styles.loadingText, { color: colors.text }]}>
              Поиск...
            </Text>
          </View>
        )}

        {!isSearching &&
          searchQuery.length >= 2 &&
          searchResults.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                РЕЗУЛЬТАТЫ ПОИСКА
              </Text>
              {searchResults.map((city, index) => (
                <CityItem
                  key={`search-${index}`}
                  name={city.name}
                  country={city.country}
                  onPress={() => handleCitySelect(city)}
                />
              ))}
            </>
          )}

        {!isSearching &&
          searchQuery.length >= 2 &&
          searchResults.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.text }]}>
                Города не найдены
              </Text>
            </View>
          )}

        {!searchQuery && recentCities.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              НЕДАВНИЕ
            </Text>
            {recentCities.map((city, index) => (
              <CityItem
                key={`recent-${index}`}
                name={city.name}
                country={city.country}
                onPress={() => handleCitySelect(city)}
              />
            ))}
          </>
        )}

        {!searchQuery && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              ПОПУЛЯРНЫЕ ГОРОДА
            </Text>
            {POPULAR_CITIES.map((city, index) => (
              <CityItem
                key={`popular-${index}`}
                name={city.name}
                country={city.country}
                onPress={() => handleCitySelect(city)}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backBtn: {
    paddingVertical: 8,
    borderWidth: 1,
    paddingHorizontal: 15,
    alignSelf: "flex-start",
  },
  backBtnText: {
    fontSize: 14,
  },
  searchInputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchInput: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  searchResults: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
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
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 16,
    marginBottom: 4,
  },
  cityCountry: {
    fontSize: 14,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
  },
});
