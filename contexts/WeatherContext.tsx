import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import * as WeatherAPI from "../services/weatherApi";
import * as Storage from "../services/storage";
import { useSettings } from "./SettingsContext";

interface WeatherContextData {
  // Данные о погоде
  currentWeather: WeatherAPI.WeatherData | null;
  forecast: WeatherAPI.ForecastData | null;
  currentCity: WeatherAPI.CityData | null;
  recentCities: WeatherAPI.CityData[];

  // Состояния загрузки
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Действия
  loadWeatherData: () => Promise<void>;
  refreshWeatherData: () => Promise<void>;
  setCity: (city: WeatherAPI.CityData) => Promise<void>;
  loadWeatherByCoords: (lat: number, lon: number) => Promise<void>;

  // Утилиты
  lastUpdateTime: number | null;
}

const WeatherContext = createContext<WeatherContextData | undefined>(undefined);

interface WeatherProviderProps {
  children: ReactNode;
}

const UPDATE_INTERVAL = 300000; // 5 минут
const DEFAULT_CITY: WeatherAPI.CityData = {
  name: "Будапешт",
  country: "Венгрия",
  lat: 47.4979,
  lon: 19.0402,
};

export const WeatherProvider: React.FC<WeatherProviderProps> = ({
  children,
}) => {
  const { temperatureUnit } = useSettings();

  const [currentWeather, setCurrentWeather] =
    useState<WeatherAPI.WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherAPI.ForecastData | null>(
    null,
  );
  const [currentCity, setCurrentCityState] =
    useState<WeatherAPI.CityData | null>(null);
  const [recentCities, setRecentCities] = useState<WeatherAPI.CityData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);

  // Загрузка данных при монтировании
  useEffect(() => {
    initializeWeatherData();
  }, []);

  // Автообновление каждые 5 минут
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentCity) {
        refreshWeatherData();
      }
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [currentCity, temperatureUnit]);

  // Перезагрузка при изменении единиц измерения
  useEffect(() => {
    if (currentCity && !isLoading) {
      refreshWeatherData();
    }
  }, [temperatureUnit]);

  /**
   * Инициализация данных при запуске приложения
   */
  const initializeWeatherData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Загрузить текущий город из хранилища
      const savedCity = await Storage.getCurrentCity();

      // Загрузить недавние города
      const recent = await Storage.getRecentCities();
      setRecentCities(recent);

      const cityToLoad = savedCity || DEFAULT_CITY;
      setCurrentCityState(cityToLoad);
      await loadWeatherForCity(cityToLoad);

      if (!savedCity) {
        await Storage.saveCurrentCity(DEFAULT_CITY);
      }
    } catch (err) {
      console.error("Error initializing weather data:", err);
      setError("Не удалось загрузить данные");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Загрузить погоду для города
   */
  const loadWeatherForCity = async (city: WeatherAPI.CityData) => {
    try {
      const units = temperatureUnit === "metric" ? "metric" : "imperial";

      // Загрузить текущую погоду и прогноз параллельно
      const [weather, forecastData] = await Promise.all([
        WeatherAPI.getCurrentWeatherByCoords(city.lat, city.lon, units),
        WeatherAPI.getForecastByCoords(city.lat, city.lon, units),
      ]);

      // Обновить состояние немедленно
      setCurrentWeather(weather);
      setForecast(forecastData);
      setLastUpdateTime(Date.now());
      setError(null);
    } catch (err) {
      console.error("Error loading weather for city:", err);
      throw err;
    }
  };

  /**
   * Загрузить данные о погоде
   */
  const loadWeatherData = async () => {
    if (!currentCity) return;

    try {
      setIsLoading(true);
      setError(null);
      await loadWeatherForCity(currentCity);
    } catch (err) {
      console.error("Error loading weather data:", err);
      setError("Не удалось загрузить данные о погоде");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Обновить данные о погоде
   */
  const refreshWeatherData = async () => {
    if (!currentCity) return;

    try {
      setIsRefreshing(true);
      setError(null);
      await loadWeatherForCity(currentCity);
    } catch (err) {
      console.error("Error refreshing weather data:", err);
      setError("Не удалось обновить данные");
    } finally {
      setIsRefreshing(false);
    }
  };

  /**
   * Установить новый город
   */
  const setCity = async (city: WeatherAPI.CityData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Сохранить город
      setCurrentCityState(city);
      await Storage.saveCurrentCity(city);

      // Добавить в список недавних
      await Storage.addRecentCity(city);
      const recent = await Storage.getRecentCities();
      setRecentCities(recent);

      // Загрузить погоду для нового города
      await loadWeatherForCity(city);
    } catch (err) {
      console.error("Error setting city:", err);
      setError("Не удалось загрузить погоду для выбранного города");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Загрузить погоду по координатам (геолокация)
   */
  const loadWeatherByCoords = async (lat: number, lon: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const units = temperatureUnit === "metric" ? "metric" : "imperial";

      // Загрузить погоду по координатам
      const weather = await WeatherAPI.getCurrentWeatherByCoords(
        lat,
        lon,
        units,
      );
      const forecastData = await WeatherAPI.getForecastByCoords(
        lat,
        lon,
        units,
      );

      // Создать объект города
      const city: WeatherAPI.CityData = {
        name: weather.city,
        country: weather.country,
        lat,
        lon,
      };

      // Обновить состояние немедленно
      setCurrentWeather(weather);
      setForecast(forecastData);
      setCurrentCityState(city);
      setLastUpdateTime(Date.now());
      setError(null);

      // Сохранить
      await Storage.saveCurrentCity(city);
      await Storage.addRecentCity(city);

      // Обновить список недавних городов
      const recent = await Storage.getRecentCities();
      setRecentCities(recent);
    } catch (err) {
      console.error("Error loading weather by coords:", err);
      setError("Не удалось определить местоположение");
    } finally {
      setIsLoading(false);
    }
  };

  const value: WeatherContextData = {
    currentWeather,
    forecast,
    currentCity,
    recentCities,
    isLoading,
    isRefreshing,
    error,
    loadWeatherData,
    refreshWeatherData,
    setCity,
    loadWeatherByCoords,
    lastUpdateTime,
  };

  return (
    <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>
  );
};

export const useWeather = (): WeatherContextData => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error("useWeather must be used within WeatherProvider");
  }
  return context;
};
