import * as Location from 'expo-location';
import * as WeatherAPI from '../../services/weatherApi';
import { databaseService } from '../../services/database';
import * as Geolocation from '../../services/geolocation';

// Mock fetch для API
const mockFetch = global.fetch as jest.Mock;
const mockLocation = Location as jest.Mocked<typeof Location>;

describe('Geolocation + Weather Integration Tests', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await databaseService.init();
  });

  describe('Complete Geolocation Flow', () => {
    it('должен получить координаты и загрузить погоду для текущего местоположения', async () => {
      // Mock геолокации
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      mockLocation.getForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      const mockLocationData = {
        coords: {
          latitude: 55.7558,
          longitude: 37.6173,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };

      mockLocation.getCurrentPositionAsync.mockResolvedValueOnce(
        mockLocationData as any
      );

      // Получаем текущую позицию
      const position = await Geolocation.getCurrentPositionWithPermission();

      expect(position.coords.latitude).toBe(55.7558);
      expect(position.coords.longitude).toBe(37.6173);

      // Mock погоды для этих координат
      const mockWeatherResponse = {
        current: {
          temperature_2m: 15.0,
          apparent_temperature: 13.0,
          relative_humidity_2m: 70,
          pressure_msl: 1010,
          wind_speed_10m: 8,
          weather_code: 3,
        },
      };

      const mockCityResponse = {
        address: {
          city: 'Москва',
          country: 'Россия',
        },
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockWeatherResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCityResponse,
        });

      // Загружаем погоду по координатам
      const weather = await WeatherAPI.getCurrentWeatherByCoords(
        position.coords.latitude,
        position.coords.longitude
      );

      expect(weather.city).toBe('Москва');
      expect(weather.temperature).toBe(15);

      // Сохраняем в БД
      await databaseService.saveWeatherData({
        city: weather.city,
        country: weather.country,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        temperature: weather.temperature,
        feelsLike: weather.feelsLike,
        description: weather.description,
        humidity: weather.humidity,
        pressure: weather.pressure,
        windSpeed: weather.windSpeed,
        weatherCode: weather.weatherCode,
        timestamp: Date.now(),
      });

      // Проверяем кэш
      const cached = await databaseService.getWeatherData('Москва');
      expect(cached).toBeTruthy();
      expect(cached?.latitude).toBe(55.7558);
      expect(cached?.longitude).toBe(37.6173);
    });

    it('должен обработать отсутствие разрешения на геолокацию', async () => {
      // Пользователь отклонил разрешение
      mockLocation.getForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'denied',
        granted: false,
        canAskAgain: false,
        expires: 'never',
      } as any);

      mockLocation.requestForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'denied',
        granted: false,
        canAskAgain: false,
        expires: 'never',
      } as any);

      // Попытка получить позицию должна выбросить ошибку
      await expect(
        Geolocation.getCurrentPositionWithPermission()
      ).rejects.toThrow('Разрешение на доступ к геолокации не предоставлено');

      // Можем использовать город по умолчанию
      const defaultCity = {
        name: 'Будапешт',
        lat: 47.4979,
        lon: 19.0402,
      };

      const mockWeatherResponse = {
        current: {
          temperature_2m: 20.0,
          apparent_temperature: 18.0,
          relative_humidity_2m: 65,
          pressure_msl: 1013,
          wind_speed_10m: 12,
          weather_code: 0,
        },
      };

      const mockCityResponse = {
        address: {
          city: 'Будапешт',
          country: 'Венгрия',
        },
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockWeatherResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCityResponse,
        });

      const weather = await WeatherAPI.getCurrentWeatherByCoords(
        defaultCity.lat,
        defaultCity.lon
      );

      expect(weather.city).toBe('Будапешт');
    });
  });

  describe('Location Updates and Weather Refresh', () => {
    it('должен отслеживать изменения местоположения и обновлять погоду', async () => {
      mockLocation.getForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      const locations = [
        { latitude: 47.4979, longitude: 19.0402, city: 'Будапешт' }, // Будапешт
        { latitude: 47.5, longitude: 19.1, city: 'Будапешт' }, // Около Будапешта
        { latitude: 55.7558, longitude: 37.6173, city: 'Москва' }, // Москва
      ];

      let currentLocationIndex = 0;
      let locationCallback: any;

      const mockSubscription = {
        remove: jest.fn(),
      };

      mockLocation.watchPositionAsync.mockImplementationOnce(
        async (options, callback) => {
          locationCallback = callback;
          return mockSubscription as any;
        }
      );

      // Начинаем отслеживание
      const unsubscribe = await Geolocation.watchPosition((position) => {
        // Callback будет вызван при изменении позиции
      });

      // Симулируем несколько обновлений позиции
      for (const location of locations) {
        // Mock погоды для текущей локации
        const mockWeatherResponse = {
          current: {
            temperature_2m: 20.0 + currentLocationIndex,
            apparent_temperature: 18.0,
            relative_humidity_2m: 65,
            pressure_msl: 1013,
            wind_speed_10m: 12,
            weather_code: 0,
          },
        };

        const mockCityResponse = {
          address: {
            city: location.city,
            country: location.city === 'Москва' ? 'Россия' : 'Венгрия',
          },
        };

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => mockWeatherResponse,
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => mockCityResponse,
          });

        // Симулируем обновление позиции
        locationCallback({
          coords: {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: 5,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        });

        // Загружаем погоду для новой позиции
        const weather = await WeatherAPI.getCurrentWeatherByCoords(
          location.latitude,
          location.longitude
        );

        expect(weather.city).toBe(location.city);
        expect(weather.temperature).toBe(20 + currentLocationIndex);

        currentLocationIndex++;
      }

      // Останавливаем отслеживание
      unsubscribe();
      expect(mockSubscription.remove).toHaveBeenCalled();
    });
  });

  describe('Reverse Geocoding Integration', () => {
    it('должен определить город по координатам используя Nominatim', async () => {
      const lat = 51.5074;
      const lon = -0.1278;

      // Mock Nominatim API
      const mockNominatimResponse = {
        address: {
          city: 'Лондон',
          country: 'Великобритания',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockNominatimResponse,
      });

      // Получаем название города
      const cityInfo = await WeatherAPI.getCityNameByCoords(lat, lon);

      expect(cityInfo.name).toBe('Лондон');
      expect(cityInfo.country).toBe('Великобритания');

      // Проверяем, что Nominatim был вызван
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('nominatim.openstreetmap.org'),
        expect.any(Object)
      );
    });

    it('должен использовать fallback если Nominatim недоступен', async () => {
      const lat = 47.5;
      const lon = 19.0;

      // Mock Nominatim возвращает ошибку
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
      });

      // Получаем название города (должен использовать fallback)
      const cityInfo = await WeatherAPI.getCityNameByCoords(lat, lon);

      // Должен найти ближайший город из списка популярных
      expect(cityInfo.name).toBeTruthy();
      // Для координат 47.5, 19.0 ближайший город - Будапешт (47.4979, 19.0402)
      expect(cityInfo.name).toBe('Будапешт');
    });

    it('должен вернуть координаты если город слишком далеко', async () => {
      const lat = 0.0;
      const lon = 0.0; // Посреди океана

      // Mock Nominatim возвращает ошибку
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const cityInfo = await WeatherAPI.getCityNameByCoords(lat, lon);

      // Должен вернуть координаты в формате строки
      expect(cityInfo.name).toMatch(/0\.\d{4}, 0\.\d{4}/);
      expect(cityInfo.country).toBe('');
    });
  });

  describe('Geolocation + Forecast Integration', () => {
    it('должен загрузить текущую погоду и прогноз для геолокации', async () => {
      // Mock геолокации
      mockLocation.getForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      const mockLocationData = {
        coords: {
          latitude: 48.8566,
          longitude: 2.3522,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };

      mockLocation.getCurrentPositionAsync.mockResolvedValueOnce(
        mockLocationData as any
      );

      const position = await Geolocation.getCurrentPosition();

      // Mock погоды
      const mockWeatherResponse = {
        current: {
          temperature_2m: 18.0,
          apparent_temperature: 16.0,
          relative_humidity_2m: 68,
          pressure_msl: 1012,
          wind_speed_10m: 10,
          weather_code: 2,
        },
      };

      const mockCityResponse = {
        address: {
          city: 'Париж',
          country: 'Франция',
        },
      };

      const mockForecastResponse = {
        hourly: {
          time: ['2024-01-15T12:00', '2024-01-15T13:00'],
          temperature_2m: [18, 19],
          weather_code: [2, 1],
        },
        daily: {
          time: ['2024-01-15', '2024-01-16'],
          temperature_2m_max: [20, 21],
          temperature_2m_min: [15, 16],
          weather_code: [2, 1],
        },
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockWeatherResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCityResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockForecastResponse,
        });

      // Загружаем погоду и прогноз
      const [weather, forecast] = await Promise.all([
        WeatherAPI.getCurrentWeatherByCoords(
          position.coords.latitude,
          position.coords.longitude
        ),
        WeatherAPI.getForecastByCoords(
          position.coords.latitude,
          position.coords.longitude
        ),
      ]);

      expect(weather.city).toBe('Париж');
      expect(forecast.hourly).toHaveLength(2);
      expect(forecast.daily).toHaveLength(2);

      // Сохраняем в БД
      await databaseService.saveWeatherData({
        city: weather.city,
        country: weather.country,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        temperature: weather.temperature,
        feelsLike: weather.feelsLike,
        description: weather.description,
        humidity: weather.humidity,
        pressure: weather.pressure,
        windSpeed: weather.windSpeed,
        weatherCode: weather.weatherCode,
        timestamp: Date.now(),
      });

      await databaseService.saveForecastData(weather.city, 'hourly', forecast.hourly);
      await databaseService.saveForecastData(weather.city, 'daily', forecast.daily);

      // Проверяем кэш
      const cachedWeather = await databaseService.getWeatherData('Париж');
      const cachedHourly = await databaseService.getForecastData('Париж', 'hourly');
      const cachedDaily = await databaseService.getForecastData('Париж', 'daily');

      expect(cachedWeather).toBeTruthy();
      expect(cachedHourly).toHaveLength(2);
      expect(cachedDaily).toHaveLength(2);
    });
  });

  describe('Error Handling in Geolocation Flow', () => {
    it('должен обработать ошибку геолокации и использовать последний известный город', async () => {
      // Сначала успешно получаем местоположение и кэшируем
      mockLocation.getForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      mockLocation.getCurrentPositionAsync.mockResolvedValueOnce({
        coords: {
          latitude: 47.4979,
          longitude: 19.0402,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as any);

      const firstPosition = await Geolocation.getCurrentPosition();

      // Mock погоды и кэширование
      const mockWeatherResponse = {
        current: {
          temperature_2m: 20.0,
          apparent_temperature: 18.0,
          relative_humidity_2m: 65,
          pressure_msl: 1013,
          wind_speed_10m: 12,
          weather_code: 0,
        },
      };

      const mockCityResponse = {
        address: {
          city: 'Будапешт',
          country: 'Венгрия',
        },
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockWeatherResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCityResponse,
        });

      const weather = await WeatherAPI.getCurrentWeatherByCoords(
        firstPosition.coords.latitude,
        firstPosition.coords.longitude
      );

      await databaseService.saveWeatherData({
        city: weather.city,
        country: weather.country,
        latitude: firstPosition.coords.latitude,
        longitude: firstPosition.coords.longitude,
        temperature: weather.temperature,
        feelsLike: weather.feelsLike,
        description: weather.description,
        humidity: weather.humidity,
        pressure: weather.pressure,
        windSpeed: weather.windSpeed,
        weatherCode: weather.weatherCode,
        timestamp: Date.now(),
      });

      // Теперь геолокация недоступна
      mockLocation.getCurrentPositionAsync.mockRejectedValueOnce(
        new Error('Location unavailable')
      );

      await expect(Geolocation.getCurrentPosition()).rejects.toThrow();

      // Но можем использовать кэшированные данные
      const cachedData = await databaseService.getWeatherData('Будапешт');
      expect(cachedData).toBeTruthy();
      expect(cachedData?.temperature).toBe(20);
    });

    it('должен обработать ошибку API погоды после успешной геолокации', async () => {
      // Геолокация успешна
      mockLocation.getForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      mockLocation.getCurrentPositionAsync.mockResolvedValueOnce({
        coords: {
          latitude: 55.7558,
          longitude: 37.6173,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as any);

      const position = await Geolocation.getCurrentPosition();

      expect(position.coords.latitude).toBe(55.7558);

      // API погоды недоступен
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(
        WeatherAPI.getCurrentWeatherByCoords(
          position.coords.latitude,
          position.coords.longitude
        )
      ).rejects.toThrow();

      // В этом случае можно показать сообщение об ошибке пользователю
      // но координаты у нас есть
      expect(position.coords.latitude).toBe(55.7558);
      expect(position.coords.longitude).toBe(37.6173);
    });
  });

  describe('Accuracy and Distance Calculation', () => {
    it('должен использовать высокую точность для геолокации', async () => {
      mockLocation.getForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      mockLocation.getCurrentPositionAsync.mockResolvedValueOnce({
        coords: {
          latitude: 47.4979,
          longitude: 19.0402,
          accuracy: 3, // Высокая точность
          altitude: 100,
          altitudeAccuracy: 2,
          heading: 90,
          speed: 5,
        },
        timestamp: Date.now(),
      } as any);

      const position = await Geolocation.getCurrentPosition();

      // Проверяем параметры вызова
      expect(mockLocation.getCurrentPositionAsync).toHaveBeenCalledWith({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      expect(position.coords.accuracy).toBe(3);
      expect(position.coords.altitude).toBe(100);
    });
  });
});
