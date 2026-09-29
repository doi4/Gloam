import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { SunsetFeedCard } from '@/components/feed/SunsetFeedCard';
import { socialService } from '@/services/social-service';
import { locationService, DeviceLocation } from '@/services/location-service';
import {
  Post,
  SunsetData,
  GLOBAL_HOTSPOTS,
} from '@/services/mock-data';
import { useGloamTheme } from '@/hooks/use-theme';
import { AppIcon } from '@/components/ui/app-icon';

type FeedTab = 'friends' | 'local' | 'global';

export default function FeedHomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useGloamTheme();

  // Scroll tracking for extended multi-phase header fading
  const scrollY = useRef(new Animated.Value(0)).current;

  // Real device location & live atmospheric sunset telemetry
  const [deviceLocation, setDeviceLocation] = useState<DeviceLocation>(() =>
    locationService.getLocation()
  );
  const [sunsetData, setSunsetData] = useState<SunsetData>(() =>
    locationService.getSunset()
  );

  useEffect(() => {
    const unsub = locationService.subscribe(({ location, sunset }) => {
      setDeviceLocation(location);
      setSunsetData(sunset);
    });
    return unsub;
  }, []);

  // 3-way toggle: Friends vs Local vs Global
  const [activeTab, setActiveTab] = useState<FeedTab>('friends');
  const [selectedHotspot, setSelectedHotspot] = useState('All Hotspots');
  const [refreshing, setRefreshing] = useState(false);

  // Synchronize tab if navigated with query params
  useEffect(() => {
    if (params.tab === 'local') {
      setActiveTab('local');
    } else if (params.tab === 'global') {
      setActiveTab('global');
    } else if (params.tab === 'friends') {
      setActiveTab('friends');
    }
  }, [params.tab]);

  // Feed posts state
  const [friendsPosts, setFriendsPosts] = useState<Post[]>(() =>
    socialService.getFriendsPosts()
  );
  const [localPosts, setLocalPosts] = useState<Post[]>(() =>
    socialService.getLocalPosts()
  );
  const [globalPosts, setGlobalPosts] = useState<Post[]>(() =>
    socialService.getGlobalPosts(selectedHotspot)
  );

  useEffect(() => {
    const updatePosts = () => {
      setFriendsPosts(socialService.getFriendsPosts());
      setLocalPosts(socialService.getLocalPosts());
      setGlobalPosts(socialService.getGlobalPosts(selectedHotspot));
    };
    updatePosts();
    const unsubscribe = socialService.subscribe(updatePosts);
    return unsubscribe;
  }, [selectedHotspot]);

  const onRefresh = async () => {
    setRefreshing(true);
    await locationService.initializeLocation();
    setFriendsPosts(socialService.getFriendsPosts());
    setLocalPosts(socialService.getLocalPosts());
    setGlobalPosts(socialService.getGlobalPosts(selectedHotspot));
    setRefreshing(false);
  };

  const getDisplayedPosts = (): Post[] => {
    if (activeTab === 'friends') return friendsPosts;
    if (activeTab === 'local') return localPosts;
    return globalPosts;
  };

  const displayedPosts = getDisplayedPosts();

  // Multi-Phase Scroll-Driven Header Animation:
  // Phase 1 (scrollY 0 -> 80): Banner background fades out completely
  const bannerBgOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Phase 1 (scrollY 0 -> 80): Background elements behind text (pills/borders) fade out
  const elementsBgOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Phase 2 & 3: Between scrollY 80 and 130, banner background & element backgrounds are 0,
  // but text & icons stay visible!
  // Then past scrollY 130 -> 210, the text itself fades out and translates up
  const textOpacity = scrollY.interpolate({
    inputRange: [0, 130, 210],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  const textTranslateY = scrollY.interpolate({
    inputRange: [0, 130, 210],
    outputRange: [0, 0, -32],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Whole Top Banner Spot (Bigger section with multi-phase scroll animation) */}
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

        {/* Layer 2: Banner Content (GLOAM row & separated toggle row) */}
        <Animated.View
          style={[
            styles.bannerContent,
            {
              paddingTop: insets.top + 8,
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}>
          {/* Row 1: GLOAM Bar (Glance on left, GLOAM center, Settings on right) */}
          <View style={styles.gloamBar}>
            {/* Left: Atmospheric Index Glance */}
            <TouchableOpacity
              onPress={() => router.push('/forecast')}
              style={styles.glanceTouchWrapper}
              activeOpacity={0.7}>
              {/* Animated background element behind glance */}
              <Animated.View
                pointerEvents="none"
                style={[
                  StyleSheet.absoluteFill,
                  styles.glanceBgElement,
                  { opacity: elementsBgOpacity },
                ]}
              />
              <View style={styles.glanceInnerContent}>
                <AppIcon name="sun" size={17} color="#FF9500" />
                <ThemedText style={styles.glanceText}>
                  {sunsetData.index}
                </ThemedText>
              </View>
            </TouchableOpacity>

            {/* Center Brand Title */}
            <ThemedText style={styles.brandTitle}>GLOAM</ThemedText>

            {/* Right: Enlarged Prominent Settings Button */}
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              style={styles.settingsTouchWrapper}
              activeOpacity={0.7}>
              {/* Animated background element behind settings button */}
              <Animated.View
                pointerEvents="none"
                style={[
                  StyleSheet.absoluteFill,
                  styles.settingsBgElement,
                  { opacity: elementsBgOpacity },
                ]}
              />
              <AppIcon name="settings" size={21} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Row 2: Separated Friends | Local | Global Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.segmentedControlWrap}>
              {/* Animated background element behind segmented control */}
              <Animated.View
                pointerEvents="none"
                style={[
                  StyleSheet.absoluteFill,
                  styles.segmentedBgElement,
                  { opacity: elementsBgOpacity },
                ]}
              />

              {(['friends', 'local', 'global'] as FeedTab[]).map((tab) => {
                const isSelected = activeTab === tab;
                const label =
                  tab === 'friends'
                    ? 'Friends'
                    : tab === 'local'
                    ? 'Local'
                    : 'Global';

                return (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    activeOpacity={0.8}
                    style={styles.segmentTab}>
                    {/* Animated background for selected tab */}
                    {isSelected ? (
                      <Animated.View
                        pointerEvents="none"
                        style={[
                          StyleSheet.absoluteFill,
                          styles.activeTabPillBg,
                          { opacity: elementsBgOpacity },
                        ]}
                      />
                    ) : null}
                    <ThemedText
                      style={[
                        styles.segmentText,
                        {
                          color: isSelected ? '#FFFFFF' : '#8E8E93',
                          fontWeight: isSelected ? '800' : '600',
                        },
                      ]}>
                      {label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Edge-to-Edge Feed with Full Bleed Scroll Underneath Header */}
      <Animated.FlatList
        data={displayedPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SunsetFeedCard post={item} />}
        contentContainerStyle={[
          styles.feedContent,
          {
            paddingTop: insets.top + 138, // Adjusted for the bigger top banner section
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
            progressViewOffset={insets.top + 138}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Local Feed: Live Real-World Location Status Pill */}
            {activeTab === 'local' ? (
              <View style={styles.localInfoBanner}>
                <View style={styles.localCityRow}>
                  <AppIcon name="location" size={13} color="#FF5E3A" />
                  <ThemedText style={styles.localCityText}>
                    {deviceLocation.locationName}
                  </ThemedText>
                </View>
                <ThemedText style={styles.localSubtext}>
                  Real-time nearby dusk posts • GPS
                </ThemedText>
              </View>
            ) : null}

            {/* Global Feed: World Hotspot Filter Chips */}
            {activeTab === 'global' ? (
              <View style={styles.filterBar}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterScroll}>
                  {GLOBAL_HOTSPOTS.map((hotspot) => {
                    const isSelected = selectedHotspot === hotspot;
                    return (
                      <TouchableOpacity
                        key={hotspot}
                        onPress={() => setSelectedHotspot(hotspot)}
                        style={[
                          styles.filterChip,
                          isSelected && styles.filterChipActive,
                        ]}
                        activeOpacity={0.7}>
                        {hotspot !== 'All Hotspots' ? (
                          <AppIcon
                            name="globe"
                            size={12}
                            color={isSelected ? '#000000' : '#8E8E93'}
                            style={{ marginRight: 4 }}
                          />
                        ) : null}
                        <ThemedText
                          style={[
                            styles.filterChipText,
                            isSelected && styles.filterChipTextActive,
                          ]}>
                          {hotspot}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}

            {/* Friends Feed: BeReal "DUSK ALERT" Banner */}
            {activeTab === 'friends' ? (
              <View style={styles.promptBanner}>
                <View style={styles.promptLeft}>
                  <ThemedText style={styles.promptTitle}>DUSK ALERT</ThemedText>
                  <ThemedText style={styles.promptSubtitle}>
                    Capture your sunset view before twilight ends.
                  </ThemedText>
                </View>

                <TouchableOpacity
                  onPress={() => router.push('/capture')}
                  style={styles.postNowButton}
                  activeOpacity={0.8}>
                  <AppIcon
                    name="plus"
                    size={16}
                    color="#000000"
                    style={{ marginRight: 5 }}
                  />
                  <ThemedText style={styles.postNowText}>Post</ThemedText>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <AppIcon name="sun" size={44} color="#8E8E93" />
            <ThemedText style={styles.emptyTitle}>
              {activeTab === 'friends'
                ? 'No Friend Sunsets Yet'
                : activeTab === 'local'
                ? `No Sunsets in ${deviceLocation.locationName}`
                : `No Sunsets in ${selectedHotspot}`}
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              {activeTab === 'friends'
                ? 'Be the first among your friends to capture and post tonight.'
                : 'Be the first to capture and post tonight.'}
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.push('/capture')}
              style={styles.emptyPostBtn}>
              <ThemedText style={styles.emptyPostText}>
                Capture Sunset
              </ThemedText>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBannerSpot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingBottom: 14, // Bigger top banner section with comfortable breathing room
  },
  bannerBackground: {
    backgroundColor: '#000000',
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
    paddingHorizontal: 14,
  },
  gloamBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // Spacious gap between GLOAM and toggle
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4.5,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  glanceTouchWrapper: {
    height: 42,
    paddingHorizontal: Spacing.three,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  glanceBgElement: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 21,
  },
  glanceInnerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  glanceText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  settingsTouchWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  settingsBgElement: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 21,
  },
  toggleRow: {
    alignItems: 'center',
  },
  segmentedControlWrap: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: 24,
    padding: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  segmentedBgElement: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 24,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeTabPillBg: {
    backgroundColor: '#262626',
    borderRadius: 20,
  },
  segmentText: {
    fontSize: 13,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  localInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
    marginTop: 4,
  },
  localCityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  localCityText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  localSubtext: {
    fontSize: 11,
    color: '#8E8E93',
  },
  filterBar: {
    paddingBottom: Spacing.two,
    marginTop: 4,
  },
  filterScroll: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three + 2,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#242424',
  },
  filterChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filterChipTextActive: {
    color: '#000000',
  },
  feedContent: {
    paddingBottom: Spacing.six * 2,
  },
  promptBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
    borderRadius: 24,
    padding: Spacing.three + 2,
    marginBottom: Spacing.three,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#222222',
  },
  promptLeft: {
    flex: 1,
    marginRight: Spacing.two,
  },
  promptTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  promptSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 16,
  },
  postNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 20,
  },
  postNowText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
  emptyContainer: {
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    color: '#FFFFFF',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
    color: '#8E8E93',
  },
  emptyPostBtn: {
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.two + 2,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
  },
  emptyPostText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
});
