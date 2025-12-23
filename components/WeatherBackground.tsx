import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RainAnimation } from './animations/RainAnimation';
import { SnowAnimation } from './animations/SnowAnimation';
import { CloudsAnimation } from './animations/CloudsAnimation';
import { SunAnimation } from './animations/SunAnimation';
import { ThunderstormAnimation } from './animations/ThunderstormAnimation';
import { WeatherGradients, getWeatherType } from '../constants/colors';
import { useSettings } from '../contexts/SettingsContext';

type WeatherBackgroundProps = {
  weatherCode?: number;
  children: React.ReactNode;
};

const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ weatherCode, children }) => {
  const { theme } = useSettings();

  // Если нет кода погоды, используем стандартный фон
  if (weatherCode === undefined) {
    const gradientColors = WeatherGradients.clear[theme];
    return (
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <CloudsAnimation density="light" isDark={theme === 'dark'} />
        {children}
      </LinearGradient>
    );
  }

  const weatherType = getWeatherType(weatherCode);
  const gradientColors = WeatherGradients[weatherType][theme];

  const renderWeatherAnimation = () => {
    switch (weatherType) {
      case 'clear':
        return (
          <>
            <SunAnimation isDark={theme === 'dark'} />
            <CloudsAnimation density="light" isDark={theme === 'dark'} />
          </>
        );

      case 'clouds':
        return <CloudsAnimation density="medium" isDark={theme === 'dark'} />;

      case 'rain':
        if (weatherCode >= 61 && weatherCode <= 65) {
          // Дождь
          const intensity = weatherCode === 61 ? 'light' : weatherCode === 63 ? 'medium' : 'heavy';
          return (
            <>
              <CloudsAnimation density="heavy" isDark={theme === 'dark'} />
              <RainAnimation intensity={intensity} />
            </>
          );
        } else if (weatherCode >= 51 && weatherCode <= 57) {
          // Морось
          return (
            <>
              <CloudsAnimation density="medium" isDark={theme === 'dark'} />
              <RainAnimation intensity="light" />
            </>
          );
        } else {
          // Ливень
          return (
            <>
              <CloudsAnimation density="heavy" isDark={theme === 'dark'} />
              <RainAnimation intensity="heavy" />
            </>
          );
        }

      case 'snow':
        const snowIntensity = weatherCode === 71 ? 'light' : weatherCode === 73 ? 'medium' : 'heavy';
        return (
          <>
            <CloudsAnimation density="heavy" isDark={theme === 'dark'} />
            <SnowAnimation intensity={snowIntensity} />
          </>
        );

      case 'thunderstorm':
        return (
          <>
            <CloudsAnimation density="heavy" isDark={theme === 'dark'} />
            <RainAnimation intensity="heavy" />
            <ThunderstormAnimation intensity="medium" />
          </>
        );

      case 'fog':
        return <CloudsAnimation density="heavy" isDark={theme === 'dark'} />;

      default:
        return <CloudsAnimation density="light" isDark={theme === 'dark'} />;
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
