/**
 * Сервис геолокации для веб-платформы
 * Использует браузерный Geolocation API для получения координат
 */

export interface GeolocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface GeolocationResult {
  coords: GeolocationCoords;
  timestamp: number;
}

/**
 * Проверяет, поддерживает ли браузер Geolocation API
 * @returns true если API поддерживается, false в противном случае
 */
function isGeolocationSupported(): boolean {
  return "geolocation" in navigator;
}

/**
 * Запрашивает разрешение на доступ к геолокации
 * Для веб-платформы разрешение запрашивается автоматически при вызове getCurrentPosition
 * @returns true (всегда, так как проверка происходит при фактическом запросе)
 */
export async function requestLocationPermission(): Promise<boolean> {
  if (!isGeolocationSupported()) {
    console.error("Geolocation API не поддерживается этим браузером");
    return false;
  }

  // Для веб-платформы разрешение запрашивается автоматически
  // при вызове getCurrentPosition или watchPosition
  return true;
}

/**
 * Проверяет, предоставлено ли разрешение на доступ к геолокации
 * Для веб-платформы используется Permissions API (если доступен)
 * @returns true если разрешение предоставлено или неизвестно, false если отклонено
 */
export async function checkLocationPermission(): Promise<boolean> {
  if (!isGeolocationSupported()) {
    return false;
  }

  // Проверяем поддержку Permissions API
  if ("permissions" in navigator) {
    try {
      const result = await navigator.permissions.query({ name: "geolocation" });
      return result.state === "granted" || result.state === "prompt";
    } catch (error) {
      // Если Permissions API не поддерживается или произошла ошибка,
      // возвращаем true и позволяем браузеру запросить разрешение
      console.warn("Ошибка при проверке разрешений:", error);
      return true;
    }
  }

  // Если Permissions API не поддерживается, возвращаем true
  return true;
}

/**
 * Получает текущее местоположение через браузерный Geolocation API
 * @returns Promise с объектом координат и временной меткой
 * @throws Error если не удалось получить местоположение
 */
export async function getCurrentPosition(): Promise<GeolocationResult> {
  if (!isGeolocationSupported()) {
    throw new Error("Geolocation API не поддерживается вашим браузером");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
          },
          timestamp: position.timestamp,
        });
      },
      (error) => {
        let errorMessage = "Не удалось получить местоположение";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Доступ к геолокации запрещен пользователем";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Информация о местоположении недоступна";
            break;
          case error.TIMEOUT:
            errorMessage = "Превышено время ожидания запроса геолокации";
            break;
        }

        console.error("Ошибка геолокации:", error);
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  });
}

/**
 * Получает текущее местоположение с обработкой разрешений
 * Для веб-платформы эквивалентно getCurrentPosition
 * @returns Promise с объектом координат и временной меткой
 * @throws Error если не удалось получить местоположение
 */
export async function getCurrentPositionWithPermission(): Promise<GeolocationResult> {
  const canRequest = await checkLocationPermission();

  if (!canRequest) {
    throw new Error("Geolocation API недоступен");
  }

  return getCurrentPosition();
}

/**
 * Следит за изменением местоположения
 * @param callback Функция, вызываемая при изменении местоположения
 * @returns Promise с функцией для отмены подписки
 */
export async function watchPosition(
  callback: (result: GeolocationResult) => void,
): Promise<() => void> {
  if (!isGeolocationSupported()) {
    throw new Error("Geolocation API не поддерживается вашим браузером");
  }

  const canRequest = await checkLocationPermission();

  if (!canRequest) {
    throw new Error("Geolocation API недоступен");
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      callback({
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
        },
        timestamp: position.timestamp,
      });
    },
    (error) => {
      console.error("Ошибка при отслеживании местоположения:", error);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    },
  );

  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}
