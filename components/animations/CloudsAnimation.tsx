import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

type CloudProps = {
  delay: number;
  top: number;
  size: number;
  duration: number;
  opacity: number;
  isDark: boolean;
};

const Cloud: React.FC<CloudProps> = ({
  delay,
  top,
  size,
  duration,
  opacity,
  isDark,
}) => {
  const translateX = useSharedValue(-size);

  useEffect(() => {
    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming(width + size, {
          duration,
          easing: Easing.linear,
        }),
        -1,
        false,
      ),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const cloudColor = isDark
    ? "rgba(255, 255, 255, 0.15)"
    : "rgba(255, 255, 255, 0.7)";

  return (
    <Animated.View
      style={[
        styles.cloud,
        {
          top,
          width: size,
          height: size * 0.6,
          opacity,
        },
        animatedStyle,
      ]}
    >
      <View
        style={[
          styles.cloudPart,
          {
            width: size * 0.5,
            height: size * 0.5,
            left: 0,
            backgroundColor: cloudColor,
          },
        ]}
      />
      <View
        style={[
          styles.cloudPart,
          {
            width: size * 0.6,
            height: size * 0.6,
            left: size * 0.3,
            backgroundColor: cloudColor,
          },
        ]}
      />
      <View
        style={[
          styles.cloudPart,
          {
            width: size * 0.5,
            height: size * 0.5,
            left: size * 0.5,
            backgroundColor: cloudColor,
          },
        ]}
      />
    </Animated.View>
  );
};

type CloudsAnimationProps = {
  density?: "light" | "medium" | "heavy";
  isDark?: boolean;
};

export const CloudsAnimation: React.FC<CloudsAnimationProps> = ({
  density = "medium",
  isDark = false,
}) => {
  const cloudCount = density === "light" ? 3 : density === "medium" ? 5 : 7;

  const clouds = Array.from({ length: cloudCount }, (_, i) => ({
    id: i,
    top: Math.random() * (height * 0.4),
    size: 80 + Math.random() * 120,
    delay: Math.random() * 5000,
    duration: 20000 + Math.random() * 15000,
    opacity: 0.3 + Math.random() * 0.3,
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {clouds.map((cloud) => (
        <Cloud
          key={cloud.id}
          top={cloud.top}
          size={cloud.size}
          delay={cloud.delay}
          duration={cloud.duration}
          opacity={cloud.opacity}
          isDark={isDark}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  cloud: {
    position: "absolute",
  },
  cloudPart: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 100,
  },
});
