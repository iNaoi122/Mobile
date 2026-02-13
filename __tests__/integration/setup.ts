// Настройка для интеграционных тестов
import "@testing-library/jest-native/extend-expect";

// Mock database для интеграционных тестов
const mockDb = {
  execAsync: jest.fn(() => Promise.resolve()),
  runAsync: jest.fn(() => Promise.resolve({ lastInsertRowId: 1, changes: 1 })),
  getFirstAsync: jest.fn(() => Promise.resolve(null)),
  getAllAsync: jest.fn(() => Promise.resolve([])),
};

// Создаем базовое хранилище для симуляции БД в памяти
const inMemoryStorage: {
  weather: Map<string, any>;
  forecast: Map<string, any>;
} = {
  weather: new Map(),
  forecast: new Map(),
};

// Переопределяем методы БД для использования in-memory хранилища
mockDb.runAsync = jest.fn((query: string, params: any[]) => {
  if (query.includes("INSERT OR REPLACE INTO weather_cache")) {
    const [
      city,
      country,
      lat,
      lon,
      temp,
      feels,
      desc,
      hum,
      press,
      wind,
      code,
      ts,
    ] = params;
    const key = `${city}-${country}`;
    inMemoryStorage.weather.set(key, {
      city,
      country,
      latitude: lat,
      longitude: lon,
      temperature: temp,
      feelsLike: feels,
      description: desc,
      humidity: hum,
      pressure: press,
      windSpeed: wind,
      weatherCode: code,
      timestamp: ts,
    });
  } else if (query.includes("INSERT OR REPLACE INTO forecast_cache")) {
    const [city, forecastType, forecastData, ts] = params;
    const key = `${city}-${forecastType}`;
    inMemoryStorage.forecast.set(key, {
      city,
      forecastType,
      forecastData,
      timestamp: ts,
    });
  } else if (query.includes("DELETE FROM weather_cache")) {
    const threshold = params[0];
    for (const [key, value] of inMemoryStorage.weather.entries()) {
      if (value.timestamp < threshold) {
        inMemoryStorage.weather.delete(key);
      }
    }
  } else if (query.includes("DELETE FROM forecast_cache")) {
    const threshold = params[0];
    for (const [key, value] of inMemoryStorage.forecast.entries()) {
      if (value.timestamp < threshold) {
        inMemoryStorage.forecast.delete(key);
      }
    }
  }
  return Promise.resolve({ lastInsertRowId: 1, changes: 1 });
});

mockDb.getFirstAsync = jest.fn((query: string, params: any[]) => {
  if (query.includes("SELECT * FROM weather_cache WHERE city")) {
    const city = params[0];
    for (const [key, value] of inMemoryStorage.weather.entries()) {
      if (value.city === city) {
        return Promise.resolve(value);
      }
    }
    return Promise.resolve(null);
  } else if (query.includes("SELECT * FROM forecast_cache")) {
    const [city, forecastType] = params;
    const key = `${city}-${forecastType}`;
    const data = inMemoryStorage.forecast.get(key);
    return Promise.resolve(data || null);
  } else if (query.includes("SELECT timestamp FROM weather_cache")) {
    const city = params[0];
    for (const [key, value] of inMemoryStorage.weather.entries()) {
      if (value.city === city) {
        return Promise.resolve({ timestamp: value.timestamp });
      }
    }
    return Promise.resolve(null);
  }
  return Promise.resolve(null);
});

mockDb.getAllAsync = jest.fn((query: string, params?: any[]) => {
  if (query.includes("SELECT * FROM weather_cache ORDER BY timestamp DESC")) {
    const limit = params?.[0] || 100;
    const values = Array.from(inMemoryStorage.weather.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
    return Promise.resolve(values);
  } else if (query.includes("SELECT DISTINCT city FROM weather_cache")) {
    const cities = Array.from(inMemoryStorage.weather.values())
      .map((v) => ({ city: v.city }))
      .filter((v, i, a) => a.findIndex((t) => t.city === v.city) === i);
    return Promise.resolve(cities);
  }
  return Promise.resolve([]);
});

jest.mock("expo-sqlite", () => ({
  openDatabaseSync: jest.fn(() => mockDb),
  openDatabaseAsync: jest.fn(() => Promise.resolve(mockDb)),
}));

// Очищаем хранилище перед каждым тестом
beforeEach(() => {
  inMemoryStorage.weather.clear();
  inMemoryStorage.forecast.clear();
});
