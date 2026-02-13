/**
 * @jest-environment jsdom
 */

import {
  requestLocationPermission,
  checkLocationPermission,
  getCurrentPosition,
  getCurrentPositionWithPermission,
  watchPosition,
} from "../geolocation.web";

describe("Geolocation Service (Web)", () => {
  let mockGeolocation: {
    getCurrentPosition: jest.Mock;
    watchPosition: jest.Mock;
    clearWatch: jest.Mock;
  };

  let mockPermissions: {
    query: jest.Mock;
  };

  let originalGeolocation: any;
  let originalPermissions: any;

  beforeEach(() => {
    // Сохраняем оригинальные значения
    originalGeolocation = global.navigator.geolocation;
    originalPermissions = global.navigator.permissions;

    // Mock navigator.geolocation
    mockGeolocation = {
      getCurrentPosition: jest.fn(),
      watchPosition: jest.fn(),
      clearWatch: jest.fn(),
    };

    // Mock navigator.permissions
    mockPermissions = {
      query: jest.fn(),
    };

    Object.defineProperty(global.navigator, "geolocation", {
      writable: true,
      configurable: true,
      value: mockGeolocation,
    });

    Object.defineProperty(global.navigator, "permissions", {
      writable: true,
      configurable: true,
      value: mockPermissions,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();

    // Восстанавливаем оригинальные значения
    Object.defineProperty(global.navigator, "geolocation", {
      writable: true,
      configurable: true,
      value: originalGeolocation,
    });

    Object.defineProperty(global.navigator, "permissions", {
      writable: true,
      configurable: true,
      value: originalPermissions,
    });
  });

  describe("requestLocationPermission", () => {
    it("должен вернуть true если Geolocation API поддерживается", async () => {
      const result = await requestLocationPermission();
      expect(result).toBe(true);
    });
  });

  describe("checkLocationPermission", () => {
    it("должен вернуть true если разрешение предоставлено", async () => {
      mockPermissions.query.mockResolvedValueOnce({ state: "granted" });

      const result = await checkLocationPermission();
      expect(result).toBe(true);
      expect(mockPermissions.query).toHaveBeenCalledWith({
        name: "geolocation",
      });
    });

    it("должен вернуть true если разрешение в состоянии prompt", async () => {
      mockPermissions.query.mockResolvedValueOnce({ state: "prompt" });

      const result = await checkLocationPermission();
      expect(result).toBe(true);
    });

    it("должен вернуть false если разрешение отклонено", async () => {
      mockPermissions.query.mockResolvedValueOnce({ state: "denied" });

      const result = await checkLocationPermission();
      expect(result).toBe(false);
    });

    it("должен вернуть true если Permissions API не поддерживается", async () => {
      Object.defineProperty(global.navigator, "permissions", {
        writable: true,
        configurable: true,
        value: undefined,
      });

      const result = await checkLocationPermission();
      expect(result).toBe(true);
    });

    it("должен обработать ошибку Permissions API", async () => {
      mockPermissions.query.mockRejectedValueOnce(
        new Error("Permission API error"),
      );

      const result = await checkLocationPermission();
      expect(result).toBe(true); // Возвращает true при ошибке
    });
  });

  describe("getCurrentPosition", () => {
    it("должен успешно получить текущее местоположение", async () => {
      const mockPosition = {
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

      mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
        success(mockPosition);
      });

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

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    });

    it("должен корректно обработать координаты с altitude", async () => {
      const mockPosition = {
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

      mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
        success(mockPosition);
      });

      const result = await getCurrentPosition();

      expect(result.coords.altitude).toBe(150);
      expect(result.coords.altitudeAccuracy).toBe(5);
      expect(result.coords.heading).toBe(90);
      expect(result.coords.speed).toBe(5);
    });

    it("должен обработать ошибку PERMISSION_DENIED", async () => {
      const mockError = {
        code: 1, // PERMISSION_DENIED
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: "User denied geolocation",
      };

      mockGeolocation.getCurrentPosition.mockImplementationOnce(
        (success, error) => {
          error(mockError);
        },
      );

      await expect(getCurrentPosition()).rejects.toThrow(
        "Доступ к геолокации запрещен пользователем",
      );
    });

    it("должен обработать ошибку POSITION_UNAVAILABLE", async () => {
      const mockError = {
        code: 2, // POSITION_UNAVAILABLE
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: "Position unavailable",
      };

      mockGeolocation.getCurrentPosition.mockImplementationOnce(
        (success, error) => {
          error(mockError);
        },
      );

      await expect(getCurrentPosition()).rejects.toThrow(
        "Информация о местоположении недоступна",
      );
    });

    it("должен обработать ошибку TIMEOUT", async () => {
      const mockError = {
        code: 3, // TIMEOUT
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: "Timeout",
      };

      mockGeolocation.getCurrentPosition.mockImplementationOnce(
        (success, error) => {
          error(mockError);
        },
      );

      await expect(getCurrentPosition()).rejects.toThrow(
        "Превышено время ожидания запроса геолокации",
      );
    });

    it("должен обработать неизвестную ошибку", async () => {
      const mockError = {
        code: 999,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: "Unknown error",
      };

      mockGeolocation.getCurrentPosition.mockImplementationOnce(
        (success, error) => {
          error(mockError);
        },
      );

      await expect(getCurrentPosition()).rejects.toThrow(
        "Не удалось получить местоположение",
      );
    });

    it("должен использовать правильные опции запроса", async () => {
      const mockPosition = {
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
      };

      mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
        success(mockPosition);
      });

      await getCurrentPosition();

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    });
  });

  describe("getCurrentPositionWithPermission", () => {
    it("должен получить местоположение если разрешение доступно", async () => {
      mockPermissions.query.mockResolvedValueOnce({ state: "granted" });

      const mockPosition = {
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
      };

      mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
        success(mockPosition);
      });

      const result = await getCurrentPositionWithPermission();

      expect(result.coords.latitude).toBe(47.4979);
      expect(result.coords.longitude).toBe(19.0402);
    });

    it("должен работать если Permissions API не поддерживается", async () => {
      Object.defineProperty(global.navigator, "permissions", {
        writable: true,
        configurable: true,
        value: undefined,
      });

      const mockPosition = {
        coords: {
          latitude: 50.0,
          longitude: 30.0,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };

      mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
        success(mockPosition);
      });

      const result = await getCurrentPositionWithPermission();

      expect(result.coords.latitude).toBe(50.0);
    });
  });

  describe("watchPosition", () => {
    it("должен отслеживать изменения местоположения", async () => {
      const mockCallback = jest.fn();
      let positionCallback: any;

      mockPermissions.query.mockResolvedValueOnce({ state: "granted" });

      mockGeolocation.watchPosition.mockImplementationOnce((success) => {
        positionCallback = success;
        return 1; // watchId
      });

      const unsubscribe = await watchPosition(mockCallback);

      // Симулируем обновление позиции
      positionCallback({
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
      });

      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          coords: expect.objectContaining({
            latitude: 47.4979,
            longitude: 19.0402,
          }),
        }),
      );

      // Проверяем отписку
      unsubscribe();
      expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(1);
    });

    it("должен выбросить ошибку если Geolocation API не поддерживается", async () => {
      // Временно удаляем свойство для имитации отсутствия поддержки
      const geolocationDescriptor = Object.getOwnPropertyDescriptor(
        global.navigator,
        "geolocation",
      );
      delete (global.navigator as any).geolocation;

      await expect(watchPosition(jest.fn())).rejects.toThrow(
        "Geolocation API не поддерживается вашим браузером",
      );

      // Восстанавливаем для следующих тестов
      if (geolocationDescriptor) {
        Object.defineProperty(
          global.navigator,
          "geolocation",
          geolocationDescriptor,
        );
      }
    });

    it("должен выбросить ошибку если разрешение отклонено", async () => {
      mockPermissions.query.mockResolvedValueOnce({ state: "denied" });

      await expect(watchPosition(jest.fn())).rejects.toThrow(
        "Geolocation API недоступен",
      );
    });

    it("должен использовать правильные опции отслеживания", async () => {
      mockPermissions.query.mockResolvedValueOnce({ state: "granted" });

      mockGeolocation.watchPosition.mockReturnValueOnce(1);

      await watchPosition(jest.fn());

      expect(mockGeolocation.watchPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    });

    it("должен передавать несколько обновлений в callback", async () => {
      const mockCallback = jest.fn();
      let positionCallback: any;

      mockPermissions.query.mockResolvedValueOnce({ state: "granted" });

      mockGeolocation.watchPosition.mockImplementationOnce((success) => {
        positionCallback = success;
        return 1;
      });

      await watchPosition(mockCallback);

      // Первое обновление
      positionCallback({
        coords: {
          latitude: 47.0,
          longitude: 19.0,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: 1000,
      });

      // Второе обновление
      positionCallback({
        coords: {
          latitude: 47.5,
          longitude: 19.5,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: 2000,
      });

      expect(mockCallback).toHaveBeenCalledTimes(2);
      expect(mockCallback).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          coords: expect.objectContaining({ latitude: 47.0 }),
        }),
      );
      expect(mockCallback).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          coords: expect.objectContaining({ latitude: 47.5 }),
        }),
      );
    });

    it("должен обработать ошибку при отслеживании", async () => {
      const mockCallback = jest.fn();
      let errorCallback: any;

      mockPermissions.query.mockResolvedValueOnce({ state: "granted" });

      mockGeolocation.watchPosition.mockImplementationOnce((success, error) => {
        errorCallback = error;
        return 1;
      });

      await watchPosition(mockCallback);

      // Симулируем ошибку
      const mockError = {
        code: 2,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: "Position unavailable",
      };

      // Ошибка должна быть залогирована, но не выброшена
      expect(() => errorCallback(mockError)).not.toThrow();
    });

    it("должен корректно очистить несколько подписок", async () => {
      mockPermissions.query
        .mockResolvedValueOnce({ state: "granted" })
        .mockResolvedValueOnce({ state: "granted" });

      mockGeolocation.watchPosition
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(2);

      const unsubscribe1 = await watchPosition(jest.fn());
      const unsubscribe2 = await watchPosition(jest.fn());

      unsubscribe1();
      unsubscribe2();

      expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(1);
      expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(2);
    });
  });
});
