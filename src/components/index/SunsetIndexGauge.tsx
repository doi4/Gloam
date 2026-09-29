import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useGloamTheme } from '@/hooks/use-theme';

interface Props {
  score: number;
  ratingLabel: string;
}

export function SunsetIndexGauge({ score, ratingLabel }: Props) {
  const { colors, isDark } = useGloamTheme();

  // Breathing / pulsing aura animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.15)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: 2800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.35,
            duration: 2800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 2800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.15,
            duration: 2800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, [pulseAnim, glowAnim]);

  return (
    <View style={styles.container}>
      {/* Outer Breathing Sunset Aura Ring */}
      <Animated.View
        style={[
          styles.outerAura,
          {
            transform: [{ scale: pulseAnim }],
            borderColor: 'rgba(255, 122, 89, 0.3)',
          },
        ]}>
        {/* Mid Sunset Glow Ring */}
        <Animated.View
          style={[
            styles.midGlowRing,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0.15, 0.35],
                outputRange: [0.8, 1.0],
              }),
            },
          ]}>
          {/* Core Gauge Ring */}
          <View style={styles.coreGauge}>
            <ThemedText style={styles.scoreText}>{score}</ThemedText>
            <ThemedText style={styles.scaleText}>/ 100</ThemedText>
            <ThemedText style={styles.subLabel}>ATMOSPHERIC INDEX</ThemedText>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Rating Title & Gradient-Toned Badge */}
      <View style={styles.labelContainer}>
        <ThemedText style={styles.ratingTitle}>{ratingLabel}</ThemedText>
        <View style={styles.tierBadge}>
          <View style={styles.glowDot} />
          <ThemedText style={styles.tierBadgeText}>
            OPTIMAL DUSK CONDITIONS
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: Spacing.four,
  },
  outerAura: {
    width: 228,
    height: 228,
    borderRadius: 114,
    backgroundColor: 'rgba(255, 107, 74, 0.07)',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  midGlowRing: {
    width: 198,
    height: 198,
    borderRadius: 99,
    backgroundColor: 'rgba(255, 122, 89, 0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255, 122, 89, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coreGauge: {
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: '#130E1B',
    borderWidth: 3.5,
    borderColor: '#FF7A59',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B4A',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  scoreText: {
    fontSize: 58,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 64,
    letterSpacing: -1.5,
  },
  scaleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFA07A',
    marginTop: -2,
  },
  subLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#FF8A65',
    marginTop: 4,
  },
  labelContainer: {
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  ratingTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  tierBadge: {
    marginTop: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.three + 2,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 122, 89, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 89, 0.3)',
  },
  glowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF7A59',
  },
  tierBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#FFA07A',
  },
});
