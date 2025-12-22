// API сервис для Open-Meteo (без необходимости API ключа)
// Документация: https://open-meteo.com/

const BASE_URL = "https://api.open-meteo.com/v1";
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1";

// Типы данных
export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  description: string;
  humidity: number;
  pressure: number;
  windSpeed: number;
  weatherCode: number;
  dt: number;
}

export interface HourlyWeatherData {
  time: string;
  temperature: number;
  weatherCode: number;
  dt: number;
}

export interface DailyWeatherData {
  day: string;
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  dt: number;
}

export interface ForecastData {
  hourly: HourlyWeatherData[];
  daily: DailyWeatherData[];
}

export interface CityData {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

/**
 * Получить текущую погоду по координатам
 */
export const getCurrentWeatherByCoords = async (
  lat: number,
  lon: number,
  units: "metric" | "imperial" = "metric",
): Promise<WeatherData> => {
  try {
    const tempUnit = units === "metric" ? "celsius" : "fahrenheit";
    const windUnit = units === "metric" ? "kmh" : "mph";

    const response = await fetch(
      `${BASE_URL}/forecast?` +
        `latitude=${lat}&` +
        `longitude=${lon}&` +
        `current=temperature_2m,relative_humidity_2m,apparent_temperature,` +
        `pressure_msl,wind_speed_10m,weather_code&` +
        `temperature_unit=${tempUnit}&` +
        `wind_speed_unit=${windUnit}&` +
        `timezone=auto`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Получить название города по координатам
    const cityName = await getCityNameByCoords(lat, lon);

    return {
      city: cityName.name,
      country: cityName.country,
      temperature: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      description: getWeatherDescription(data.current.weather_code),
      humidity: Math.round(data.current.relative_humidity_2m),
      pressure: Math.round(data.current.pressure_msl),
      windSpeed: Math.round(data.current.wind_speed_10m),
      weatherCode: data.current.weather_code,
      dt: Date.now(),
    };
  } catch (error) {
    console.error("Error fetching weather by coords:", error);
    throw new Error("Не удалось загрузить данные о погоде");
  }
};

/**
 * Получить прогноз погоды по координатам
 */
export const getForecastByCoords = async (
  lat: number,
  lon: number,
  units: "metric" | "imperial" = "metric",
): Promise<ForecastData> => {
  try {
    const tempUnit = units === "metric" ? "celsius" : "fahrenheit";
    const windUnit = units === "metric" ? "kmh" : "mph";

    const response = await fetch(
      `${BASE_URL}/forecast?` +
        `latitude=${lat}&` +
        `longitude=${lon}&` +
        `hourly=temperature_2m,weather_code&` +
        `daily=temperature_2m_max,temperature_2m_min,weather_code&` +
        `temperature_unit=${tempUnit}&` +
        `wind_speed_unit=${windUnit}&` +
        `timezone=auto&` +
        `forecast_days=7`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Почасовой прогноз (берем первые 6 часов)
    const hourly: HourlyWeatherData[] = [];
    for (let i = 0; i < 6 && i < data.hourly.time.length; i++) {
      const date = new Date(data.hourly.time[i]);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const timeStr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

      hourly.push({
        time: i === 0 ? "Сейчас" : timeStr,
        temperature: Math.round(data.hourly.temperature_2m[i]),
        weatherCode: data.hourly.weather_code[i],
        dt: date.getTime(),
      });
    }

    // Дневной прогноз (7 дней)
    const daily: DailyWeatherData[] = [];
    for (let i = 0; i < data.daily.time.length; i++) {
      const date = new Date(data.daily.time[i]);
      const dayName = getDayName(date, i);

      daily.push({
        day: dayName,
        date: data.daily.time[i],
        tempMax: Math.round(data.daily.temperature_2m_max[i]),
        tempMin: Math.round(data.daily.temperature_2m_min[i]),
        weatherCode: data.daily.weather_code[i],
        dt: date.getTime(),
      });
    }

    return { hourly, daily };
  } catch (error) {
    console.error("Error fetching forecast by coords:", error);
    throw new Error("Не удалось загрузить прогноз погоды");
  }
};

/**
 * Поиск городов по названию
 */
export const searchCities = async (query: string): Promise<CityData[]> => {
  try {
    if (query.length < 2) {
      return [];
    }

    const response = await fetch(
      `${GEOCODING_URL}/search?name=${encodeURIComponent(query)}&count=10&language=ru&format=json`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results) {
      return [];
    }

    return data.results.map((item: any) => ({
      name: item.name,
      country: item.country || item.country_code || "",
      lat: item.latitude,
      lon: item.longitude,
    }));
  } catch (error) {
    console.error("Error searching cities:", error);
    throw new Error("Не удалось найти города");
  }
};

/**
 * Получить название города по координатам (обратное геокодирование)
 */
export const getCityNameByCoords = async (
  lat: number,
  lon: number,
): Promise<{ name: string; country: string }> => {
  try {
    // Open-Meteo не предоставляет обратное геокодирование
    // Используем приближенный поиск
    const response = await fetch(
      `${GEOCODING_URL}/search?` +
        `latitude=${lat}&` +
        `longitude=${lon}&` +
        `count=1&` +
        `language=ru&` +
        `format=json`,
    );

    if (!response.ok) {
      return { name: "Неизвестно", country: "" };
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return {
        name: data.results[0].name,
        country: data.results[0].country || data.results[0].country_code || "",
      };
    }

    return { name: "Неизвестно", country: "" };
  } catch (error) {
    console.error("Error getting city name:", error);
    return { name: "Неизвестно", country: "" };
  }
};

/**
 * Получить описание погоды по WMO коду
 * https://open-meteo.com/en/docs
 */
function getWeatherDescription(code: number): string {
  const weatherCodes: { [key: number]: string } = {
    0: "Ясно",
    1: "Преимущественно ясно",
    2: "Переменная облачность",
    3: "Пасмурно",
    45: "Туман",
    48: "Изморозь",
    51: "Лёгкая морось",
    53: "Морось",
    55: "Сильная морось",
    56: "Замерзающая морось",
    57: "Сильная замерзающая морось",
    61: "Небольшой дождь",
    63: "Дождь",
    65: "Сильный дождь",
    66: "Замерзающий дождь",
    67: "Сильный замерзающий дождь",
    71: "Небольшой снег",
    73: "Снег",
    75: "Сильный снег",
    77: "Снежные зёрна",
    80: "Лёгкий ливень",
    81: "Ливень",
    82: "Сильный ливень",
    85: "Небольшой снегопад",
    86: "Сильный снегопад",
    95: "Гроза",
    96: "Гроза с градом",
    99: "Сильная гроза с градом",
  };

  return weatherCodes[code] || "Неизвестно";
}

/**
 * Получить название дня недели
 */
function getDayName(date: Date, index: number): string {
  if (index === 0) {
    return "Сегодня";
  }
  if (index === 1) {
    return "Завтра";
  }

  const days = [
    "Воскресенье",
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
  ];
  return days[date.getDay()];
}

/**
 * Предопределенные города для быстрого доступа
 */
export const POPULAR_CITIES: CityData[] = [
  { name: "Будапешт", country: "Венгрия", lat: 47.4979, lon: 19.0402 },
  { name: "Москва", country: "Россия", lat: 55.7558, lon: 37.6173 },
  { name: "Лондон", country: "Великобритания", lat: 51.5074, lon: -0.1278 },
  { name: "Париж", country: "Франция", lat: 48.8566, lon: 2.3522 },
  { name: "Токио", country: "Япония", lat: 35.6762, lon: 139.6503 },
  { name: "Нью-Йорк", country: "США", lat: 40.7128, lon: -74.006 },
];
