// Градиенты для разных погодных условий
export const WeatherGradients = {
  clear: {
    light: ["#87CEEB", "#E0F6FF"] as const,
    dark: ["#0f0c29", "#302b63", "#24243e"] as const,
  },
  clouds: {
    light: ["#B0C4DE", "#D3D3D3"] as const,
    dark: ["#232526", "#414345"] as const,
  },
  rain: {
    light: ["#4A5568", "#718096"] as const,
    dark: ["#0f2027", "#203a43", "#2c5364"] as const,
  },
  snow: {
    light: ["#E6F3FF", "#FFFFFF"] as const,
    dark: ["#2c3e50", "#3498db"] as const,
  },
  thunderstorm: {
    light: ["#4A5568", "#2D3748"] as const,
    dark: ["#141E30", "#243B55"] as const,
  },
  fog: {
    light: ["#A8B2C1", "#D1D5DB"] as const,
    dark: ["#36454f", "#4a5568"] as const,
  },
};

export const Colors = {
  light: {
    background: "#fff",
    text: "#000",
    border: "#ddd",
    card: "rgba(255, 255, 255, 0.9)",
    tabBar: "rgba(255, 255, 255, 0.95)",
    statusBar: "#fff",
    input: "#f5f5f5",
    inputPlaceholder: "#888",
    button: "rgba(255, 255, 255, 0.8)",
    buttonText: "#000",
    loader: "#000",
  },
  dark: {
    background: "#000",
    text: "#fff",
    border: "rgba(255, 255, 255, 0.15)",
    card: "rgba(255, 255, 255, 0.1)",
    tabBar: "rgba(30, 30, 30, 0.95)",
    statusBar: "#1a1a1a",
    input: "rgba(255, 255, 255, 0.1)",
    inputPlaceholder: "#aaa",
    button: "rgba(255, 255, 255, 0.15)",
    buttonText: "#fff",
    loader: "#fff",
  },
};

export type ColorScheme = typeof Colors.light;

// Утилита для определения типа погоды по weatherCode
export const getWeatherType = (
  weatherCode: number,
): keyof typeof WeatherGradients => {
  if (weatherCode === 0 || weatherCode === 1) return "clear";
  if (weatherCode === 2 || weatherCode === 3) return "clouds";
  if (weatherCode >= 45 && weatherCode <= 48) return "fog";
  if (weatherCode >= 51 && weatherCode <= 67) return "rain";
  if (weatherCode >= 71 && weatherCode <= 77) return "snow";
  if (weatherCode >= 80 && weatherCode <= 86) return "rain";
  if (weatherCode >= 95 && weatherCode <= 99) return "thunderstorm";
  return "clear";
};
