import { AtmosphericBreakdown } from '@/components/index/AtmosphericBreakdown';
import { FiveDayForecast } from '@/components/index/FiveDayForecast';
import { SunsetIndexGauge } from '@/components/index/SunsetIndexGauge';
import { SkyBackground } from '@/components/sky-background';
import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { Spacing } from '@/constants/theme';
import { useGloamTheme } from '@/hooks/use-theme';
import { DeviceLocation, locationService } from '@/services/location-service';
import { SunsetData } from '@/services/mock-data';
import { useEffect, useRef, useState } from 'react';
import { Animated, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ForecastScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useGloamTheme();

  // Real device location and real sunset data from locationService
  const [deviceLocation, setDeviceLocation] = useState<DeviceLocation>(() =>
    locationService.getLocation()
  );
  const [sunset, setSunset] = useState<SunsetData>(() =>
    locationService.getSunset()
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsub = locationService.subscribe(({ location, sunset: liveSunset }) => {
      setDeviceLocation(location);
      setSunset(liveSunset);
    });
    return unsub;
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await locationService.initializeLocation();
    setSunset(locationService.getSunset());
    setDeviceLocation(locationService.getLocation());
    setRefreshing(false);
  };

  // Scroll tracking for extended multi-phase header fading
  const scrollY = useRef(new Animated.Value(0)).current;

  // Phase 1 (scrollY 0 -> 80): Banner background fades out completely
  const bannerBgOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Phase 2 & 3: Text & title remain visible while background is transparent, then fade past 130
  const textOpacity = scrollY.interpolate({
    inputRange: [0, 130, 210],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  const textTranslateY = scrollY.interpolate({
    inputRange: [0, 130, 210],
    outputRange: [0, 0, -30],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <SkyBackground />

      {/* Whole Top Banner Spot (Bigger with multi-phase scroll animation) */}
      <View style={styles.topBannerSpot}>
        {/* Layer 1: Solid Black Rounded Banner Background (Fades out first on scroll) */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            styles.bannerBackground,
            { opacity: bannerBgOpacity },
          ]}
        />

        {/* Layer 2: Banner Content (Fades out later) */}
        <Animated.View
          style={[
            styles.bannerContent,
            {
              paddingTop: insets.top + 8,
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}>
          <View style={styles.forecastBar}>
            <View style={styles.headerTitleRow}>
              <AppIcon name="sun" size={18} color="#FF7A59" />
              <ThemedText style={styles.headerTitle}>FORECAST</ThemedText>
            </View>
            <ThemedText style={styles.headerSubtitle}>
              Atmospheric Dusk Telemetry
            </ThemedText>
          </View>
        </Animated.View>
      </View>

      <Animated.ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 84, // Adjusted for bigger header
          },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
            progressViewOffset={insets.top + 84}
          />
        }>
        {/* Sunset Hero Location Banner with Rounded Corners */}
        <View style={styles.heroLocationCard}>
          <View style={styles.locationLeft}>
            <View style={styles.locationIconWrap}>
              <AppIcon name="location" size={16} color="#FF7A59" />
            </View>
            <View>
              <ThemedText style={styles.locationCity}>
                {deviceLocation.locationName}
              </ThemedText>
              <ThemedText style={styles.locationDetail}>
                Current Location • Auto-detected via GPS
              </ThemedText>
            </View>
          </View>

          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <ThemedText style={styles.liveText}>LIVE</ThemedText>
          </View>
        </View>

        {/* Basic Weather Info Card */}
        {sunset.temperature !== undefined && (
          <View style={styles.weatherCard}>
            <View style={styles.weatherInfoLeft}>
              <AppIcon name="sun" size={24} color="#FFA726" />
              <View>
                <ThemedText style={styles.weatherTemp}>
                  {Math.round(sunset.temperature)}°F
                </ThemedText>
                <ThemedText style={styles.weatherDesc}>
                  Current Temperature
                </ThemedText>
              </View>
            </View>
            <View style={styles.weatherInfoRight}>
              <View style={styles.weatherMetric}>
                <ThemedText style={styles.weatherMetricLabel}>Humidity</ThemedText>
                <ThemedText style={styles.weatherMetricValue}>{sunset.humidity}%</ThemedText>
              </View>
            </View>
          </View>
        )}

        {/* Animated Sunset Index Gauge with Pulsing Breathing Rings */}
        <SunsetIndexGauge score={sunset.index} ratingLabel={sunset.ratingLabel} />

        {/* Golden Hour & Sunset Dusk Timing Card with Rounded Corners */}
        <View style={styles.timingCard}>
          <View style={styles.timingCol}>
            <View style={styles.timingHeaderRow}>
              <AppIcon name="sun" size={14} color="#FFA726" />
              <ThemedText style={styles.timingLabel}>GOLDEN HOUR</ThemedText>
            </View>
            <ThemedText style={[styles.timingValue, { color: '#FFA726' }]}>
              {sunset.goldenHourStart} - {sunset.goldenHourEnd}
            </ThemedText>
            <ThemedText style={styles.timingSubtext}>Prime warm light</ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={styles.timingCol}>
            <View style={styles.timingHeaderRow}>
              <AppIcon name="sun" size={14} color="#FF7A59" />
              <ThemedText style={styles.timingLabel}>SUNSET DUSK</ThemedText>
            </View>
            <ThemedText style={[styles.timingValue, { color: '#FF7A59' }]}>
              {sunset.sunsetTime}
            </ThemedText>
            <ThemedText style={styles.timingSubtext}>Horizon dip</ThemedText>
          </View>
        </View>

        {/* Animated Atmospheric Telemetry with Real Solar Data */}
        <AtmosphericBreakdown
          cloudCover={sunset.cloudCover}
          visibility={sunset.visibility}
          vibrancy={sunset.vibrancy}
          humidity={sunset.humidity}
        />

        {/* Real 5-Day Sunset Outlook */}
        <FiveDayForecast forecasts={sunset.forecastNext5Days} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topBannerSpot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingBottom: 14,
  },
  bannerBackground: {
    backgroundColor: '#000',
    borderBottomLeftRadius: 32, // Rounded background corners
    borderBottomRightRadius: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  bannerContent: {
    paddingHorizontal: 16,
  },
  forecastBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 3,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six * 2,
  },
  heroLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three + 2,
    borderRadius: 26,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 89, 0.22)',
    marginBottom: Spacing.two,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 2,
  },
  locationIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationCity: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  locationDetail: {
    fontSize: 11,
    marginTop: 2,
    color: '#8E8E93',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#000',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF7A59',
  },
  liveText: {
    color: '#FFA07A',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  weatherCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 22,
    padding: Spacing.four,
    marginBottom: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  weatherInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  weatherTemp: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  weatherDesc: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  weatherInfoRight: {
    alignItems: 'flex-end',
  },
  weatherMetric: {
    alignItems: 'center',
  },
  weatherMetricLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 2,
  },
  weatherMetricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timingCard: {
    flexDirection: 'row',
    borderRadius: 26,
    padding: Spacing.four,
    marginVertical: Spacing.two,
    alignItems: 'center',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 89, 0.18)',
  },
  timingCol: {
    flex: 1,
    alignItems: 'center',
  },
  timingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  divider: {
    width: 1,
    height: 48,
    backgroundColor: '#000',
  },
  timingLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#8E8E93',
  },
  timingValue: {
    fontSize: 17,
    fontWeight: '900',
  },
  timingSubtext: {
    fontSize: 11,
    color: '#666666',
    marginTop: 2,
  },
});
