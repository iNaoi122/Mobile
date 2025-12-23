import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { RainAnimation } from "./animations/RainAnimation";
import { SnowAnimation } from "./animations/SnowAnimation";
import { CloudsAnimation } from "./animations/CloudsAnimation";
import { SunAnimation } from "./animations/SunAnimation";
import { ThunderstormAnimation } from "./animations/ThunderstormAnimation";
import { WeatherGradients, getWeatherType } from "../constants/colors";
import { useSettings } from "../contexts/SettingsContext";
import { useWeather } from "../contexts/WeatherContext";

type WeatherBackgroundProps = {
  weatherCode?: number;
  children: React.ReactNode;
};

const WeatherBackground: React.FC<WeatherBackgroundProps> = ({
  weatherCode,
  children,
}) => {
  const { theme } = useSettings();
  const { lastKnownWeatherCode } = useWeather();

  // Используем переданный weatherCode, если нет - fallback на последний известный, если и его нет - используем clear
  const effectiveWeatherCode = weatherCode ?? lastKnownWeatherCode;

  // Если нет кода погоды (даже последнего известного), используем стандартный фон
  if (effectiveWeatherCode === undefined) {
    const gradientColors = WeatherGradients.clear[theme];
    return (
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <CloudsAnimation density="light" isDark={theme === "dark"} />
        {children}
      </LinearGradient>
    );
  }

  const weatherType = getWeatherType(effectiveWeatherCode);
  const gradientColors = WeatherGradients[weatherType][theme];

  const renderWeatherAnimation = () => {
    switch (weatherType) {
      case "clear":
        return (
          <>
            <SunAnimation isDark={theme === "dark"} />
            <CloudsAnimation density="light" isDark={theme === "dark"} />
          </>
        );

      case "clouds":
        return <CloudsAnimation density="medium" isDark={theme === "dark"} />;

      case "rain":
        if (effectiveWeatherCode >= 61 && effectiveWeatherCode <= 65) {
          // Дождь
          const intensity =
            effectiveWeatherCode === 61
              ? "light"
              : effectiveWeatherCode === 63
                ? "medium"
                : "heavy";
          return (
            <>
              <CloudsAnimation density="heavy" isDark={theme === "dark"} />
              <RainAnimation intensity={intensity} />
            </>
          );
        } else if (effectiveWeatherCode >= 51 && effectiveWeatherCode <= 57) {
          // Морось
          return (
            <>
              <CloudsAnimation density="medium" isDark={theme === "dark"} />
              <RainAnimation intensity="light" />
            </>
          );
        } else {
          // Ливень
          return (
            <>
              <CloudsAnimation density="heavy" isDark={theme === "dark"} />
              <RainAnimation intensity="heavy" />
            </>
          );
        }

      case "snow":
        const snowIntensity =
          effectiveWeatherCode === 71
            ? "light"
            : effectiveWeatherCode === 73
              ? "medium"
              : "heavy";
        return (
          <>
            <CloudsAnimation density="heavy" isDark={theme === "dark"} />
            <SnowAnimation intensity={snowIntensity} />
          </>
        );

      case "thunderstorm":
        return (
          <>
            <CloudsAnimation density="heavy" isDark={theme === "dark"} />
            <RainAnimation intensity="heavy" />
            <ThunderstormAnimation intensity="medium" />
          </>
        );

      case "fog":
        return <CloudsAnimation density="heavy" isDark={theme === "dark"} />;

      default:
        return <CloudsAnimation density="light" isDark={theme === "dark"} />;
    }
  };

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      {renderWeatherAnimation()}
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});

export default WeatherBackground;
