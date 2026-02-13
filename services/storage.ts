import AsyncStorage from "@react-native-async-storage/async-storage";

// Ключи для хранения данных
const STORAGE_KEYS = {
  THEME: "@weather_app:theme",
  TEMPERATURE_UNIT: "@weather_app:temperature_unit",
  WIND_SPEED_UNIT: "@weather_app:wind_speed_unit",
  PUSH_NOTIFICATIONS: "@weather_app:push_notifications",
  WEATHER_ALERTS: "@weather_app:weather_alerts",
  CURRENT_CITY: "@weather_app:current_city",
  RECENT_CITIES: "@weather_app:recent_cities",
};

// Типы данных
export type ThemeType = "light" | "dark";
export type TemperatureUnit = "metric" | "imperial";
export type WindSpeedUnit = "kmh" | "mph";

export interface StorageSettings {
  theme: ThemeType;
  temperatureUnit: TemperatureUnit;
  windSpeedUnit: WindSpeedUnit;
  pushNotifications: boolean;
  weatherAlerts: boolean;
}

export interface CityData {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

/**
 * Сохранить тему приложения
 */
export const saveTheme = async (theme: ThemeType): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (error) {
    console.error("Error saving theme:", error);
    throw new Error("Не удалось сохранить тему");
  }
};

/**
 * Получить сохраненную тему
 */
export const getTheme = async (): Promise<ThemeType> => {
  try {
    const theme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
    return (theme as ThemeType) || "light";
  } catch (error) {
    console.error("Error getting theme:", error);
    return "light";
  }
};

/**
 * Сохранить единицу измерения температуры
 */
export const saveTemperatureUnit = async (
  unit: TemperatureUnit,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TEMPERATURE_UNIT, unit);
  } catch (error) {
    console.error("Error saving temperature unit:", error);
    throw new Error("Не удалось сохранить единицу измерения температуры");
  }
};

/**
 * Получить единицу измерения температуры
 */
export const getTemperatureUnit = async (): Promise<TemperatureUnit> => {
  try {
    const unit = await AsyncStorage.getItem(STORAGE_KEYS.TEMPERATURE_UNIT);
    return (unit as TemperatureUnit) || "metric";
  } catch (error) {
    console.error("Error getting temperature unit:", error);
    return "metric";
  }
};

/**
 * Сохранить единицу измерения скорости ветра
 */
export const saveWindSpeedUnit = async (unit: WindSpeedUnit): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.WIND_SPEED_UNIT, unit);
  } catch (error) {
    console.error("Error saving wind speed unit:", error);
    throw new Error("Не удалось сохранить единицу измерения скорости ветра");
  }
};

/**
 * Получить единицу измерения скорости ветра
 */
export const getWindSpeedUnit = async (): Promise<WindSpeedUnit> => {
  try {
    const unit = await AsyncStorage.getItem(STORAGE_KEYS.WIND_SPEED_UNIT);
    return (unit as WindSpeedUnit) || "kmh";
  } catch (error) {
    console.error("Error getting wind speed unit:", error);
    return "kmh";
  }
};

/**
 * Сохранить настройку push-уведомлений
 */
export const savePushNotifications = async (
  enabled: boolean,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.PUSH_NOTIFICATIONS,
      enabled.toString(),
    );
  } catch (error) {
    console.error("Error saving push notifications:", error);
    throw new Error("Не удалось сохранить настройку уведомлений");
  }
};

/**
 * Получить настройку push-уведомлений
 */
export const getPushNotifications = async (): Promise<boolean> => {
  try {
    const enabled = await AsyncStorage.getItem(STORAGE_KEYS.PUSH_NOTIFICATIONS);
    return enabled === "true";
  } catch (error) {
    console.error("Error getting push notifications:", error);
    return true;
  }
};

/**
 * Сохранить настройку погодных предупреждений
 */
export const saveWeatherAlerts = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.WEATHER_ALERTS, enabled.toString());
  } catch (error) {
    console.error("Error saving weather alerts:", error);
    throw new Error("Не удалось сохранить настройку предупреждений");
  }
};

/**
 * Получить настройку погодных предупреждений
 */
export const getWeatherAlerts = async (): Promise<boolean> => {
  try {
    const enabled = await AsyncStorage.getItem(STORAGE_KEYS.WEATHER_ALERTS);
    return enabled === "true";
  } catch (error) {
    console.error("Error getting weather alerts:", error);
    return true;
  }
};

/**
 * Сохранить все настройки разом
 */
export const saveSettings = async (
  settings: StorageSettings,
): Promise<void> => {
  try {
    await Promise.all([
      saveTheme(settings.theme),
      saveTemperatureUnit(settings.temperatureUnit),
      saveWindSpeedUnit(settings.windSpeedUnit),
      savePushNotifications(settings.pushNotifications),
      saveWeatherAlerts(settings.weatherAlerts),
    ]);
  } catch (error) {
    console.error("Error saving settings:", error);
    throw new Error("Не удалось сохранить настройки");
  }
};

/**
 * Получить все настройки
 */
export const getSettings = async (): Promise<StorageSettings> => {
  try {
    const [
      theme,
      temperatureUnit,
      windSpeedUnit,
      pushNotifications,
      weatherAlerts,
    ] = await Promise.all([
      getTheme(),
      getTemperatureUnit(),
      getWindSpeedUnit(),
      getPushNotifications(),
      getWeatherAlerts(),
    ]);

    return {
      theme,
      temperatureUnit,
      windSpeedUnit,
      pushNotifications,
      weatherAlerts,
    };
  } catch (error) {
    console.error("Error getting settings:", error);
    return {
      theme: "light",
      temperatureUnit: "metric",
      windSpeedUnit: "kmh",
      pushNotifications: true,
      weatherAlerts: true,
    };
  }
};

/**
 * Сохранить текущий город
 */
export const saveCurrentCity = async (city: CityData): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_CITY, JSON.stringify(city));
  } catch (error) {
    console.error("Error saving current city:", error);
    throw new Error("Не удалось сохранить город");
  }
};

/**
 * Получить текущий город
 */
export const getCurrentCity = async (): Promise<CityData | null> => {
  try {
    const city = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_CITY);
    return city ? JSON.parse(city) : null;
  } catch (error) {
    console.error("Error getting current city:", error);
    return null;
  }
};

/**
 * Добавить город в список недавних
 */
export const addRecentCity = async (city: CityData): Promise<void> => {
  try {
    const recent = await getRecentCities();

    // Убрать дубликаты
    const filtered = recent.filter(
      (c) => c.name !== city.name || c.country !== city.country,
    );

    // Добавить в начало списка
    const updated = [city, ...filtered].slice(0, 5); // Храним максимум 5 городов

    await AsyncStorage.setItem(
      STORAGE_KEYS.RECENT_CITIES,
      JSON.stringify(updated),
    );
  } catch (error) {
    console.error("Error adding recent city:", error);
    throw new Error("Не удалось добавить город в список");
  }
};

/**
 * Получить список недавних городов
 */
export const getRecentCities = async (): Promise<CityData[]> => {
  try {
    const cities = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_CITIES);
    return cities ? JSON.parse(cities) : [];
  } catch (error) {
    console.error("Error getting recent cities:", error);
    return [];
  }
};

/**
 * Очистить список недавних городов
 */
export const clearRecentCities = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.RECENT_CITIES);
  } catch (error) {
    console.error("Error clearing recent cities:", error);
    throw new Error("Не удалось очистить список городов");
  }
};

/**
 * Очистить все данные приложения
 */
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error("Error clearing all data:", error);
    throw new Error("Не удалось очистить данные");
  }
};
