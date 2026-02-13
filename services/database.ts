import { Platform } from "react-native";

// Условный импорт SQLite только для нативных платформ
let SQLite: any = null;
if (Platform.OS !== "web") {
  SQLite = require("expo-sqlite");
}

export interface CachedWeatherData {
  id?: number;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  temperature: number;
  feelsLike: number;
  description: string;
  humidity: number;
  pressure: number;
  windSpeed: number;
  weatherCode: number;
  timestamp: number;
}

export interface CachedForecastData {
  id?: number;
  city: string;
  forecastType: "hourly" | "daily";
  forecastData: string; // JSON строка
  timestamp: number;
}

class DatabaseService {
  private db: any | null = null;

  async init() {
    // SQLite работает только на нативных платформах (iOS, Android)
    if (Platform.OS === "web") {
      console.log(
        "SQLite недоступен на веб-платформе, используется только API",
      );
      return;
    }

    try {
      this.db = await SQLite.openDatabaseAsync("weather.db");
      await this.createTables();
    } catch (error) {
      console.error("Ошибка инициализации базы данных:", error);
      throw error;
    }
  }

  private async createTables() {
    if (!this.db) return;

    // Таблица для текущей погоды
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS weather_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        city TEXT NOT NULL,
        country TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        temperature REAL NOT NULL,
        feelsLike REAL NOT NULL,
        description TEXT NOT NULL,
        humidity INTEGER NOT NULL,
        pressure INTEGER NOT NULL,
        windSpeed REAL NOT NULL,
        weatherCode INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        UNIQUE(city, country)
      );
    `);

    // Таблица для прогнозов
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS forecast_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        city TEXT NOT NULL,
        forecastType TEXT NOT NULL,
        forecastData TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        UNIQUE(city, forecastType)
      );
    `);

    // Индексы для ускорения поиска
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_weather_city ON weather_cache(city);
      CREATE INDEX IF NOT EXISTS idx_forecast_city ON forecast_cache(city);
      CREATE INDEX IF NOT EXISTS idx_weather_timestamp ON weather_cache(timestamp);
      CREATE INDEX IF NOT EXISTS idx_forecast_timestamp ON forecast_cache(timestamp);
    `);
  }

  // Сохранение данных о погоде
  async saveWeatherData(data: CachedWeatherData): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO weather_cache
        (city, country, latitude, longitude, temperature, feelsLike, description,
         humidity, pressure, windSpeed, weatherCode, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.city,
          data.country,
          data.latitude,
          data.longitude,
          data.temperature,
          data.feelsLike,
          data.description,
          data.humidity,
          data.pressure,
          data.windSpeed,
          data.weatherCode,
          data.timestamp,
        ],
      );
    } catch (error) {
      console.error("Ошибка сохранения данных о погоде:", error);
      throw error;
    }
  }

  // Получение данных о погоде по городу
  async getWeatherData(city: string): Promise<CachedWeatherData | null> {
    if (!this.db) return null;

    try {
      const result = await (this.db.getFirstAsync as any)(
        "SELECT * FROM weather_cache WHERE city = ? ORDER BY timestamp DESC LIMIT 1",
        [city],
      );
      return result || null;
    } catch (error) {
      console.error("Ошибка получения данных о погоде:", error);
      return null;
    }
  }

  // Сохранение прогноза
  async saveForecastData(
    city: string,
    forecastType: "hourly" | "daily",
    forecastData: any,
  ): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO forecast_cache
        (city, forecastType, forecastData, timestamp)
        VALUES (?, ?, ?, ?)`,
        [city, forecastType, JSON.stringify(forecastData), Date.now()],
      );
    } catch (error) {
      console.error("Ошибка сохранения прогноза:", error);
      throw error;
    }
  }

  // Получение прогноза
  async getForecastData(
    city: string,
    forecastType: "hourly" | "daily",
  ): Promise<any | null> {
    if (!this.db) return null;

    try {
      const result = await (this.db.getFirstAsync as any)(
        "SELECT * FROM forecast_cache WHERE city = ? AND forecastType = ? ORDER BY timestamp DESC LIMIT 1",
        [city, forecastType],
      );

      if (result && result.forecastData) {
        return JSON.parse(result.forecastData);
      }
      return null;
    } catch (error) {
      console.error("Ошибка получения прогноза:", error);
      return null;
    }
  }

  // Проверка актуальности кэша (5 минут)
  async isCacheValid(
    city: string,
    maxAge: number = 5 * 60 * 1000,
  ): Promise<boolean> {
    if (!this.db) return false;

    try {
      const result = await (this.db.getFirstAsync as any)(
        "SELECT timestamp FROM weather_cache WHERE city = ? ORDER BY timestamp DESC LIMIT 1",
        [city],
      );

      if (!result) return false;

      const age = Date.now() - result.timestamp;
      return age < maxAge;
    } catch (error) {
      console.error("Ошибка проверки кэша:", error);
      return false;
    }
  }

  // Получение топ 5 городов (самые свежие записи)
  async getTopCities(limit: number = 5): Promise<CachedWeatherData[]> {
    if (!this.db) return [];

    try {
      const results = await (this.db.getAllAsync as any)(
        "SELECT * FROM weather_cache ORDER BY timestamp DESC LIMIT ?",
        [limit],
      );
      return results;
    } catch (error) {
      console.error("Ошибка получения топ городов:", error);
      return [];
    }
  }

  // Очистка старых данных (старше 7 дней)
  async cleanOldData(): Promise<void> {
    if (!this.db) return;

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    try {
      await this.db.runAsync("DELETE FROM weather_cache WHERE timestamp < ?", [
        sevenDaysAgo,
      ]);
      await this.db.runAsync("DELETE FROM forecast_cache WHERE timestamp < ?", [
        sevenDaysAgo,
      ]);
    } catch (error) {
      console.error("Ошибка очистки старых данных:", error);
    }
  }

  // Получение всех кэшированных городов
  async getAllCachedCities(): Promise<string[]> {
    if (!this.db) return [];

    try {
      const results = await (this.db.getAllAsync as any)(
        "SELECT DISTINCT city FROM weather_cache ORDER BY timestamp DESC",
      );
      return results.map((r: any) => r.city);
    } catch (error) {
      console.error("Ошибка получения списка городов:", error);
      return [];
    }
  }
}

export const databaseService = new DatabaseService();
