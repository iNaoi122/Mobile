import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { SettingsProvider, useSettings } from '../../contexts/SettingsContext';
import * as Storage from '../../services/storage';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SettingsProvider>{children}</SettingsProvider>
);

describe('SettingsContext Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Settings Initialization', () => {
    it('должен загрузить настройки из storage при инициализации', async () => {
      const mockSettings = {
        theme: 'dark' as const,
        temperatureUnit: 'imperial' as const,
        windSpeedUnit: 'mph' as const,
        pushNotifications: false,
        weatherAlerts: false,
      };

      (Storage.getSettings as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockSettings);

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(Storage.getSettings).toHaveBeenCalled();
      expect(result.current.theme).toBe('dark');
      expect(result.current.temperatureUnit).toBe('imperial');
      expect(result.current.windSpeedUnit).toBe('mph');
      expect(result.current.pushNotifications).toBe(false);
      expect(result.current.weatherAlerts).toBe(false);
    });

    it('должен использовать настройки по умолчанию при ошибке загрузки', async () => {
      (Storage.getSettings as jest.Mock) = jest
        .fn()
        .mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Должны быть использованы настройки по умолчанию
      expect(result.current.theme).toBe('light');
      expect(result.current.temperatureUnit).toBe('metric');
    });
  });

  describe('Theme Management', () => {
    it('должен изменить тему и сохранить в storage', async () => {
      (Storage.getSettings as jest.Mock) = jest.fn().mockResolvedValue({
        theme: 'light',
        temperatureUnit: 'metric',
        windSpeedUnit: 'kmh',
        pushNotifications: true,
        weatherAlerts: true,
      });
      (Storage.saveTheme as jest.Mock) = jest.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.theme).toBe('light');

      // Меняем тему
      await act(async () => {
        await result.current.setTheme('dark');
      });

      expect(Storage.saveTheme).toHaveBeenCalledWith('dark');
      expect(result.current.theme).toBe('dark');
    });

    it('должен выбросить ошибку при неудачном сохранении темы', async () => {
      (Storage.getSettings as jest.Mock) = jest.fn().mockResolvedValue({
        theme: 'light',
        temperatureUnit: 'metric',
        windSpeedUnit: 'kmh',
        pushNotifications: true,
        weatherAlerts: true,
      });
      (Storage.saveTheme as jest.Mock) = jest
        .fn()
        .mockRejectedValue(new Error('Save error'));

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.setTheme('dark');
        })
      ).rejects.toThrow('Save error');

      // Тема не должна измениться
      expect(result.current.theme).toBe('light');
    });
  });

  describe('Temperature Unit Management', () => {
    it('должен изменить единицы температуры и сохранить в storage', async () => {
      (Storage.getSettings as jest.Mock) = jest.fn().mockResolvedValue({
        theme: 'light',
        temperatureUnit: 'metric',
        windSpeedUnit: 'kmh',
        pushNotifications: true,
        weatherAlerts: true,
      });
      (Storage.saveTemperatureUnit as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.temperatureUnit).toBe('metric');
      expect(result.current.getTemperatureSymbol()).toBe('°C');

      // Меняем единицы
      await act(async () => {
        await result.current.setTemperatureUnit('imperial');
      });

      expect(Storage.saveTemperatureUnit).toHaveBeenCalledWith('imperial');
      expect(result.current.temperatureUnit).toBe('imperial');
      expect(result.current.getTemperatureSymbol()).toBe('°F');
    });

    it('должен правильно конвертировать температуру', async () => {
      (Storage.getSettings as jest.Mock) = jest.fn().mockResolvedValue({
        theme: 'light',
        temperatureUnit: 'metric',
        windSpeedUnit: 'kmh',
        pushNotifications: true,
        weatherAlerts: true,
      });

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Метрические единицы - без конвертации
      expect(result.current.convertTemperature(20)).toBe(20);
      expect(result.current.convertTemperature(0)).toBe(0);

      // Меняем на imperial
      (Storage.saveTemperatureUnit as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);

      await act(async () => {
        await result.current.setTemperatureUnit('imperial');
      });

      // Imperial - конвертация по формуле (C * 9/5) + 32
      expect(result.current.convertTemperature(0)).toBe(32); // 0°C = 32°F
      expect(result.current.convertTemperature(20)).toBe(68); // 20°C = 68°F
      expect(result.current.convertTemperature(-10)).toBe(14); // -10°C = 14°F
    });
  });

  describe('Wind Speed Unit Management', () => {
    it('должен изменить единицы скорости ветра и сохранить в storage', async () => {
      (Storage.getSettings as jest.Mock) = jest.fn().mockResolvedValue({
        theme: 'light',
        temperatureUnit: 'metric',
        windSpeedUnit: 'kmh',
        pushNotifications: true,
        weatherAlerts: true,
      });
      (Storage.saveWindSpeedUnit as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.windSpeedUnit).toBe('kmh');
      expect(result.current.getWindSpeedSymbol()).toBe('км/ч');

      // Меняем единицы
      await act(async () => {
        await result.current.setWindSpeedUnit('mph');
      });

      expect(Storage.saveWindSpeedUnit).toHaveBeenCalledWith('mph');
      expect(result.current.windSpeedUnit).toBe('mph');
      expect(result.current.getWindSpeedSymbol()).toBe('mph');
    });

    it('должен правильно конвертировать скорость ветра', async () => {
      (Storage.getSettings as jest.Mock) = jest.fn().mockResolvedValue({
        theme: 'light',
        temperatureUnit: 'metric',
        windSpeedUnit: 'kmh',
        pushNotifications: true,
        weatherAlerts: true,
      });

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // м/с -> км/ч (умножаем на 3.6)
      expect(result.current.convertWindSpeed(5)).toBe(18); // 5 м/с = 18 км/ч
      expect(result.current.convertWindSpeed(10)).toBe(36); // 10 м/с = 36 км/ч

      // Меняем на mph
      (Storage.saveWindSpeedUnit as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);

      await act(async () => {
        await result.current.setWindSpeedUnit('mph');
      });

      // м/с -> mph (умножаем на 2.237)
      expect(result.current.convertWindSpeed(5)).toBe(11); // 5 м/с ≈ 11 mph
      expect(result.current.convertWindSpeed(10)).toBe(22); // 10 м/с ≈ 22 mph
    });
  });

  describe('Notifications Management', () => {
    it('должен изменить настройки push-уведомлений и сохранить в storage', async () => {
      (Storage.getSettings as jest.Mock) = jest.fn().mockResolvedValue({
        theme: 'light',
        temperatureUnit: 'metric',
        windSpeedUnit: 'kmh',
        pushNotifications: true,
        weatherAlerts: true,
      });
      (Storage.savePushNotifications as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.pushNotifications).toBe(true);

      // Отключаем уведомления
      await act(async () => {
        await result.current.setPushNotifications(false);
      });

      expect(Storage.savePushNotifications).toHaveBeenCalledWith(false);
      expect(result.current.pushNotifications).toBe(false);
    });

    it('должен изменить настройки погодных оповещений и сохранить в storage', async () => {
      (Storage.getSettings as jest.Mock) = jest.fn().mockResolvedValue({
        theme: 'light',
        temperatureUnit: 'metric',
        windSpeedUnit: 'kmh',
        pushNotifications: true,
        weatherAlerts: true,
      });
      (Storage.saveWeatherAlerts as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.weatherAlerts).toBe(true);

      // Отключаем оповещения
      await act(async () => {
        await result.current.setWeatherAlerts(false);
      });

      expect(Storage.saveWeatherAlerts).toHaveBeenCalledWith(false);
      expect(result.current.weatherAlerts).toBe(false);
    });
  });

  describe('Multiple Settings Changes', () => {
    it('должен обработать множественные изменения настроек последовательно', async () => {
      (Storage.getSettings as jest.Mock) = jest.fn().mockResolvedValue({
        theme: 'light',
        temperatureUnit: 'metric',
        windSpeedUnit: 'kmh',
        pushNotifications: true,
        weatherAlerts: true,
      });
      (Storage.saveTheme as jest.Mock) = jest.fn().mockResolvedValue(undefined);
      (Storage.saveTemperatureUnit as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);
      (Storage.saveWindSpeedUnit as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);
      (Storage.savePushNotifications as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Меняем несколько настроек подряд
      await act(async () => {
        await result.current.setTheme('dark');
        await result.current.setTemperatureUnit('imperial');
        await result.current.setWindSpeedUnit('mph');
        await result.current.setPushNotifications(false);
      });

      // Все изменения должны быть сохранены
      expect(Storage.saveTheme).toHaveBeenCalledWith('dark');
      expect(Storage.saveTemperatureUnit).toHaveBeenCalledWith('imperial');
      expect(Storage.saveWindSpeedUnit).toHaveBeenCalledWith('mph');
      expect(Storage.savePushNotifications).toHaveBeenCalledWith(false);

      // Все состояния должны обновиться
      expect(result.current.theme).toBe('dark');
      expect(result.current.temperatureUnit).toBe('imperial');
      expect(result.current.windSpeedUnit).toBe('mph');
      expect(result.current.pushNotifications).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    it('должен предоставлять правильные символы для единиц измерения', async () => {
      (Storage.getSettings as jest.Mock) = jest.fn().mockResolvedValue({
        theme: 'light',
        temperatureUnit: 'metric',
        windSpeedUnit: 'kmh',
        pushNotifications: true,
        weatherAlerts: true,
      });

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Метрические единицы
      expect(result.current.getTemperatureSymbol()).toBe('°C');
      expect(result.current.getWindSpeedSymbol()).toBe('км/ч');

      // Меняем на imperial
      (Storage.saveTemperatureUnit as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);
      (Storage.saveWindSpeedUnit as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);

      await act(async () => {
        await result.current.setTemperatureUnit('imperial');
        await result.current.setWindSpeedUnit('mph');
      });

      expect(result.current.getTemperatureSymbol()).toBe('°F');
      expect(result.current.getWindSpeedSymbol()).toBe('mph');
    });
  });
});
