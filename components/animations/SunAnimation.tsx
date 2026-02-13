import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

type SunAnimationProps = {
  isDark?: boolean;
};

export const SunAnimation: React.FC<SunAnimationProps> = ({ isDark = false }) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 30000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    scale.value = withRepeat(
      withTiming(1.1, {
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedRaysStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  const sunColor = isDark ? 'rgba(255, 223, 128, 0.3)' : 'rgba(255, 223, 128, 0.8)';
  const raysColor = isDark ? 'rgba(255, 223, 128, 0.2)' : 'rgba(255, 223, 128, 0.5)';

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.sunContainer}>
        {/* Rays */}
        <Animated.View style={[styles.rays, animatedRaysStyle]}>
          {Array.from({ length: 12 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.ray,
                {
                  backgroundColor: raysColor,
                  transform: [{ rotate: `${i * 30}deg` }],
                },
              ]}
            />
          ))}
        </Animated.View>

        {/* Sun circle */}
        <View style={[styles.sun, { backgroundColor: sunColor }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  sunContainer: {
    position: 'absolute',
    top: 60,
    right: 40,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sun: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  rays: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ray: {
    position: 'absolute',
    width: 4,
    height: 30,
    borderRadius: 2,
    top: -10,
  },
});
