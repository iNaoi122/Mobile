import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Storage from '../services/storage';

export type ThemeType = 'light' | 'dark';
export type TemperatureUnit = 'metric' | 'imperial';
export type WindSpeedUnit = 'kmh' | 'mph';

interface SettingsContextData {
  // Настройки
  theme: ThemeType;
  temperatureUnit: TemperatureUnit;
  windSpeedUnit: WindSpeedUnit;
  pushNotifications: boolean;
  weatherAlerts: boolean;

  // Действия
  setTheme: (theme: ThemeType) => Promise<void>;
  setTemperatureUnit: (unit: TemperatureUnit) => Promise<void>;
  setWindSpeedUnit: (unit: WindSpeedUnit) => Promise<void>;
  setPushNotifications: (enabled: boolean) => Promise<void>;
  setWeatherAlerts: (enabled: boolean) => Promise<void>;

  // Утилиты
  isLoading: boolean;
  getTemperatureSymbol: () => string;
  getWindSpeedSymbol: () => string;
  convertTemperature: (temp: number) => number;
  convertWindSpeed: (speed: number) => number;
}

const SettingsContext = createContext<SettingsContextData | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>('light');
  const [temperatureUnit, setTemperatureUnitState] = useState<TemperatureUnit>('metric');
  const [windSpeedUnit, setWindSpeedUnitState] = useState<WindSpeedUnit>('kmh');
  const [pushNotifications, setPushNotificationsState] = useState<boolean>(true);
  const [weatherAlerts, setWeatherAlertsState] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Загрузка настроек при монтировании
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const settings = await Storage.getSettings();

      setThemeState(settings.theme);
      setTemperatureUnitState(settings.temperatureUnit);
      setWindSpeedUnitState(settings.windSpeedUnit);
      setPushNotificationsState(settings.pushNotifications);
      setWeatherAlertsState(settings.weatherAlerts);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (newTheme: ThemeType) => {
    try {
      await Storage.saveTheme(newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error setting theme:', error);
      throw error;
    }
  };

  const setTemperatureUnit = async (unit: TemperatureUnit) => {
    try {
      await Storage.saveTemperatureUnit(unit);
      setTemperatureUnitState(unit);
    } catch (error) {
      console.error('Error setting temperature unit:', error);
      throw error;
    }
  };

  const setWindSpeedUnit = async (unit: WindSpeedUnit) => {
    try {
      await Storage.saveWindSpeedUnit(unit);
      setWindSpeedUnitState(unit);
    } catch (error) {
      console.error('Error setting wind speed unit:', error);
      throw error;
    }
  };

  const setPushNotifications = async (enabled: boolean) => {
    try {
      await Storage.savePushNotifications(enabled);
      setPushNotificationsState(enabled);
    } catch (error) {
      console.error('Error setting push notifications:', error);
      throw error;
    }
  };

  const setWeatherAlerts = async (enabled: boolean) => {
    try {
      await Storage.saveWeatherAlerts(enabled);
      setWeatherAlertsState(enabled);
    } catch (error) {
      console.error('Error setting weather alerts:', error);
      throw error;
    }
  };

  const getTemperatureSymbol = (): string => {
    return temperatureUnit === 'metric' ? '°C' : '°F';
  };

  const getWindSpeedSymbol = (): string => {
    return windSpeedUnit === 'kmh' ? 'км/ч' : 'mph';
  };

  const convertTemperature = (temp: number): number => {
    if (temperatureUnit === 'imperial') {
      return Math.round((temp * 9/5) + 32);
    }
    return Math.round(temp);
  };

  const convertWindSpeed = (speed: number): number => {
    // API возвращает скорость в м/с
    if (windSpeedUnit === 'kmh') {
      return Math.round(speed * 3.6); // м/с -> км/ч
    } else {
      return Math.round(speed * 2.237); // м/с -> mph
    }
  };

  const value: SettingsContextData = {
    theme,
    temperatureUnit,
    windSpeedUnit,
    pushNotifications,
    weatherAlerts,
    setTheme,
    setTemperatureUnit,
    setWindSpeedUnit,
    setPushNotifications,
    setWeatherAlerts,
    isLoading,
    getTemperatureSymbol,
    getWindSpeedSymbol,
    convertTemperature,
    convertWindSpeed,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextData => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
