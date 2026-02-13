/**
 * Сервис геолокации для нативных платформ (Android/iOS)
 * Использует expo-location для получения координат устройства
 */

import * as Location from "expo-location";

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
 * Запрашивает разрешение на доступ к геолокации
 * @returns true если разрешение предоставлено, false если отклонено
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Ошибка при запросе разрешения на геолокацию:", error);
    return false;
  }
}

/**
 * Проверяет, предоставлено ли разрешение на доступ к геолокации
 * @returns true если разрешение предоставлено, false в противном случае
 */
export async function checkLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Ошибка при проверке разрешения на геолокацию:", error);
    return false;
  }
}

/**
 * Получает текущее местоположение устройства
 * Использует высокую точность для Android
 * @returns Объект с координатами и временной меткой
 * @throws Error если не удалось получить местоположение
 */
export async function getCurrentPosition(): Promise<GeolocationResult> {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 10,
    });

    return {
      coords: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy ?? undefined,
        altitude: location.coords.altitude,
        altitudeAccuracy: location.coords.altitudeAccuracy,
        heading: location.coords.heading,
        speed: location.coords.speed,
      },
      timestamp: location.timestamp,
    };
  } catch (error) {
    console.error("Ошибка при получении местоположения:", error);
    throw new Error("Не удалось получить текущее местоположение");
  }
}

/**
 * Получает текущее местоположение с обработкой разрешений
 * Автоматически запрашивает разрешение, если оно не было предоставлено
 * @returns Объект с координатами и временной меткой
 * @throws Error если разрешение не предоставлено или не удалось получить местоположение
 */
export async function getCurrentPositionWithPermission(): Promise<GeolocationResult> {
  const hasPermission = await checkLocationPermission();

  if (!hasPermission) {
    const granted = await requestLocationPermission();
    if (!granted) {
      throw new Error("Разрешение на доступ к геолокации не предоставлено");
    }
  }

  return getCurrentPosition();
}

/**
 * Следит за изменением местоположения
 * @param callback Функция, вызываемая при изменении местоположения
 * @returns Функция для отмены подписки
 */
export async function watchPosition(
  callback: (result: GeolocationResult) => void,
): Promise<() => void> {
  const hasPermission = await checkLocationPermission();

  if (!hasPermission) {
    const granted = await requestLocationPermission();
    if (!granted) {
      throw new Error("Разрешение на доступ к геолокации не предоставлено");
    }
  }

  const subscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 10,
    },
    (location) => {
      callback({
        coords: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy ?? undefined,
          altitude: location.coords.altitude,
          altitudeAccuracy: location.coords.altitudeAccuracy,
          heading: location.coords.heading,
          speed: location.coords.speed,
        },
        timestamp: location.timestamp,
      });
    },
  );

  return () => subscription.remove();
}
