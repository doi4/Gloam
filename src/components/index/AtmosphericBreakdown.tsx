import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useGloamTheme } from '@/hooks/use-theme';

interface Props {
  cloudCover: number;
  visibility: number;
  vibrancy: number;
  humidity: number;
}

export function AtmosphericBreakdown({ cloudCover, visibility, vibrancy, humidity }: Props) {
  const { colors, isDark } = useGloamTheme();

  // Animated telemetry bars
  const animProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animProgress, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [animProgress]);

  const metrics = [
    {
      label: 'Color Vibrancy',
      value: `${vibrancy}%`,
      note: 'High saturation dusk flaring',
      percent: vibrancy,
      color: '#FF4B6E', // Sunset Rose
    },
    {
      label: 'Cloud Diffusion',
      value: `${cloudCover}%`,
      note: 'Optimal Rayleigh light scatter',
      percent: cloudCover,
      color: '#FF7A59', // Sunset Coral
    },
    {
      label: 'Atmospheric Visibility',
      value: `${visibility}%`,
      note: 'Crystal clear ocean horizon',
      percent: visibility,
      color: '#FFA726', // Warm Golden Hour
    },
    {
      label: 'Relative Humidity',
      value: `${humidity}%`,
      note: 'Minimal twilight marine haze',
      percent: humidity,
      color: '#BA68C8', // Dusk Violet
    },
  ];

  return (
    <View style={styles.container}>
      <ThemedText style={styles.sectionTitle}>
        ATMOSPHERIC TELEMETRY
      </ThemedText>

      <View style={styles.grid}>
        {metrics.map((m) => {
          const barWidth = animProgress.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', `${Math.min(100, Math.max(0, m.percent))}%`],
          });

          return (
            <View
              key={m.label}
              style={[
                styles.card,
                {
                  backgroundColor: '#120E19',
                  borderColor: 'rgba(255, 122, 89, 0.15)',
                },
              ]}>
              <View style={styles.cardHeader}>
                <ThemedText style={styles.cardLabel}>{m.label}</ThemedText>
                <ThemedText style={[styles.valueText, { color: m.color }]}>
                  {m.value}
                </ThemedText>
              </View>

              <View style={styles.track}>
                <Animated.View
                  style={[
                    styles.bar,
                    {
                      backgroundColor: m.color,
                      width: barWidth,
                    },
                  ]}
                />
              </View>

              <ThemedText style={[styles.noteText, { color: colors.textSecondary }]}>
                {m.note}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: Spacing.three,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#8E8E93',
    marginBottom: Spacing.two,
    marginLeft: 2,
  },
  grid: {
    gap: Spacing.two,
  },
  card: {
    padding: Spacing.three + 2,
    borderRadius: 22,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.one,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  valueText: {
    fontSize: 16,
    fontWeight: '900',
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1F1829',
    overflow: 'hidden',
    marginVertical: Spacing.one + 2,
  },
  bar: {
    height: '100%',
    borderRadius: 3,
  },
  noteText: {
    fontSize: 12,
  },
});
