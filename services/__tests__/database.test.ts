import { Platform } from 'react-native';
import { databaseService, CachedWeatherData } from '../database';

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

// Mock expo-sqlite
const mockDb = {
  execAsync: jest.fn(() => Promise.resolve()),
  runAsync: jest.fn(() => Promise.resolve({ lastInsertRowId: 1, changes: 1 })),
  getFirstAsync: jest.fn(() => Promise.resolve(null)),
  getAllAsync: jest.fn(() => Promise.resolve([])),
};

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve(mockDb)),
}));

describe('DatabaseService', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    // Инициализируем базу данных перед каждым тестом
    await databaseService.init();
  });

  describe('init', () => {
    it('должен успешно инициализировать базу данных на нативных платформах', async () => {
      const SQLite = require('expo-sqlite');
      expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith('weather.db');
      expect(mockDb.execAsync).toHaveBeenCalled();
    });

    it('должен пропустить инициализацию на веб-платформе', async () => {
      // Изменяем Platform.OS на web
      (Platform as any).OS = 'web';

      const SQLite = require('expo-sqlite');
      SQLite.openDatabaseAsync.mockClear();
      mockDb.execAsync.mockClear();

      await databaseService.init();

      expect(SQLite.openDatabaseAsync).not.toHaveBeenCalled();

      // Возвращаем обратно на ios
      (Platform as any).OS = 'ios';
    });

    it('должен создать необходимые таблицы', async () => {
      expect(mockDb.execAsync).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS weather_cache')
      );
      expect(mockDb.execAsync).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS forecast_cache')
      );
    });

    it('должен создать индексы для оптимизации', async () => {
      expect(mockDb.execAsync).toHaveBeenCalledWith(
        expect.stringContaining('CREATE INDEX IF NOT EXISTS')
      );
    });
  });

  describe('saveWeatherData', () => {
    it('должен успешно сохранить данные о погоде', async () => {
      const weatherData: CachedWeatherData = {
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

      await databaseService.saveWeatherData(weatherData);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO weather_cache'),
        [
          'Будапешт',
          'Венгрия',
          47.4979,
          19.0402,
          20,
          18,
          'Ясно',
          65,
          1013,
          12,
          0,
          weatherData.timestamp,
        ]
      );
    });

    it('должен обновить существующие данные для города', async () => {
      const weatherData: CachedWeatherData = {
        city: 'Москва',
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
        timestamp: Date.now(),
      };

      await databaseService.saveWeatherData(weatherData);

      // INSERT OR REPLACE должен заменить существующую запись
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE'),
        expect.any(Array)
      );
    });

    it('должен выбросить ошибку при неудачном сохранении', async () => {
      mockDb.runAsync.mockRejectedValueOnce(new Error('Database error'));

      const weatherData: CachedWeatherData = {
        city: 'Тест',
        country: 'Тест',
        latitude: 0,
        longitude: 0,
        temperature: 0,
        feelsLike: 0,
        description: 'Тест',
        humidity: 0,
        pressure: 0,
        windSpeed: 0,
        weatherCode: 0,
        timestamp: Date.now(),
      };

      await expect(
        databaseService.saveWeatherData(weatherData)
      ).rejects.toThrow('Database error');
    });
  });

  describe('getWeatherData', () => {
    it('должен успешно получить данные о погоде по городу', async () => {
      const mockWeatherData = {
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

      mockDb.getFirstAsync.mockResolvedValueOnce(mockWeatherData);

      const result = await databaseService.getWeatherData('Будапешт');

      expect(result).toEqual(mockWeatherData);
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM weather_cache WHERE city = ?'),
        ['Будапешт']
      );
    });

    it('должен вернуть null если данных нет', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce(null);

      const result = await databaseService.getWeatherData('НесуществующийГород');

      expect(result).toBeNull();
    });

    it('должен вернуть самые свежие данные для города', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce({
        id: 2,
        city: 'Москва',
        timestamp: Date.now(),
      });

      await databaseService.getWeatherData('Москва');

      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY timestamp DESC LIMIT 1'),
        ['Москва']
      );
    });

    it('должен вернуть null при ошибке', async () => {
      mockDb.getFirstAsync.mockRejectedValueOnce(new Error('Database error'));

      const result = await databaseService.getWeatherData('Будапешт');

      expect(result).toBeNull();
    });
  });

  describe('saveForecastData', () => {
    it('должен успешно сохранить почасовой прогноз', async () => {
      const forecastData = [
        { time: '12:00', temperature: 20, weatherCode: 0 },
        { time: '13:00', temperature: 21, weatherCode: 0 },
      ];

      await databaseService.saveForecastData('Будапешт', 'hourly', forecastData);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO forecast_cache'),
        ['Будапешт', 'hourly', JSON.stringify(forecastData), expect.any(Number)]
      );
    });

    it('должен успешно сохранить дневной прогноз', async () => {
      const forecastData = [
        { day: 'Сегодня', tempMax: 22, tempMin: 15, weatherCode: 0 },
        { day: 'Завтра', tempMax: 23, tempMin: 16, weatherCode: 1 },
      ];

      await databaseService.saveForecastData('Москва', 'daily', forecastData);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO forecast_cache'),
        ['Москва', 'daily', JSON.stringify(forecastData), expect.any(Number)]
      );
    });

    it('должен правильно сериализовать данные в JSON', async () => {
      const forecastData = { test: 'data', numbers: [1, 2, 3] };

      await databaseService.saveForecastData('Тест', 'hourly', forecastData);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([JSON.stringify(forecastData)])
      );
    });

    it('должен выбросить ошибку при неудачном сохранении', async () => {
      mockDb.runAsync.mockRejectedValueOnce(new Error('Database error'));

      await expect(
        databaseService.saveForecastData('Тест', 'hourly', [])
      ).rejects.toThrow('Database error');
    });
  });

  describe('getForecastData', () => {
    it('должен успешно получить и распарсить прогноз', async () => {
      const forecastData = [
        { time: '12:00', temperature: 20 },
        { time: '13:00', temperature: 21 },
      ];

      mockDb.getFirstAsync.mockResolvedValueOnce({
        id: 1,
        city: 'Будапешт',
        forecastType: 'hourly',
        forecastData: JSON.stringify(forecastData),
        timestamp: Date.now(),
      });

      const result = await databaseService.getForecastData('Будапешт', 'hourly');

      expect(result).toEqual(forecastData);
    });

    it('должен вернуть null если данных нет', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce(null);

      const result = await databaseService.getForecastData('Тест', 'daily');

      expect(result).toBeNull();
    });

    it('должен корректно обработать разные типы прогнозов', async () => {
      await databaseService.getForecastData('Москва', 'hourly');
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.any(String),
        ['Москва', 'hourly']
      );

      await databaseService.getForecastData('Москва', 'daily');
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.any(String),
        ['Москва', 'daily']
      );
    });

    it('должен вернуть null при ошибке', async () => {
      mockDb.getFirstAsync.mockRejectedValueOnce(new Error('Database error'));

      const result = await databaseService.getForecastData('Тест', 'hourly');

      expect(result).toBeNull();
    });
  });

  describe('isCacheValid', () => {
    it('должен вернуть true для свежего кэша', async () => {
      const recentTimestamp = Date.now() - 2 * 60 * 1000; // 2 минуты назад

      mockDb.getFirstAsync.mockResolvedValueOnce({
        timestamp: recentTimestamp,
      });

      const result = await databaseService.isCacheValid('Будапешт');

      expect(result).toBe(true);
    });

    it('должен вернуть false для устаревшего кэша', async () => {
      const oldTimestamp = Date.now() - 10 * 60 * 1000; // 10 минут назад

      mockDb.getFirstAsync.mockResolvedValueOnce({
        timestamp: oldTimestamp,
      });

      const result = await databaseService.isCacheValid('Будапешт');

      expect(result).toBe(false);
    });

    it('должен использовать кастомный maxAge', async () => {
      const timestamp = Date.now() - 8 * 60 * 1000; // 8 минут назад

      mockDb.getFirstAsync.mockResolvedValueOnce({
        timestamp: timestamp,
      });

      const result = await databaseService.isCacheValid('Тест', 10 * 60 * 1000);

      expect(result).toBe(true);
    });

    it('должен вернуть false если данных нет', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce(null);

      const result = await databaseService.isCacheValid('НесуществующийГород');

      expect(result).toBe(false);
    });

    it('должен вернуть false при ошибке', async () => {
      mockDb.getFirstAsync.mockRejectedValueOnce(new Error('Database error'));

      const result = await databaseService.isCacheValid('Тест');

      expect(result).toBe(false);
    });
  });

  describe('getTopCities', () => {
    it('должен вернуть топ городов по свежести', async () => {
      const mockCities = [
        { city: 'Будапешт', timestamp: Date.now() },
        { city: 'Москва', timestamp: Date.now() - 60000 },
        { city: 'Лондон', timestamp: Date.now() - 120000 },
      ];

      mockDb.getAllAsync.mockResolvedValueOnce(mockCities);

      const result = await databaseService.getTopCities(3);

      expect(result).toEqual(mockCities);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY timestamp DESC LIMIT ?'),
        [3]
      );
    });

    it('должен использовать лимит по умолчанию (5)', async () => {
      mockDb.getAllAsync.mockResolvedValueOnce([]);

      await databaseService.getTopCities();

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.any(String),
        [5]
      );
    });

    it('должен вернуть пустой массив при ошибке', async () => {
      mockDb.getAllAsync.mockRejectedValueOnce(new Error('Database error'));

      const result = await databaseService.getTopCities();

      expect(result).toEqual([]);
    });

    it('должен корректно обработать пустую базу', async () => {
      mockDb.getAllAsync.mockResolvedValueOnce([]);

      const result = await databaseService.getTopCities();

      expect(result).toEqual([]);
    });
  });

  describe('cleanOldData', () => {
    it('должен удалить данные старше 7 дней', async () => {
      await databaseService.cleanOldData();

      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM weather_cache WHERE timestamp < ?'),
        [expect.any(Number)]
      );
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM forecast_cache WHERE timestamp < ?'),
        [expect.any(Number)]
      );
    });

    it('должен корректно вычислить временную метку 7 дней назад', async () => {
      const beforeClean = Date.now();
      await databaseService.cleanOldData();
      const afterClean = Date.now();

      const sevenDays = 7 * 24 * 60 * 60 * 1000;

      // Проверяем, что передан корректный timestamp
      const calls = mockDb.runAsync.mock.calls;
      calls.forEach(call => {
        if (call[0].includes('DELETE')) {
          const timestamp = call[1][0];
          expect(timestamp).toBeGreaterThanOrEqual(beforeClean - sevenDays);
          expect(timestamp).toBeLessThanOrEqual(afterClean - sevenDays);
        }
      });
    });

    it('не должен выбрасывать ошибку при неудаче', async () => {
      mockDb.runAsync.mockRejectedValueOnce(new Error('Database error'));

      // Не должно выбросить ошибку
      await expect(databaseService.cleanOldData()).resolves.not.toThrow();
    });
  });

  describe('getAllCachedCities', () => {
    it('должен вернуть список всех кэшированных городов', async () => {
      const mockResults = [
        { city: 'Будапешт' },
        { city: 'Москва' },
        { city: 'Лондон' },
      ];

      mockDb.getAllAsync.mockResolvedValueOnce(mockResults);

      const result = await databaseService.getAllCachedCities();

      expect(result).toEqual(['Будапешт', 'Москва', 'Лондон']);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT DISTINCT city FROM weather_cache')
      );
    });

    it('должен вернуть города в порядке свежести', async () => {
      mockDb.getAllAsync.mockResolvedValueOnce([]);

      await databaseService.getAllCachedCities();

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY timestamp DESC')
      );
    });

    it('должен вернуть пустой массив если городов нет', async () => {
      mockDb.getAllAsync.mockResolvedValueOnce([]);

      const result = await databaseService.getAllCachedCities();

      expect(result).toEqual([]);
    });

    it('должен вернуть пустой массив при ошибке', async () => {
      mockDb.getAllAsync.mockRejectedValueOnce(new Error('Database error'));

      const result = await databaseService.getAllCachedCities();

      expect(result).toEqual([]);
    });
  });
});
