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

type RainDropProps = {
  delay: number;
  left: number;
  duration: number;
};

const RainDrop: React.FC<RainDropProps> = ({ delay, left, duration }) => {
  const translateY = useSharedValue(-20);

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
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.drop,
        {
          left,
        },
        animatedStyle,
      ]}
    />
  );
};

type RainAnimationProps = {
  intensity?: "light" | "medium" | "heavy";
};

export const RainAnimation: React.FC<RainAnimationProps> = ({
  intensity = "medium",
}) => {
  const dropCount =
    intensity === "light" ? 30 : intensity === "medium" ? 50 : 80;

  const drops = Array.from({ length: dropCount }, (_, i) => ({
    id: i,
    left: Math.random() * width,
    delay: Math.random() * 1000,
    duration: 800 + Math.random() * 400,
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {drops.map((drop) => (
        <RainDrop
          key={drop.id}
          left={drop.left}
          delay={drop.delay}
          duration={drop.duration}
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
  drop: {
    position: "absolute",
    width: 2,
    height: 15,
    backgroundColor: "rgba(174, 194, 224, 0.7)",
    borderRadius: 1,
    shadowColor: "rgba(174, 194, 224, 0.5)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 2,
  },
});
