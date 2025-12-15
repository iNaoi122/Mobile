export type WeatherCondition = {
  icon: string;
  description: string;
};

export type City = {
  name: string;
  country: string;
  temperature: number;
};

export type CurrentWeather = {
  city: string;
  temperature: number;
  condition: WeatherCondition;
  wind: string;
  humidity: string;
  pressure: string;
};

export type HourlyForecast = {
  time: string;
  icon: string;
  temperature: number;
};

export type DailyForecast = {
  day: string;
  icon: string;
  highTemp: number;
  lowTemp: number;
};

export type WeeklyForecast = {
  city: string;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
};

export type TemperatureUnit = "°C" | "°F";
export type SpeedUnit = "км/ч" | "mph";

export type Settings = {
  temperatureUnit: TemperatureUnit;
  speedUnit: SpeedUnit;
  pushNotifications: boolean;
  weatherAlerts: boolean;
  darkTheme: boolean;
  language: string;
};
