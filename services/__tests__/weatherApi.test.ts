import {
  getCurrentWeatherByCoords,
  getForecastByCoords,
  searchCities,
  getCityNameByCoords,
  POPULAR_CITIES,
} from '../weatherApi';

// Mock fetch для тестирования
const mockFetch = global.fetch as jest.Mock;

describe('weatherApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentWeatherByCoords', () => {
    it('должен успешно получить текущую погоду по координатам', async () => {
      const mockWeatherData = {
        current: {
          temperature_2m: 20.5,
          apparent_temperature: 18.3,
          relative_humidity_2m: 65,
          pressure_msl: 1013,
          wind_speed_10m: 12,
          weather_code: 0,
        },
      };

      const mockCityData = {
        address: {
          city: 'Будапешт',
          country: 'Венгрия',
        },
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockWeatherData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCityData,
        });

      const result = await getCurrentWeatherByCoords(47.4979, 19.0402);

      expect(result).toEqual({
        city: 'Будапешт',
        country: 'Венгрия',
        temperature: 21,
        feelsLike: 18,
        description: 'Ясно',
        humidity: 65,
        pressure: 1013,
        windSpeed: 12,
        weatherCode: 0,
        dt: expect.any(Number),
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('latitude=47.4979')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('longitude=19.0402')
      );
    });

    it('должен использовать imperial единицы измерения', async () => {
      const mockWeatherData = {
        current: {
          temperature_2m: 68,
          apparent_temperature: 65,
          relative_humidity_2m: 60,
          pressure_msl: 1015,
          wind_speed_10m: 8,
          weather_code: 1,
        },
      };

      const mockCityData = {
        address: {
          city: 'Нью-Йорк',
          country: 'США',
        },
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockWeatherData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCityData,
        });

      await getCurrentWeatherByCoords(40.7128, -74.006, 'imperial');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('temperature_unit=fahrenheit')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('wind_speed_unit=mph')
      );
    });

    it('должен выбросить ошибку при неудачном запросе', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(
        getCurrentWeatherByCoords(0, 0)
      ).rejects.toThrow('Не удалось загрузить данные о погоде');
    });

    it('должен округлять числовые значения', async () => {
      const mockWeatherData = {
        current: {
          temperature_2m: 20.7,
          apparent_temperature: 18.4,
          relative_humidity_2m: 64.8,
          pressure_msl: 1012.6,
          wind_speed_10m: 11.3,
          weather_code: 2,
        },
      };

      const mockCityData = {
        address: {
          city: 'Тестовый город',
          country: 'Тестовая страна',
        },
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockWeatherData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCityData,
        });

      const result = await getCurrentWeatherByCoords(50, 30);

      expect(result.temperature).toBe(21);
      expect(result.feelsLike).toBe(18);
      expect(result.humidity).toBe(65);
      expect(result.pressure).toBe(1013);
      expect(result.windSpeed).toBe(11);
    });
  });

  describe('getForecastByCoords', () => {
    it('должен успешно получить прогноз погоды', async () => {
      const now = new Date('2024-01-15T12:00:00Z');
      const mockForecastData = {
        hourly: {
          time: [
            '2024-01-15T12:00',
            '2024-01-15T13:00',
            '2024-01-15T14:00',
            '2024-01-15T15:00',
            '2024-01-15T16:00',
            '2024-01-15T17:00',
          ],
          temperature_2m: [20, 21, 22, 21, 20, 19],
          weather_code: [0, 0, 1, 1, 2, 2],
        },
        daily: {
          time: [
            '2024-01-15',
            '2024-01-16',
            '2024-01-17',
            '2024-01-18',
            '2024-01-19',
            '2024-01-20',
            '2024-01-21',
          ],
          temperature_2m_max: [22, 23, 24, 22, 21, 20, 19],
          temperature_2m_min: [15, 16, 17, 16, 15, 14, 13],
          weather_code: [0, 1, 2, 3, 61, 71, 95],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockForecastData,
      });

      const result = await getForecastByCoords(47.4979, 19.0402);

      expect(result).toHaveProperty('hourly');
      expect(result).toHaveProperty('daily');
      expect(result.hourly).toHaveLength(6);
      expect(result.daily).toHaveLength(7);

      // Проверяем первый час
      expect(result.hourly[0].time).toBe('Сейчас');
      expect(result.hourly[0].temperature).toBe(20);
      expect(result.hourly[0].weatherCode).toBe(0);

      // Проверяем дневной прогноз
      expect(result.daily[0].day).toBe('Сегодня');
      expect(result.daily[1].day).toBe('Завтра');
      expect(result.daily[0].tempMax).toBe(22);
      expect(result.daily[0].tempMin).toBe(15);
    });

    it('должен корректно форматировать время', async () => {
      const mockForecastData = {
        hourly: {
          time: [
            '2024-01-15T09:00',
            '2024-01-15T10:00',
            '2024-01-15T11:00',
          ],
          temperature_2m: [18, 19, 20],
          weather_code: [0, 0, 1],
        },
        daily: {
          time: ['2024-01-15'],
          temperature_2m_max: [22],
          temperature_2m_min: [15],
          weather_code: [0],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockForecastData,
      });

      const result = await getForecastByCoords(47.4979, 19.0402);

      expect(result.hourly[0].time).toBe('Сейчас');
      expect(result.hourly[1].time).toBe('10:00');
      expect(result.hourly[2].time).toBe('11:00');
    });

    it('должен выбросить ошибку при неудачном запросе', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(
        getForecastByCoords(0, 0)
      ).rejects.toThrow('Не удалось загрузить прогноз погоды');
    });

    it('должен использовать правильные единицы измерения', async () => {
      const mockForecastData = {
        hourly: {
          time: ['2024-01-15T12:00'],
          temperature_2m: [68],
          weather_code: [0],
        },
        daily: {
          time: ['2024-01-15'],
          temperature_2m_max: [75],
          temperature_2m_min: [60],
          weather_code: [0],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockForecastData,
      });

      await getForecastByCoords(40.7128, -74.006, 'imperial');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('temperature_unit=fahrenheit')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('forecast_days=7')
      );
    });
  });

  describe('searchCities', () => {
    it('должен успешно найти города по запросу', async () => {
      const mockSearchResults = {
        results: [
          {
            name: 'Москва',
            country: 'Россия',
            latitude: 55.7558,
            longitude: 37.6173,
          },
          {
            name: 'Московский',
            country: 'Россия',
            latitude: 55.6025,
            longitude: 37.3567,
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults,
      });

      const result = await searchCities('Москва');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'Москва',
        country: 'Россия',
        lat: 55.7558,
        lon: 37.6173,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('name=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('language=ru')
      );
    });

    it('должен вернуть пустой массив для короткого запроса', async () => {
      const result = await searchCities('М');
      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('должен вернуть пустой массив если результатов нет', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const result = await searchCities('НесуществующийГород123');
      expect(result).toEqual([]);
    });

    it('должен обработать города без country', async () => {
      const mockSearchResults = {
        results: [
          {
            name: 'Тестовый город',
            country_code: 'TC',
            latitude: 50.0,
            longitude: 30.0,
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults,
      });

      const result = await searchCities('Тест');

      expect(result[0].country).toBe('TC');
    });

    it('должен выбросить ошибку при неудачном запросе', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(
        searchCities('Москва')
      ).rejects.toThrow('Не удалось найти города');
    });
  });

  describe('getCityNameByCoords', () => {
    it('должен успешно получить название города по координатам', async () => {
      const mockNominatimData = {
        address: {
          city: 'Будапешт',
          country: 'Венгрия',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockNominatimData,
      });

      const result = await getCityNameByCoords(47.4979, 19.0402);

      expect(result).toEqual({
        name: 'Будапешт',
        country: 'Венгрия',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('nominatim.openstreetmap.org'),
        expect.objectContaining({
          headers: {
            'User-Agent': 'WeatherApp/1.0',
          },
        })
      );
    });

    it('должен использовать fallback при неудачном запросе Nominatim', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
      });

      const result = await getCityNameByCoords(47.5, 19.0);

      // Должен найти ближайший город из списка популярных
      expect(result.name).toBeTruthy();
      expect(result).toHaveProperty('country');
    });

    it('должен обработать различные типы населенных пунктов', async () => {
      const mockNominatimData = {
        address: {
          town: 'Тестовый город',
          country: 'Тестовая страна',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockNominatimData,
      });

      const result = await getCityNameByCoords(50.0, 30.0);

      expect(result.name).toBe('Тестовый город');
    });

    it('должен обработать village из Nominatim', async () => {
      const mockNominatimData = {
        address: {
          village: 'Деревня',
          country: 'Страна',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockNominatimData,
      });

      const result = await getCityNameByCoords(50.0, 30.0);

      expect(result.name).toBe('Деревня');
    });

    it('должен вернуть координаты если город слишком далеко', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      // Координаты посреди океана
      const result = await getCityNameByCoords(0.0, 0.0);

      // Должен вернуть координаты в формате строки
      expect(result.name).toMatch(/0\.\d{4}, 0\.\d{4}/);
      expect(result.country).toBe('');
    });

    it('должен обработать ошибку в данных Nominatim', async () => {
      const mockNominatimError = {
        error: 'Unable to geocode',
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockNominatimError,
        });

      const result = await getCityNameByCoords(47.5, 19.0);

      // Должен использовать fallback
      expect(result.name).toBeTruthy();
    });
  });

  describe('POPULAR_CITIES', () => {
    it('должен содержать список популярных городов', () => {
      expect(POPULAR_CITIES).toBeInstanceOf(Array);
      expect(POPULAR_CITIES.length).toBeGreaterThan(0);

      POPULAR_CITIES.forEach(city => {
        expect(city).toHaveProperty('name');
        expect(city).toHaveProperty('country');
        expect(city).toHaveProperty('lat');
        expect(city).toHaveProperty('lon');
        expect(typeof city.lat).toBe('number');
        expect(typeof city.lon).toBe('number');
      });
    });

    it('должен содержать Будапешт в списке', () => {
      const budapest = POPULAR_CITIES.find(city => city.name === 'Будапешт');
      expect(budapest).toBeDefined();
      expect(budapest?.country).toBe('Венгрия');
    });
  });
});
