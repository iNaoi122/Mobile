import * as Location from 'expo-location';
import {
  requestLocationPermission,
  checkLocationPermission,
  getCurrentPosition,
  getCurrentPositionWithPermission,
  watchPosition,
} from '../geolocation';

// Mock expo-location
jest.mock('expo-location');

const mockLocation = Location as jest.Mocked<typeof Location>;

describe('Geolocation Service (Native)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestLocationPermission', () => {
    it('должен успешно запросить разрешение на геолокацию', async () => {
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      const result = await requestLocationPermission();

      expect(result).toBe(true);
      expect(mockLocation.requestForegroundPermissionsAsync).toHaveBeenCalled();
    });

    it('должен вернуть false если разрешение отклонено', async () => {
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'denied',
        granted: false,
        canAskAgain: false,
        expires: 'never',
      } as any);

      const result = await requestLocationPermission();

      expect(result).toBe(false);
    });

    it('должен обработать ошибку при запросе разрешения', async () => {
      mockLocation.requestForegroundPermissionsAsync.mockRejectedValueOnce(
        new Error('Permission error')
      );

      const result = await requestLocationPermission();

      expect(result).toBe(false);
    });

    it('должен корректно обработать статус "undetermined"', async () => {
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'undetermined',
        granted: false,
        canAskAgain: true,
        expires: 'never',
      } as any);

      const result = await requestLocationPermission();

      expect(result).toBe(false);
    });
  });

  describe('checkLocationPermission', () => {
    it('должен вернуть true если разрешение предоставлено', async () => {
      mockLocation.getForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      const result = await checkLocationPermission();

      expect(result).toBe(true);
      expect(mockLocation.getForegroundPermissionsAsync).toHaveBeenCalled();
    });

    it('должен вернуть false если разрешение не предоставлено', async () => {
      mockLocation.getForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'denied',
        granted: false,
        canAskAgain: false,
        expires: 'never',
      } as any);

      const result = await checkLocationPermission();

      expect(result).toBe(false);
    });

    it('должен обработать ошибку при проверке разрешения', async () => {
      mockLocation.getForegroundPermissionsAsync.mockRejectedValueOnce(
        new Error('Check permission error')
      );

      const result = await checkLocationPermission();

      expect(result).toBe(false);
    });
  });

  describe('getCurrentPosition', () => {
    it('должен успешно получить текущее местоположение', async () => {
      const mockLocationData = {
        coords: {
          latitude: 47.4979,
          longitude: 19.0402,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: 1640000000000,
      };

      mockLocation.getCurrentPositionAsync.mockResolvedValueOnce(
        mockLocationData as any
      );

      const result = await getCurrentPosition();

      expect(result).toEqual({
        coords: {
          latitude: 47.4979,
          longitude: 19.0402,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: 1640000000000,
      });

      expect(mockLocation.getCurrentPositionAsync).toHaveBeenCalledWith({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      });
    });

    it('должен корректно обработать координаты с altitude', async () => {
      const mockLocationData = {
        coords: {
          latitude: 55.7558,
          longitude: 37.6173,
          accuracy: 10,
          altitude: 150,
          altitudeAccuracy: 5,
          heading: 90,
          speed: 5,
        },
        timestamp: Date.now(),
      };

      mockLocation.getCurrentPositionAsync.mockResolvedValueOnce(
        mockLocationData as any
      );

      const result = await getCurrentPosition();

      expect(result.coords.altitude).toBe(150);
      expect(result.coords.altitudeAccuracy).toBe(5);
      expect(result.coords.heading).toBe(90);
      expect(result.coords.speed).toBe(5);
    });

    it('должен выбросить ошибку если не удалось получить местоположение', async () => {
      mockLocation.getCurrentPositionAsync.mockRejectedValueOnce(
        new Error('Location unavailable')
      );

      await expect(getCurrentPosition()).rejects.toThrow(
        'Не удалось получить текущее местоположение'
      );
    });

    it('должен использовать высокую точность', async () => {
      mockLocation.getCurrentPositionAsync.mockResolvedValueOnce({
        coords: {
          latitude: 0,
          longitude: 0,
          accuracy: 1,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as any);

      await getCurrentPosition();

      expect(mockLocation.getCurrentPositionAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          accuracy: Location.Accuracy.High,
        })
      );
    });

    it('должен корректно преобразовать null accuracy в undefined', async () => {
      const mockLocationData = {
        coords: {
          latitude: 50.0,
          longitude: 30.0,
          accuracy: null,
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

      const result = await getCurrentPosition();

      expect(result.coords.accuracy).toBeUndefined();
    });
  });

  describe('getCurrentPositionWithPermission', () => {
    it('должен получить местоположение если разрешение уже предоставлено', async () => {
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

      const result = await getCurrentPositionWithPermission();

      expect(result.coords.latitude).toBe(47.4979);
      expect(result.coords.longitude).toBe(19.0402);
      expect(mockLocation.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
    });

    it('должен запросить разрешение если оно не предоставлено', async () => {
      mockLocation.getForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'denied',
        granted: false,
        canAskAgain: true,
        expires: 'never',
      } as any);

      mockLocation.requestForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      mockLocation.getCurrentPositionAsync.mockResolvedValueOnce({
        coords: {
          latitude: 55.7558,
          longitude: 37.6173,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as any);

      const result = await getCurrentPositionWithPermission();

      expect(result.coords.latitude).toBe(55.7558);
      expect(mockLocation.requestForegroundPermissionsAsync).toHaveBeenCalled();
    });

    it('должен выбросить ошибку если разрешение не предоставлено', async () => {
      mockLocation.getForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'denied',
        granted: false,
        canAskAgain: true,
        expires: 'never',
      } as any);

      mockLocation.requestForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'denied',
        granted: false,
        canAskAgain: false,
        expires: 'never',
      } as any);

      await expect(getCurrentPositionWithPermission()).rejects.toThrow(
        'Разрешение на доступ к геолокации не предоставлено'
      );
    });
  });

  describe('watchPosition', () => {
    it('должен отслеживать изменения местоположения', async () => {
      const mockCallback = jest.fn();
      const mockSubscription = {
        remove: jest.fn(),
      };

      mockLocation.getForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      mockLocation.watchPositionAsync.mockImplementationOnce(
        async (options, callback) => {
          // Симулируем вызов callback с новым местоположением
          callback({
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

          return mockSubscription as any;
        }
      );

      const unsubscribe = await watchPosition(mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          coords: expect.objectContaining({
            latitude: 47.4979,
            longitude: 19.0402,
          }),
        })
      );

      // Проверяем, что можем отписаться
      unsubscribe();
      expect(mockSubscription.remove).toHaveBeenCalled();
    });

    it('должен запросить разрешение если оно не предоставлено', async () => {
      const mockCallback = jest.fn();
      const mockSubscription = {
        remove: jest.fn(),
      };

      mockLocation.getForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'denied',
        granted: false,
        canAskAgain: true,
        expires: 'never',
      } as any);

      mockLocation.requestForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      mockLocation.watchPositionAsync.mockResolvedValueOnce(
        mockSubscription as any
      );

      await watchPosition(mockCallback);

      expect(mockLocation.requestForegroundPermissionsAsync).toHaveBeenCalled();
    });

    it('должен выбросить ошибку если разрешение отклонено', async () => {
      const mockCallback = jest.fn();

      mockLocation.getForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'denied',
        granted: false,
        canAskAgain: true,
        expires: 'never',
      } as any);

      mockLocation.requestForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'denied',
        granted: false,
        canAskAgain: false,
        expires: 'never',
      } as any);

      await expect(watchPosition(mockCallback)).rejects.toThrow(
        'Разрешение на доступ к геолокации не предоставлено'
      );
    });

    it('должен использовать правильные параметры отслеживания', async () => {
      const mockCallback = jest.fn();
      const mockSubscription = {
        remove: jest.fn(),
      };

      mockLocation.getForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      mockLocation.watchPositionAsync.mockResolvedValueOnce(
        mockSubscription as any
      );

      await watchPosition(mockCallback);

      expect(mockLocation.watchPositionAsync).toHaveBeenCalledWith(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        expect.any(Function)
      );
    });

    it('должен передавать обновленные координаты в callback', async () => {
      const mockCallback = jest.fn();
      let locationCallback: any;

      mockLocation.getForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      mockLocation.watchPositionAsync.mockImplementationOnce(
        async (options, callback) => {
          locationCallback = callback;
          return { remove: jest.fn() } as any;
        }
      );

      await watchPosition(mockCallback);

      // Симулируем обновление местоположения
      locationCallback({
        coords: {
          latitude: 50.0,
          longitude: 30.0,
          accuracy: 8,
          altitude: 100,
          altitudeAccuracy: 3,
          heading: 180,
          speed: 10,
        },
        timestamp: 1640000000000,
      });

      expect(mockCallback).toHaveBeenCalledWith({
        coords: {
          latitude: 50.0,
          longitude: 30.0,
          accuracy: 8,
          altitude: 100,
          altitudeAccuracy: 3,
          heading: 180,
          speed: 10,
        },
        timestamp: 1640000000000,
      });
    });
  });
});
