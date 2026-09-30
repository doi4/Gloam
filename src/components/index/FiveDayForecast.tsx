import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useGloamTheme } from '@/hooks/use-theme';
import { DailyForecast } from '@/services/mock-data';
import { AppIcon } from '@/components/ui/app-icon';

interface Props {
  forecasts: DailyForecast[];
}

export function FiveDayForecast({ forecasts }: Props) {
  const { colors, isDark } = useGloamTheme();

  // Harmonious sunset color palette
  const getSunsetScoreColor = (index: number) => {
    const palette = ['#FF4B6E', '#FF5E62', '#FF7A59', '#FFA726', '#FF8A65'];
    return palette[index % palette.length];
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <AppIcon name="calendar" size={16} color="#FF7A59" />
          <ThemedText style={styles.sectionTitle}>5-DAY SUNSET OUTLOOK</ThemedText>
        </View>
        <ThemedText style={styles.subLabel}>
          Daily atmospheric projection
        </ThemedText>
      </View>

      <View style={styles.list}>
        {forecasts.map((item, index) => {
          const scoreColor = getSunsetScoreColor(index);
          return (
            <View
              key={item.id || index}
              style={[
                styles.card,
                {
                  backgroundColor: '#000',
                  borderColor: 'rgba(255, 122, 89, 0.15)',
                },
              ]}>
              {/* Day & Date */}
              <View style={styles.dayCol}>
                <ThemedText style={styles.dayLabel}>{item.dayLabel}</ThemedText>
                <ThemedText style={styles.dateLabel}>{item.dateLabel}</ThemedText>
              </View>

              {/* Timing & Rating */}
              <View style={styles.detailCol}>
                <View style={styles.timeRow}>
                  <AppIcon name="sun" size={13} color={scoreColor} />
                  <ThemedText style={styles.timeText}>{item.sunsetTime}</ThemedText>
                </View>
                <ThemedText style={styles.ratingText}>
                  {item.ratingLabel}
                </ThemedText>
              </View>

              {/* Score Pill */}
              <View style={styles.scoreCol}>
                <View
                  style={[
                    styles.scorePill,
                    {
                      backgroundColor: 'rgba(255, 122, 89, 0.12)',
                      borderColor: scoreColor,
                    },
                  ]}>
                  <ThemedText style={[styles.scoreNumber, { color: scoreColor }]}>
                    {item.index}
                  </ThemedText>
                </View>
                <ThemedText style={styles.vibrancyText}>
                  {item.vibrancy}% Vibe
                </ThemedText>
              </View>
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
    marginTop: Spacing.four,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#8E8E93',
  },
  subLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  list: {
    gap: Spacing.two,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three + 2,
    paddingVertical: Spacing.three,
    borderRadius: 22,
    borderWidth: 1,
  },
  dayCol: {
    width: 90,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dateLabel: {
    fontSize: 12,
    marginTop: 2,
    color: '#8E8E93',
  },
  detailCol: {
    flex: 1,
    paddingHorizontal: Spacing.two,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ratingText: {
    fontSize: 12,
    marginTop: 2,
    color: '#8E8E93',
  },
  scoreCol: {
    alignItems: 'flex-end',
    width: 60,
  },
  scorePill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 13,
    fontWeight: '900',
  },
  vibrancyText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
    color: '#8E8E93',
  },
});
