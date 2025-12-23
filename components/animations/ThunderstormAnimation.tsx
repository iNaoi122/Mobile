import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

type LightningProps = {
  left: number;
  onComplete: () => void;
};

const Lightning: React.FC<LightningProps> = ({ left, onComplete }) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 50, easing: Easing.linear }),
      withTiming(0, { duration: 50, easing: Easing.linear }),
      withTiming(0.8, { duration: 50, easing: Easing.linear }),
      withTiming(0, { duration: 100, easing: Easing.linear })
    );

    const timer = setTimeout(onComplete, 250);
    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.lightning, { left }, animatedStyle]}>
      <View style={styles.lightningBolt} />
    </Animated.View>
  );
};

type ThunderstormAnimationProps = {
  intensity?: 'light' | 'medium' | 'heavy';
};

export const ThunderstormAnimation: React.FC<ThunderstormAnimationProps> = ({ intensity = 'medium' }) => {
  const [lightnings, setLightnings] = useState<{ id: number; left: number }[]>([]);
  const [nextId, setNextId] = useState(0);

  const frequency = intensity === 'light' ? 8000 : intensity === 'medium' ? 5000 : 3000;

  useEffect(() => {
    const interval = setInterval(() => {
      const randomLeft = Math.random() * (width - 40);
      setLightnings((prev) => [...prev, { id: nextId, left: randomLeft }]);
      setNextId((prev) => prev + 1);
    }, frequency);

    return () => clearInterval(interval);
  }, [frequency, nextId]);

  const removeLightning = (id: number) => {
    setLightnings((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {lightnings.map((lightning) => (
        <Lightning
          key={lightning.id}
          left={lightning.left}
          onComplete={() => removeLightning(lightning.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  lightning: {
    position: 'absolute',
    top: 0,
    width: 4,
    height: height * 0.4,
  },
  lightningBolt: {
    width: 4,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
});
