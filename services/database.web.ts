// Веб-версия database service (mock, без SQLite)
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
  forecastData: string;
  timestamp: number;
}

class DatabaseService {
  private db: any | null = null;

  async init() {
    console.log("SQLite недоступен на веб-платформе, используется только API");
    return;
  }

  private async createTables() {
    // Нет операций для веб
  }

  async saveWeatherData(data: CachedWeatherData): Promise<void> {
    // Нет операций для веб
  }

  async getWeatherData(city: string): Promise<CachedWeatherData | null> {
    return null;
  }

  async saveForecastData(
    city: string,
    forecastType: "hourly" | "daily",
    forecastData: any
  ): Promise<void> {
    // Нет операций для веб
  }

  async getForecastData(
    city: string,
    forecastType: "hourly" | "daily"
  ): Promise<any | null> {
    return null;
  }

  async isCacheValid(city: string, maxAge: number = 5 * 60 * 1000): Promise<boolean> {
    return false;
  }

  async getTopCities(limit: number = 5): Promise<CachedWeatherData[]> {
    return [];
  }

  async cleanOldData(): Promise<void> {
    // Нет операций для веб
  }

  async getAllCachedCities(): Promise<string[]> {
    return [];
  }
}

export const databaseService = new DatabaseService();
