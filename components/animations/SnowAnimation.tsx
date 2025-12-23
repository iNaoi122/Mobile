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

type SnowFlakeProps = {
  delay: number;
  left: number;
  duration: number;
  size: number;
  horizontalOffset: number;
};

const SnowFlake: React.FC<SnowFlakeProps> = ({
  delay,
  left,
  duration,
  size,
  horizontalOffset,
}) => {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(height + 20, {
          duration,
          easing: Easing.linear,
        }),
        -1,
        false,
      ),
    );

    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming(horizontalOffset, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.flake,
        {
          left,
          width: size,
          height: size,
        },
        animatedStyle,
      ]}
    />
  );
};

type SnowAnimationProps = {
  intensity?: "light" | "medium" | "heavy";
};

export const SnowAnimation: React.FC<SnowAnimationProps> = ({
  intensity = "medium",
}) => {
  const flakeCount =
    intensity === "light" ? 20 : intensity === "medium" ? 40 : 60;

  const flakes = Array.from({ length: flakeCount }, (_, i) => ({
    id: i,
    left: Math.random() * width,
    delay: Math.random() * 2000,
    duration: 3000 + Math.random() * 2000,
    size: 4 + Math.random() * 4,
    horizontalOffset: -20 + Math.random() * 40,
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {flakes.map((flake) => (
        <SnowFlake
          key={flake.id}
          left={flake.left}
          delay={flake.delay}
          duration={flake.duration}
          size={flake.size}
          horizontalOffset={flake.horizontalOffset}
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
  flake: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 100,
    shadowColor: "rgba(255, 255, 255, 0.8)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 3,
  },
});
