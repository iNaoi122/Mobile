import * as WeatherAPI from '../../services/weatherApi';
import { databaseService } from '../../services/database';

// Мокируем fetch для API
const mockFetch = global.fetch as jest.Mock;

describe('API + Database Integration Tests', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await databaseService.init();
  });

  describe('Weather Data Caching Flow', () => {
    it('должен загрузить данные с API и сохранить в БД', async () => {
      const mockWeatherResponse = {
        current: {
          temperature_2m: 20.5,
          apparent_temperature: 18.3,
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

      // Загружаем погоду с API
      const weather = await WeatherAPI.getCurrentWeatherByCoords(47.4979, 19.0402);

      expect(weather.city).toBe('Будапешт');
      expect(weather.temperature).toBe(21);

      // Сохраняем в БД
      await databaseService.saveWeatherData({
        city: weather.city,
        country: weather.country,
        latitude: 47.4979,
        longitude: 19.0402,
        temperature: weather.temperature,
        feelsLike: weather.feelsLike,
        description: weather.description,
        humidity: weather.humidity,
        pressure: weather.pressure,
        windSpeed: weather.windSpeed,
        weatherCode: weather.weatherCode,
        timestamp: Date.now(),
      });

      // Проверяем, что данные сохранены
      const cached = await databaseService.getWeatherData('Будапешт');
      expect(cached).toBeTruthy();
      expect(cached?.city).toBe('Будапешт');
      expect(cached?.temperature).toBe(21);
    });

    it('должен проверить актуальность кэша и загрузить свежие данные если нужно', async () => {
      const cityName = 'Москва';

      // Сохраняем старые данные в БД
      const oldTimestamp = Date.now() - 10 * 60 * 1000; // 10 минут назад
      await databaseService.saveWeatherData({
        city: cityName,
        country: 'Россия',
        latitude: 55.7558,
        longitude: 37.6173,
        temperature: 15,
        feelsLike: 13,
        description: 'Облачно',
        humidity: 70,
        pressure: 1010,
        windSpeed: 8,
        weatherCode: 3,
        timestamp: oldTimestamp,
      });

      // Кэш должен быть невалидным (старше 5 минут)
      const isCacheValid = await databaseService.isCacheValid(cityName);
      expect(isCacheValid).toBe(false);

      // Загружаем свежие данные с API
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
          city: cityName,
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

      const freshWeather = await WeatherAPI.getCurrentWeatherByCoords(
        55.7558,
        37.6173
      );

      // Обновляем кэш
      await databaseService.saveWeatherData({
        city: freshWeather.city,
        country: freshWeather.country,
        latitude: 55.7558,
        longitude: 37.6173,
        temperature: freshWeather.temperature,
        feelsLike: freshWeather.feelsLike,
        description: freshWeather.description,
        humidity: freshWeather.humidity,
        pressure: freshWeather.pressure,
        windSpeed: freshWeather.windSpeed,
        weatherCode: freshWeather.weatherCode,
        timestamp: Date.now(),
      });

      // Проверяем, что кэш обновлен
      const updatedCache = await databaseService.getWeatherData(cityName);
      expect(updatedCache?.temperature).toBe(18);
      expect(updatedCache?.weatherCode).toBe(2);

      // Теперь кэш должен быть валидным
      const isNewCacheValid = await databaseService.isCacheValid(cityName);
      expect(isNewCacheValid).toBe(true);
    });
  });

  describe('Forecast Data Caching Flow', () => {
    it('должен загрузить прогноз с API и сохранить hourly/daily отдельно', async () => {
      const mockForecastResponse = {
        hourly: {
          time: [
            '2024-01-15T12:00',
            '2024-01-15T13:00',
            '2024-01-15T14:00',
          ],
          temperature_2m: [20, 21, 22],
          weather_code: [0, 0, 1],
        },
        daily: {
          time: ['2024-01-15', '2024-01-16', '2024-01-17'],
          temperature_2m_max: [22, 23, 24],
          temperature_2m_min: [15, 16, 17],
          weather_code: [0, 1, 2],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockForecastResponse,
      });

      // Загружаем прогноз с API
      const forecast = await WeatherAPI.getForecastByCoords(47.4979, 19.0402);

      expect(forecast.hourly).toHaveLength(3);
      expect(forecast.daily).toHaveLength(3);

      const cityName = 'Будапешт';

      // Сохраняем hourly прогноз
      await databaseService.saveForecastData(cityName, 'hourly', forecast.hourly);

      // Сохраняем daily прогноз
      await databaseService.saveForecastData(cityName, 'daily', forecast.daily);

      // Проверяем, что данные сохранены
      const cachedHourly = await databaseService.getForecastData(
        cityName,
        'hourly'
      );
      const cachedDaily = await databaseService.getForecastData(cityName, 'daily');

      expect(cachedHourly).toHaveLength(3);
      expect(cachedDaily).toHaveLength(3);
      expect(cachedHourly[0].temperature).toBe(20);
      expect(cachedDaily[0].tempMax).toBe(22);
    });
  });

  describe('City Search and Caching Flow', () => {
    it('должен найти города через API и закэшировать погоду для выбранного', async () => {
      const mockSearchResponse = {
        results: [
          {
            name: 'Москва',
            country: 'Россия',
            latitude: 55.7558,
            longitude: 37.6173,
          },
          {
            name: 'Московский',
            country: 'Россия',
            latitude: 55.6025,
            longitude: 37.3567,
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResponse,
      });

      // Ищем города
      const cities = await WeatherAPI.searchCities('Москва');

      expect(cities).toHaveLength(2);
      expect(cities[0].name).toBe('Москва');

      // Выбираем первый город и загружаем погоду
      const selectedCity = cities[0];

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

      const weather = await WeatherAPI.getCurrentWeatherByCoords(
        selectedCity.lat,
        selectedCity.lon
      );

      // Кэшируем погоду
      await databaseService.saveWeatherData({
        city: weather.city,
        country: weather.country,
        latitude: selectedCity.lat,
        longitude: selectedCity.lon,
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
      expect(cached?.temperature).toBe(15);
    });
  });

  describe('Multiple Cities Caching', () => {
    it('должен закэшировать погоду для нескольких городов и вернуть топ города', async () => {
      const cities = [
        { name: 'Будапешт', lat: 47.4979, lon: 19.0402, temp: 20 },
        { name: 'Москва', lat: 55.7558, lon: 37.6173, temp: 15 },
        { name: 'Лондон', lat: 51.5074, lon: -0.1278, temp: 12 },
      ];

      // Кэшируем погоду для каждого города
      for (const city of cities) {
        await databaseService.saveWeatherData({
          city: city.name,
          country: '',
          latitude: city.lat,
          longitude: city.lon,
          temperature: city.temp,
          feelsLike: city.temp - 2,
          description: 'Ясно',
          humidity: 65,
          pressure: 1013,
          windSpeed: 10,
          weatherCode: 0,
          timestamp: Date.now(),
        });

        // Небольшая задержка между сохранениями
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Получаем топ города
      const topCities = await databaseService.getTopCities(3);

      expect(topCities).toHaveLength(3);
      // Последний добавленный должен быть первым
      expect(topCities[0].city).toBe('Лондон');
      expect(topCities[1].city).toBe('Москва');
      expect(topCities[2].city).toBe('Будапешт');
    });
  });

  describe('Cache Cleanup Flow', () => {
    it('должен очистить старые данные из БД', async () => {
      const oldTimestamp = Date.now() - 8 * 24 * 60 * 60 * 1000; // 8 дней назад
      const recentTimestamp = Date.now() - 1 * 60 * 60 * 1000; // 1 час назад

      // Сохраняем старые данные
      await databaseService.saveWeatherData({
        city: 'Старый Город',
        country: '',
        latitude: 50.0,
        longitude: 30.0,
        temperature: 20,
        feelsLike: 18,
        description: 'Ясно',
        humidity: 65,
        pressure: 1013,
        windSpeed: 10,
        weatherCode: 0,
        timestamp: oldTimestamp,
      });

      // Сохраняем свежие данные
      await databaseService.saveWeatherData({
        city: 'Новый Город',
        country: '',
        latitude: 51.0,
        longitude: 31.0,
        temperature: 22,
        feelsLike: 20,
        description: 'Облачно',
        humidity: 60,
        pressure: 1015,
        windSpeed: 8,
        weatherCode: 2,
        timestamp: recentTimestamp,
      });

      // Проверяем, что оба города в БД
      const allCitiesBefore = await databaseService.getAllCachedCities();
      expect(allCitiesBefore.length).toBeGreaterThanOrEqual(2);

      // Очищаем старые данные
      await databaseService.cleanOldData();

      // Проверяем, что старый город удален
      const oldCity = await databaseService.getWeatherData('Старый Город');
      expect(oldCity).toBeNull();

      // Новый город должен остаться
      const newCity = await databaseService.getWeatherData('Новый Город');
      expect(newCity).toBeTruthy();
      expect(newCity?.temperature).toBe(22);
    });
  });

  describe('Error Recovery Flow', () => {
    it('должен обработать ошибку API и вернуть кэшированные данные', async () => {
      const cityName = 'Будапешт';

      // Сначала кэшируем данные
      await databaseService.saveWeatherData({
        city: cityName,
        country: 'Венгрия',
        latitude: 47.4979,
        longitude: 19.0402,
        temperature: 20,
        feelsLike: 18,
        description: 'Ясно',
        humidity: 65,
        pressure: 1013,
        windSpeed: 10,
        weatherCode: 0,
        timestamp: Date.now() - 10 * 60 * 1000, // 10 минут назад
      });

      // Кэш невалиден, пытаемся загрузить с API
      const isCacheValid = await databaseService.isCacheValid(cityName);
      expect(isCacheValid).toBe(false);

      // API возвращает ошибку
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      // Пытаемся загрузить свежие данные, получаем ошибку
      await expect(
        WeatherAPI.getCurrentWeatherByCoords(47.4979, 19.0402)
      ).rejects.toThrow();

      // Но можем использовать кэшированные данные
      const cachedData = await databaseService.getWeatherData(cityName);
      expect(cachedData).toBeTruthy();
      expect(cachedData?.temperature).toBe(20);
    });
  });

  describe('Data Consistency', () => {
    it('должен обновить существующие данные при повторном сохранении', async () => {
      const cityName = 'Будапешт';

      // Первое сохранение
      await databaseService.saveWeatherData({
        city: cityName,
        country: 'Венгрия',
        latitude: 47.4979,
        longitude: 19.0402,
        temperature: 20,
        feelsLike: 18,
        description: 'Ясно',
        humidity: 65,
        pressure: 1013,
        windSpeed: 10,
        weatherCode: 0,
        timestamp: Date.now(),
      });

      const firstSave = await databaseService.getWeatherData(cityName);
      expect(firstSave?.temperature).toBe(20);

      // Второе сохранение (обновление)
      await databaseService.saveWeatherData({
        city: cityName,
        country: 'Венгрия',
        latitude: 47.4979,
        longitude: 19.0402,
        temperature: 22,
        feelsLike: 20,
        description: 'Переменная облачность',
        humidity: 60,
        pressure: 1015,
        windSpeed: 8,
        weatherCode: 2,
        timestamp: Date.now(),
      });

      const secondSave = await databaseService.getWeatherData(cityName);
      expect(secondSave?.temperature).toBe(22);
      expect(secondSave?.weatherCode).toBe(2);

      // Должна быть только одна запись для города
      const allCities = await databaseService.getAllCachedCities();
      const budapestCount = allCities.filter((c) => c === cityName).length;
      expect(budapestCount).toBe(1);
    });
  });
});
