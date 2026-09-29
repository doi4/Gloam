import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useGloamTheme, ThemeMode } from '@/hooks/use-theme';
import { AppIcon, IconName } from '@/components/ui/app-icon';

export default function SettingsScreen() {
  const {
    themeMode,
    setThemeMode,
    colors,
    isDark,
  } = useGloamTheme();

  // Notification toggles
  const [notifySunsetWarning, setNotifySunsetWarning] = useState(true);
  const [notifyPeakVibrancy, setNotifyPeakVibrancy] = useState(true);
  const [dailyDuskReminder, setDailyDuskReminder] = useState(true);

  // Camera & Location preferences
  const [highQualityUploads, setHighQualityUploads] = useState(true);
  const [autoTagLocation, setAutoTagLocation] = useState(true);

  const handleClearCache = () => {
    Alert.alert('Cache Cleared', 'Local photo and telemetry cache has been cleared.');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Top Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>SETTINGS</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Preferences & display options
          </ThemedText>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* User Profile Summary Card */}
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}>
            <View style={styles.profileLeft}>
              <View
                style={[
                  styles.avatarCircle,
                  { backgroundColor: isDark ? '#242424' : '#E5E5EA' },
                ]}>
                <AppIcon
                  name="user"
                  size={24}
                  color={isDark ? '#FFFFFF' : '#000000'}
                />
              </View>
              <View>
                <ThemedText style={styles.profileHandle}>@you</ThemedText>
                <ThemedText
                  style={[styles.profileSub, { color: colors.textSecondary }]}>
                  Sunset Hunter • 5-Day Sunset Streak
                </ThemedText>
              </View>
            </View>
            <View
              style={[
                styles.statPill,
                {
                  backgroundColor: isDark ? '#000000' : '#FFFFFF',
                  borderColor: colors.border,
                },
              ]}>
              <ThemedText style={styles.statNumber}>18</ThemedText>
              <ThemedText
                style={[styles.statLabel, { color: colors.textSecondary }]}>
                POSTS
              </ThemedText>
            </View>
          </View>

          {/* Section 1: Appearance & Theme */}
          <View style={styles.section}>
            <ThemedText
              style={[styles.sectionHeading, { color: colors.textSecondary }]}>
              APPEARANCE
            </ThemedText>

            {/* Theme Mode Selector (Dark vs Light vs System) */}
            <View
              style={[
                styles.themeSelector,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                },
              ]}>
              {(
                [
                  { key: 'dark', label: 'Dark Mode', icon: 'moon' as IconName },
                  { key: 'light', label: 'Light Mode', icon: 'sun' as IconName },
                  { key: 'system', label: 'System', icon: 'system' as IconName },
                ] as { key: ThemeMode; label: string; icon: IconName }[]
              ).map((mode) => {
                const isSelected = themeMode === mode.key;
                return (
                  <TouchableOpacity
                    key={mode.key}
                    onPress={() => setThemeMode(mode.key)}
                    style={[
                      styles.themeTab,
                      isSelected && [
                        styles.themeTabActive,
                        {
                          backgroundColor: isDark ? '#FFFFFF' : '#000000',
                        },
                      ],
                    ]}
                    activeOpacity={0.8}>
                    <AppIcon
                      name={mode.icon}
                      size={14}
                      color={
                        isSelected
                          ? isDark
                            ? '#000000'
                            : '#FFFFFF'
                          : colors.textSecondary
                      }
                    />
                    <ThemedText
                      style={[
                        styles.themeTabText,
                        {
                          color: isSelected
                            ? isDark
                              ? '#000000'
                              : '#FFFFFF'
                            : colors.textSecondary,
                          fontWeight: isSelected ? '800' : '600',
                        },
                      ]}>
                      {mode.label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Section 2: Sunset Alerts & Notifications */}
          <View style={styles.section}>
            <ThemedText
              style={[styles.sectionHeading, { color: colors.textSecondary }]}>
              SUNSET ALERTS
            </ThemedText>

            <View
              style={[
                styles.settingsCard,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                },
              ]}>
              <View style={styles.settingRowInner}>
                <View style={styles.settingTextCol}>
                  <ThemedText style={styles.settingTitle}>
                    30-Minute Sunset Warning
                  </ThemedText>
                  <ThemedText
                    style={[styles.settingDesc, { color: colors.textSecondary }]}>
                    Get notified before golden hour so you're ready to capture.
                  </ThemedText>
                </View>
                <Switch
                  value={notifySunsetWarning}
                  onValueChange={setNotifySunsetWarning}
                  trackColor={{ false: '#3A3A3C', true: isDark ? '#FFFFFF' : '#000000' }}
                  thumbColor={isDark ? '#000000' : '#FFFFFF'}
                />
              </View>

              <View
                style={[styles.rowDivider, { backgroundColor: colors.border }]}
              />

              <View style={styles.settingRowInner}>
                <View style={styles.settingTextCol}>
                  <ThemedText style={styles.settingTitle}>
                    Peak Vibrancy Alert
                  </ThemedText>
                  <ThemedText
                    style={[styles.settingDesc, { color: colors.textSecondary }]}>
                    Alert when atmospheric conditions indicate top 5% sunsets.
                  </ThemedText>
                </View>
                <Switch
                  value={notifyPeakVibrancy}
                  onValueChange={setNotifyPeakVibrancy}
                  trackColor={{ false: '#3A3A3C', true: isDark ? '#FFFFFF' : '#000000' }}
                  thumbColor={isDark ? '#000000' : '#FFFFFF'}
                />
              </View>

              <View
                style={[styles.rowDivider, { backgroundColor: colors.border }]}
              />

              <View style={styles.settingRowInner}>
                <View style={styles.settingTextCol}>
                  <ThemedText style={styles.settingTitle}>
                    Daily Dusk Reminder
                  </ThemedText>
                  <ThemedText
                    style={[styles.settingDesc, { color: colors.textSecondary }]}>
                    BeReal-style daily prompt when the sun dips below horizon.
                  </ThemedText>
                </View>
                <Switch
                  value={dailyDuskReminder}
                  onValueChange={setDailyDuskReminder}
                  trackColor={{ false: '#3A3A3C', true: isDark ? '#FFFFFF' : '#000000' }}
                  thumbColor={isDark ? '#000000' : '#FFFFFF'}
                />
              </View>
            </View>
          </View>

          {/* Section 3: Camera & Upload Preferences */}
          <View style={styles.section}>
            <ThemedText
              style={[styles.sectionHeading, { color: colors.textSecondary }]}>
              CAMERA & UPLOADS
            </ThemedText>

            <View
              style={[
                styles.settingsCard,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                },
              ]}>
              <View style={styles.settingRowInner}>
                <View style={styles.settingTextCol}>
                  <ThemedText style={styles.settingTitle}>
                    High-Quality Capture
                  </ThemedText>
                  <ThemedText
                    style={[styles.settingDesc, { color: colors.textSecondary }]}>
                    Store full-resolution phone camera photos on upload.
                  </ThemedText>
                </View>
                <Switch
                  value={highQualityUploads}
                  onValueChange={setHighQualityUploads}
                  trackColor={{ false: '#3A3A3C', true: isDark ? '#FFFFFF' : '#000000' }}
                  thumbColor={isDark ? '#000000' : '#FFFFFF'}
                />
              </View>

              <View
                style={[styles.rowDivider, { backgroundColor: colors.border }]}
              />

              <View style={styles.settingRowInner}>
                <View style={styles.settingTextCol}>
                  <ThemedText style={styles.settingTitle}>
                    Auto-Tag Location
                  </ThemedText>
                  <ThemedText
                    style={[styles.settingDesc, { color: colors.textSecondary }]}>
                    Attach nearest coastal or viewpoint tag to your post.
                  </ThemedText>
                </View>
                <Switch
                  value={autoTagLocation}
                  onValueChange={setAutoTagLocation}
                  trackColor={{ false: '#3A3A3C', true: isDark ? '#FFFFFF' : '#000000' }}
                  thumbColor={isDark ? '#000000' : '#FFFFFF'}
                />
              </View>
            </View>
          </View>

          {/* Section 4: Data & About */}
          <View style={styles.section}>
            <ThemedText
              style={[styles.sectionHeading, { color: colors.textSecondary }]}>
              DATA & SYSTEM
            </ThemedText>

            <TouchableOpacity
              onPress={handleClearCache}
              style={[
                styles.actionRow,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                },
              ]}
              activeOpacity={0.7}>
              <ThemedText style={styles.actionRowText}>
                Clear Cache & Offline Storage
              </ThemedText>
              <AppIcon name="chevron-right" size={14} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.aboutFooter}>
              <ThemedText
                style={[styles.aboutText, { color: colors.textSecondary }]}>
                GLOAM v1.0.0 • OLED EDITION
              </ThemedText>
              <ThemedText
                style={[styles.aboutSubText, { color: colors.textSecondary }]}>
                Pure OLED black contrast for twilight photography.
              </ThemedText>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six * 2,
  },
  profileCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: Spacing.four,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHandle: {
    fontSize: 16,
    fontWeight: '800',
  },
  profileSub: {
    fontSize: 12,
    marginTop: 2,
  },
  statPill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  section: {
    marginBottom: Spacing.four,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: Spacing.two,
    marginLeft: 4,
  },
  themeSelector: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    marginBottom: Spacing.two,
  },
  themeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 6,
  },
  themeTabActive: {
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  themeTabText: {
    fontSize: 13,
  },
  settingsCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRowInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three + 2,
  },
  settingTextCol: {
    flex: 1,
    paddingRight: Spacing.three,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  settingDesc: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  rowDivider: {
    height: 1,
    marginHorizontal: Spacing.three,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three + 2,
    borderRadius: 18,
    borderWidth: 1,
  },
  actionRowText: {
    fontSize: 14,
    fontWeight: '600',
  },
  aboutFooter: {
    alignItems: 'center',
    marginTop: Spacing.four,
    gap: 4,
  },
  aboutText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  aboutSubText: {
    fontSize: 11,
    textAlign: 'center',
  },
});
