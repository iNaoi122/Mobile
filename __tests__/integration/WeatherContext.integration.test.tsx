import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { WeatherProvider, useWeather } from '../../contexts/WeatherContext';
import { SettingsProvider } from '../../contexts/SettingsContext';
import * as WeatherAPI from '../../services/weatherApi';
import * as Storage from '../../services/storage';
import { databaseService } from '../../services/database';

// Создаем wrapper с обоими провайдерами
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SettingsProvider>
    <WeatherProvider>{children}</WeatherProvider>
  </SettingsProvider>
);

describe('WeatherContext Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization Flow', () => {
    it('должен инициализировать базу данных, загрузить настройки и погоду', async () => {
      const mockWeatherData = {
        city: 'Будапешт',
        country: 'Венгрия',
        temperature: 20,
        feelsLike: 18,
        description: 'Ясно',
        humidity: 65,
        pressure: 1013,
        windSpeed: 12,
        weatherCode: 0,
        dt: Date.now(),
      };

      const mockForecast = {
        hourly: [
          { time: 'Сейчас', temperature: 20, weatherCode: 0, dt: Date.now() },
        ],
        daily: [
          {
            day: 'Сегодня',
            date: '2024-01-15',
            tempMax: 22,
            tempMin: 15,
            weatherCode: 0,
            dt: Date.now(),
          },
        ],
      };

      // Mock database
      (databaseService.init as jest.Mock) = jest.fn().mockResolvedValue(undefined);
      (databaseService.cleanOldData as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);
      (databaseService.isCacheValid as jest.Mock) = jest
        .fn()
        .mockResolvedValue(false);
      (databaseService.saveWeatherData as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);
      (databaseService.saveForecastData as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);

      // Mock storage
      (Storage.getCurrentCity as jest.Mock) = jest.fn().mockResolvedValue(null);
      (Storage.getRecentCities as jest.Mock) = jest.fn().mockResolvedValue([]);
      (Storage.saveCurrentCity as jest.Mock) = jest.fn().mockResolvedValue(undefined);
      (Storage.getSettings as jest.Mock) = jest.fn().mockResolvedValue({
        theme: 'light',
        temperatureUnit: 'metric',
        windSpeedUnit: 'kmh',
        pushNotifications: true,
        weatherAlerts: true,
      });

      // Mock API
      (WeatherAPI.getCurrentWeatherByCoords as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockWeatherData);
      (WeatherAPI.getForecastByCoords as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockForecast);

      const { result } = renderHook(() => useWeather(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000 }
      );

      // Проверяем, что все сервисы были вызваны в правильном порядке
      expect(databaseService.init).toHaveBeenCalled();
      expect(databaseService.cleanOldData).toHaveBeenCalled();
      expect(Storage.getCurrentCity).toHaveBeenCalled();
      expect(Storage.getRecentCities).toHaveBeenCalled();
      expect(WeatherAPI.getCurrentWeatherByCoords).toHaveBeenCalled();
      expect(WeatherAPI.getForecastByCoords).toHaveBeenCalled();

      // Проверяем, что данные сохранены в БД
      expect(databaseService.saveWeatherData).toHaveBeenCalled();
      expect(databaseService.saveForecastData).toHaveBeenCalledTimes(2); // hourly + daily

      // Проверяем состояние
      expect(result.current.currentWeather).toEqual(mockWeatherData);
      expect(result.current.forecast).toEqual(mockForecast);
      expect(result.current.error).toBeNull();
    });

    it('должен загрузить погоду из кэша если он актуален', async () => {
      const cachedWeather = {
        id: 1,
        city: 'Будапешт',
        country: 'Венгрия',
        latitude: 47.4979,
        longitude: 19.0402,
        temperature: 20,
        feelsLike: 18,
        description: 'Ясно',
        humidity: 65,
        pressure: 1013,
        windSpeed: 12,
        weatherCode: 0,
        timestamp: Date.now(),
      };

      const cachedHourly = [
        { time: 'Сейчас', temperature: 20, weatherCode: 0, dt: Date.now() },
      ];

      const cachedDaily = [
        {
          day: 'Сегодня',
          date: '2024-01-15',
          tempMax: 22,
          tempMin: 15,
          weatherCode: 0,
          dt: Date.now(),
        },
      ];

      // Mock database с актуальным кэшем
      (databaseService.init as jest.Mock) = jest.fn().mockResolvedValue(undefined);
      (databaseService.cleanOldData as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);
      (databaseService.isCacheValid as jest.Mock) = jest.fn().mockResolvedValue(true);
      (databaseService.getWeatherData as jest.Mock) = jest
        .fn()
        .mockResolvedValue(cachedWeather);
      (databaseService.getForecastData as jest.Mock) = jest
        .fn()
        .mockImplementation((city, type) => {
          if (type === 'hourly') return Promise.resolve(cachedHourly);
          if (type === 'daily') return Promise.resolve(cachedDaily);
          return Promise.resolve(null);
        });

      // Mock storage
      (Storage.getCurrentCity as jest.Mock) = jest.fn().mockResolvedValue(null);
      (Storage.getRecentCities as jest.Mock) = jest.fn().mockResolvedValue([]);
      (Storage.saveCurrentCity as jest.Mock) = jest.fn().mockResolvedValue(undefined);
      (Storage.getSettings as jest.Mock) = jest.fn().mockResolvedValue({
        theme: 'light',
        temperatureUnit: 'metric',
        windSpeedUnit: 'kmh',
        pushNotifications: true,
        weatherAlerts: true,
      });

      // Mock API - НЕ должен быть вызван
      (WeatherAPI.getCurrentWeatherByCoords as jest.Mock) = jest.fn();
      (WeatherAPI.getForecastByCoords as jest.Mock) = jest.fn();

      const { result } = renderHook(() => useWeather(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // API НЕ должен быть вызван, используем кэш
      expect(WeatherAPI.getCurrentWeatherByCoords).not.toHaveBeenCalled();
      expect(WeatherAPI.getForecastByCoords).not.toHaveBeenCalled();

      // Данные должны быть загружены из кэша
      expect(result.current.currentWeather?.city).toBe('Будапешт');
      expect(result.current.forecast?.hourly).toEqual(cachedHourly);
      expect(result.current.forecast?.daily).toEqual(cachedDaily);
    });
  });

  describe('City Change Flow', () => {
    it('должен загрузить погоду для нового города, сохранить в БД и storage', async () => {
      const newCity = {
        name: 'Москва',
        country: 'Россия',
        lat: 55.7558,
        lon: 37.6173,
      };

      const mockWeatherData = {
        city: 'Москва',
        country: 'Россия',
        temperature: 15,
        feelsLike: 13,
        description: 'Облачно',
        humidity: 70,
        pressure: 1010,
        windSpeed: 8,
        weatherCode: 3,
        dt: Date.now(),
      };

      const mockForecast = {
        hourly: [
          { time: 'Сейчас', temperature: 15, weatherCode: 3, dt: Date.now() },
        ],
        daily: [
          {
            day: 'Сегодня',
            date: '2024-01-15',
            tempMax: 18,
            tempMin: 12,
            weatherCode: 3,
            dt: Date.now(),
          },
        ],
      };

      // Mock services
      (databaseService.init as jest.Mock) = jest.fn().mockResolvedValue(undefined);
      (databaseService.cleanOldData as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);
      (databaseService.isCacheValid as jest.Mock) = jest
        .fn()
        .mockResolvedValue(false);
      (databaseService.saveWeatherData as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);
      (databaseService.saveForecastData as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);

      (Storage.getCurrentCity as jest.Mock) = jest.fn().mockResolvedValue(null);
      (Storage.getRecentCities as jest.Mock) = jest.fn().mockResolvedValue([]);
      (Storage.saveCurrentCity as jest.Mock) = jest.fn().mockResolvedValue(undefined);
      (Storage.addRecentCity as jest.Mock) = jest.fn().mockResolvedValue(undefined);
      (Storage.getSettings as jest.Mock) = jest.fn().mockResolvedValue({
        theme: 'light',
        temperatureUnit: 'metric',
        windSpeedUnit: 'kmh',
        pushNotifications: true,
        weatherAlerts: true,
      });

      (WeatherAPI.getCurrentWeatherByCoords as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockWeatherData);
      (WeatherAPI.getForecastByCoords as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockForecast);

      const { result } = renderHook(() => useWeather(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Меняем город
      await act(async () => {
        await result.current.setCity(newCity);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Проверяем, что город сохранен
      expect(Storage.saveCurrentCity).toHaveBeenCalledWith(newCity);
      expect(Storage.addRecentCity).toHaveBeenCalledWith(newCity);

      // Проверяем, что погода загружена и сохранена
      expect(WeatherAPI.getCurrentWeatherByCoords).toHaveBeenCalledWith(
        newCity.lat,
        newCity.lon,
        'metric'
      );
      expect(databaseService.saveWeatherData).toHaveBeenCalledWith(
        expect.objectContaining({
          city: 'Москва',
          latitude: newCity.lat,
          longitude: newCity.lon,
        })
      );

      // Проверяем состояние
      expect(result.current.currentCity).toEqual(newCity);
      expect(result.current.currentWeather?.city).toBe('Москва');
    });
  });

  describe('Geolocation Flow', () => {
    it('должен загрузить погоду по координатам и сохранить данные', async () => {
      const lat = 55.7558;
      const lon = 37.6173;

      const mockWeatherData = {
        city: 'Москва',
        country: 'Россия',
        temperature: 15,
        feelsLike: 13,
        description: 'Облачно',
        humidity: 70,
        pressure: 1010,
        windSpeed: 8,
        weatherCode: 3,
        dt: Date.now(),
      };

      const mockForecast = {
        hourly: [
          { time: 'Сейчас', temperature: 15, weatherCode: 3, dt: Date.now() },
        ],
        daily: [
          {
            day: 'Сегодня',
            date: '2024-01-15',
            tempMax: 18,
            tempMin: 12,
            weatherCode: 3,
            dt: Date.now(),
          },
        ],
      };

      // Mock services
      (databaseService.init as jest.Mock) = jest.fn().mockResolvedValue(undefined);
      (databaseService.cleanOldData as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);
      (databaseService.isCacheValid as jest.Mock) = jest
        .fn()
        .mockResolvedValue(false);
      (databaseService.saveWeatherData as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);
      (databaseService.saveForecastData as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);

      (Storage.getCurrentCity as jest.Mock) = jest.fn().mockResolvedValue(null);
      (Storage.getRecentCities as jest.Mock) = jest.fn().mockResolvedValue([]);
      (Storage.saveCurrentCity as jest.Mock) = jest.fn().mockResolvedValue(undefined);
      (Storage.addRecentCity as jest.Mock) = jest.fn().mockResolvedValue(undefined);
      (Storage.getSettings as jest.Mock) = jest.fn().mockResolvedValue({
        theme: 'light',
        temperatureUnit: 'metric',
        windSpeedUnit: 'kmh',
        pushNotifications: true,
        weatherAlerts: true,
      });

      (WeatherAPI.getCurrentWeatherByCoords as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockWeatherData);
      (WeatherAPI.getForecastByCoords as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockForecast);

      const { result } = renderHook(() => useWeather(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Загружаем погоду по координатам
      await act(async () => {
        await result.current.loadWeatherByCoords(lat, lon);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Проверяем, что API вызваны с правильными координатами
      expect(WeatherAPI.getCurrentWeatherByCoords).toHaveBeenCalledWith(
        lat,
        lon,
        'metric'
      );
      expect(WeatherAPI.getForecastByCoords).toHaveBeenCalledWith(lat, lon, 'metric');

      // Проверяем, что данные сохранены
      await waitFor(() => {
        expect(Storage.saveCurrentCity).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Москва',
            lat,
            lon,
          })
        );
      });

      // Проверяем состояние
      expect(result.current.currentWeather?.city).toBe('Москва');
      expect(result.current.currentCity?.lat).toBe(lat);
      expect(result.current.currentCity?.lon).toBe(lon);
    });
  });

  describe('Error Handling', () => {
    it('должен обработать ошибку API и показать сообщение об ошибке', async () => {
      // Mock services
      (databaseService.init as jest.Mock) = jest.fn().mockResolvedValue(undefined);
      (databaseService.cleanOldData as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);
      (databaseService.isCacheValid as jest.Mock) = jest
        .fn()
        .mockResolvedValue(false);

      (Storage.getCurrentCity as jest.Mock) = jest.fn().mockResolvedValue(null);
      (Storage.getRecentCities as jest.Mock) = jest.fn().mockResolvedValue([]);
      (Storage.getSettings as jest.Mock) = jest.fn().mockResolvedValue({
        theme: 'light',
        temperatureUnit: 'metric',
        windSpeedUnit: 'kmh',
        pushNotifications: true,
        weatherAlerts: true,
      });

      // Mock API с ошибкой
      (WeatherAPI.getCurrentWeatherByCoords as jest.Mock) = jest
        .fn()
        .mockRejectedValue(new Error('Network error'));
      (WeatherAPI.getForecastByCoords as jest.Mock) = jest
        .fn()
        .mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useWeather(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Должна быть ошибка
      expect(result.current.error).toBeTruthy();
      expect(result.current.currentWeather).toBeNull();
    });

    it('должен продолжить работу если БД недоступна', async () => {
      const mockWeatherData = {
        city: 'Будапешт',
        country: 'Венгрия',
        temperature: 20,
        feelsLike: 18,
        description: 'Ясно',
        humidity: 65,
        pressure: 1013,
        windSpeed: 12,
        weatherCode: 0,
        dt: Date.now(),
      };

      const mockForecast = {
        hourly: [
          { time: 'Сейчас', temperature: 20, weatherCode: 0, dt: Date.now() },
        ],
        daily: [
          {
            day: 'Сегодня',
            date: '2024-01-15',
            tempMax: 22,
            tempMin: 15,
            weatherCode: 0,
            dt: Date.now(),
          },
        ],
      };

      // Mock БД с ошибкой инициализации
      (databaseService.init as jest.Mock) = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));
      (databaseService.cleanOldData as jest.Mock) = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));
      (databaseService.isCacheValid as jest.Mock) = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));

      (Storage.getCurrentCity as jest.Mock) = jest.fn().mockResolvedValue(null);
      (Storage.getRecentCities as jest.Mock) = jest.fn().mockResolvedValue([]);
      (Storage.saveCurrentCity as jest.Mock) = jest.fn().mockResolvedValue(undefined);
      (Storage.getSettings as jest.Mock) = jest.fn().mockResolvedValue({
        theme: 'light',
        temperatureUnit: 'metric',
        windSpeedUnit: 'kmh',
        pushNotifications: true,
        weatherAlerts: true,
      });

      (WeatherAPI.getCurrentWeatherByCoords as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockWeatherData);
      (WeatherAPI.getForecastByCoords as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockForecast);

      const { result } = renderHook(() => useWeather(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Приложение должно работать даже если БД недоступна
      expect(result.current.currentWeather).toEqual(mockWeatherData);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Refresh Flow', () => {
    it('должен обновить данные и обновить кэш', async () => {
      const initialWeather = {
        city: 'Будапешт',
        country: 'Венгрия',
        temperature: 20,
        feelsLike: 18,
        description: 'Ясно',
        humidity: 65,
        pressure: 1013,
        windSpeed: 12,
        weatherCode: 0,
        dt: Date.now() - 1000,
      };

      const updatedWeather = {
        ...initialWeather,
        temperature: 22,
        feelsLike: 20,
        dt: Date.now(),
      };

      const mockForecast = {
        hourly: [
          { time: 'Сейчас', temperature: 20, weatherCode: 0, dt: Date.now() },
        ],
        daily: [
          {
            day: 'Сегодня',
            date: '2024-01-15',
            tempMax: 22,
            tempMin: 15,
            weatherCode: 0,
            dt: Date.now(),
          },
        ],
      };

      // Mock services
      (databaseService.init as jest.Mock) = jest.fn().mockResolvedValue(undefined);
      (databaseService.cleanOldData as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);
      (databaseService.isCacheValid as jest.Mock) = jest
        .fn()
        .mockResolvedValue(false);
      (databaseService.saveWeatherData as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);
      (databaseService.saveForecastData as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);

      (Storage.getCurrentCity as jest.Mock) = jest.fn().mockResolvedValue(null);
      (Storage.getRecentCities as jest.Mock) = jest.fn().mockResolvedValue([]);
      (Storage.saveCurrentCity as jest.Mock) = jest.fn().mockResolvedValue(undefined);
      (Storage.getSettings as jest.Mock) = jest.fn().mockResolvedValue({
        theme: 'light',
        temperatureUnit: 'metric',
        windSpeedUnit: 'kmh',
        pushNotifications: true,
        weatherAlerts: true,
      });

      (WeatherAPI.getCurrentWeatherByCoords as jest.Mock) = jest
        .fn()
        .mockResolvedValueOnce(initialWeather)
        .mockResolvedValueOnce(updatedWeather);
      (WeatherAPI.getForecastByCoords as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockForecast);

      const { result } = renderHook(() => useWeather(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentWeather?.temperature).toBe(20);

      // Обновляем данные
      await act(async () => {
        await result.current.refreshWeatherData();
      });

      await waitFor(() => {
        expect(result.current.isRefreshing).toBe(false);
      });

      // Проверяем, что данные обновились
      expect(result.current.currentWeather?.temperature).toBe(22);
      expect(databaseService.saveWeatherData).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 22,
        })
      );
    });
  });
});
