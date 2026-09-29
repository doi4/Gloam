import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { Spacing, getMenuBarClearance } from '@/constants/theme';
import { useGloamTheme } from '@/hooks/use-theme';
import { socialService } from '@/services/social-service';
import { locationService } from '@/services/location-service';
import { AppIcon } from '@/components/ui/app-icon';

export default function CaptureScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useGloamTheme();

  // Bottom menu bar clearance to guarantee shutter button and all screen content sit cleanly above the menu bar
  const menuBarClearance = getMenuBarClearance(insets.bottom);

  // Viewfinder dynamic sizing state so 3:4 portrait view adapts to available height without pushing the shutter HUD down
  const [viewfinderSize, setViewfinderSize] = useState<{ width: number; height: number } | null>(null);

  const handleViewfinderLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      let w = width;
      let h = (w * 4) / 3;
      if (h > height) {
        h = height;
        w = (h * 3) / 4;
      }
      setViewfinderSize({ width: Math.floor(w), height: Math.floor(h) });
    }
  };

  const [realCity, setRealCity] = useState(locationService.getLocation().city);
  
  useEffect(() => {
    const unsubscribe = locationService.subscribe(({ location }) => {
      setRealCity(location.city);
      setSelectedLocation(location.city);
    });
    return unsubscribe;
  }, []);

  const locationsList = Array.from(
    new Set([
      realCity,
      'Laguna Beach',
      'Santa Monica',
      'Malibu',
      'Newport Beach',
      'Griffith Observatory',
      'Venice Pier',
    ])
  );

  // In-app camera state
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<boolean>(false);

  // Stylistic post composition state (3:4 portrait)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(realCity);
  const [shareTarget, setShareTarget] = useState<'both' | 'friends' | 'local' | 'global'>('both');
  const [isPosting, setIsPosting] = useState(false);

  // Shutter snap
  const handleShutter = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.9,
          skipProcessing: false,
        });
        if (photo?.uri) {
          setCapturedPhoto(photo.uri);
          return;
        }
      } catch {
        // Fallback below
      }
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [3, 4], // 3:4 portrait aspect ratio
        quality: 0.85,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        setCapturedPhoto(result.assets[0].uri);
      }
    } catch {
      // Ignored
    }
  };

  const handlePickLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4], // 3:4 portrait aspect ratio
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setCapturedPhoto(result.assets[0].uri);
      }
    } catch {
      // Ignored
    }
  };

  const handleShare = () => {
    if (!capturedPhoto) return;
    setIsPosting(true);

    socialService.addPost(
      {
        username: 'you',
        imageUrl: capturedPhoto,
        location: `${selectedLocation}, CA`,
        description: caption.trim() || `Golden hour at ${selectedLocation}`,
        likes: 0,
        isLiked: false,
      },
      shareTarget as any
    );

    setTimeout(() => {
      setIsPosting(false);
      setCapturedPhoto(null);
      setCaption('');
      router.push('/');
    }, 250);
  };

  return (
    <View style={styles.container}>
      {!capturedPhoto ? (
        /* In-App Live Camera View with Rounded 3:4 Picture Area */
        <View style={StyleSheet.absoluteFill}>
          <SafeAreaView style={styles.cameraOverlay} edges={['top']}>
            {/* Top HUD */}
            <View style={styles.topHud}>
              <TouchableOpacity
                onPress={() => setFlash((f) => !f)}
                style={styles.hudCircleBtn}
                activeOpacity={0.7}>
                <AppIcon
                  name={flash ? 'flash' : 'flash-off'}
                  size={19}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              <View style={styles.duskLiveBadge}>
                <View style={styles.duskDot} />
                <ThemedText style={styles.duskLiveText}>DUSK CAPTURE</ThemedText>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setFacing((prev) => (prev === 'back' ? 'front' : 'back'))
                }
                style={styles.hudCircleBtn}
                activeOpacity={0.7}>
                <AppIcon name="flip" size={19} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* 3:4 Aspect Ratio Camera Viewfinder with Rounded Corners */}
            <View
              style={styles.roundedViewfinderContainer}
              onLayout={handleViewfinderLayout}>
              {permission?.granted ? (
                <View
                  style={[
                    styles.cameraFrameRounded,
                    viewfinderSize
                      ? { width: viewfinderSize.width, height: viewfinderSize.height }
                      : null,
                  ]}>
                  <CameraView
                    ref={cameraRef}
                    style={StyleSheet.absoluteFill}
                    facing={facing}
                    enableTorch={flash}
                  />
                </View>
              ) : (
                <View
                  style={[
                    styles.permissionBox,
                    viewfinderSize
                      ? { width: viewfinderSize.width, height: viewfinderSize.height }
                      : null,
                  ]}>
                  <View style={styles.permissionIconCircle}>
                    <AppIcon name="camera" size={40} color="#FFFFFF" />
                  </View>
                  <ThemedText style={styles.permissionTitle}>
                    Camera Access
                  </ThemedText>
                  <ThemedText style={styles.permissionSubtitle}>
                    Allow Gloam to access your camera to capture live sunsets.
                  </ThemedText>
                  <TouchableOpacity
                    onPress={requestPermission}
                    style={styles.permissionBtn}
                    activeOpacity={0.8}>
                    <ThemedText style={styles.permissionBtnText}>
                      Enable Camera
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Bottom HUD: Shutter & Photos - completely positioned above the menu bar */}
            <View style={[styles.bottomHud, { marginBottom: menuBarClearance }]}>
              <TouchableOpacity
                onPress={handlePickLibrary}
                style={styles.libraryBtn}
                activeOpacity={0.7}>
                <AppIcon name="photo" size={22} color="#FFFFFF" />
                <ThemedText style={styles.libraryText}>Photos</ThemedText>
              </TouchableOpacity>

              {/* Shutter Button */}
              <TouchableOpacity
                onPress={handleShutter}
                style={styles.shutterRing}
                activeOpacity={0.85}>
                <View style={styles.shutterInner} />
              </TouchableOpacity>

              <View style={styles.libraryBtnPlaceholder} />
            </View>
          </SafeAreaView>
        </View>
      ) : (
        /* Stylistic Post Composition Screen with 3:4 Aspect Ratio and Rounded Corners */
        <SafeAreaView style={styles.postFlowContainer} edges={['top']}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.postFlowContent,
              { paddingBottom: menuBarClearance + Spacing.five },
            ]}>
            {/* Top Navigation Bar */}
            <View style={[styles.flowHeader, styles.paddedSection]}>
              <TouchableOpacity
                onPress={() => setCapturedPhoto(null)}
                style={styles.headerPillBtn}
                activeOpacity={0.7}>
                <ThemedText style={styles.cancelPillText}>Cancel</ThemedText>
              </TouchableOpacity>

              <ThemedText style={styles.flowTitle}>New Sunset Post</ThemedText>

              <TouchableOpacity
                onPress={() => setCapturedPhoto(null)}
                style={styles.headerPillBtn}
                activeOpacity={0.7}>
                <ThemedText style={styles.retakePillText}>Retake</ThemedText>
              </TouchableOpacity>
            </View>

            {/* 3:4 Portrait Aspect Ratio Picture Area with Rounded Corners */}
            <View style={styles.photoPreviewCard}>
              <Image source={{ uri: capturedPhoto }} style={styles.photoPreview} resizeMode="cover" />

              {/* Floating Pill on Photo with Glass Styling */}
              <View style={styles.previewLocationBadge}>
                <AppIcon
                  name="location"
                  size={12}
                  color="#FF5E3A"
                  style={{ marginRight: 5 }}
                />
                <ThemedText style={styles.previewLocationText}>
                  {selectedLocation}
                </ThemedText>
              </View>
            </View>

            <View style={styles.paddedSection}>
              {/* Stylistic Caption Input */}
              <View style={styles.sectionCard}>
                <TextInput
                  value={caption}
                  onChangeText={setCaption}
                  placeholder="Write a sunset caption..."
                  placeholderTextColor="#666666"
                  style={styles.stylisticCaptionInput}
                  maxLength={180}
                />
                <View style={styles.captionMetaRow}>
                  <ThemedText style={styles.captionHint}>
                    Visible to your audience
                  </ThemedText>
                  <ThemedText style={styles.captionCount}>
                    {caption.length}/180
                  </ThemedText>
                </View>
              </View>

              {/* Location Tag Selector with Rounded Pills */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionHeading}>LOCATION TAG</ThemedText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.locationScroll}>
                  {locationsList.map((loc) => {
                    const isSelected = selectedLocation === loc;
                    return (
                      <TouchableOpacity
                        key={loc}
                        onPress={() => setSelectedLocation(loc)}
                        style={[
                          styles.locPill,
                          isSelected && styles.locPillActive,
                        ]}
                        activeOpacity={0.7}>
                        <AppIcon
                          name="location"
                          size={12}
                          color={isSelected ? '#000000' : '#888888'}
                          style={{ marginRight: 5 }}
                        />
                        <ThemedText
                          style={[
                            styles.locPillText,
                            isSelected && styles.locPillTextActive,
                          ]}>
                          {loc}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Audience Selector with Smooth Segmented Control */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionHeading}>AUDIENCE</ThemedText>
                <View style={styles.audienceContainer}>
                  {[
                    { key: 'both', label: 'Friends & Local' },
                    { key: 'friends', label: 'Friends Only' },
                    { key: 'global', label: 'Global' },
                  ].map((target) => {
                    const isSelected = shareTarget === target.key;
                    return (
                      <TouchableOpacity
                        key={target.key}
                        onPress={() => setShareTarget(target.key as any)}
                        style={[
                          styles.audienceTab,
                          isSelected && styles.audienceTabActive,
                        ]}
                        activeOpacity={0.8}>
                        <ThemedText
                          style={[
                            styles.audienceTabText,
                            isSelected && styles.audienceTabTextActive,
                          ]}>
                          {target.label}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Stylistic Send Post Button */}
              <TouchableOpacity
                onPress={handleShare}
                disabled={isPosting}
                style={styles.sendButton}
                activeOpacity={0.85}>
                {isPosting ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <ThemedText style={styles.sendButtonText}>
                    Send Post
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topHud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  hudCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  duskLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: Spacing.three + 2,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  duskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF5E3A',
  },
  duskLiveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  roundedViewfinderContainer: {
    flex: 1,
    minHeight: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.two,
    // marginHorizontal: -25,
  },
  cameraFrameRounded: {
    width: '100%',
    // height: '100%',
    // maxWidth: '100%',
    // maxHeight: '100%',
    aspectRatio: 3 / 4, // 3:4 aspect ratio picture area
    borderRadius: 25, // Generous rounded corners on camera viewfinder
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#262626',
    backgroundColor: '#050505',
    alignSelf: 'center',
  },
  permissionBox: {
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 28,
    backgroundColor: '#0D0D0D',
    borderWidth: 1,
    borderColor: '#262626',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
    alignSelf: 'center',
  },
  permissionIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#262626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  permissionSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
  },
  permissionBtn: {
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.two + 2,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },
  permissionBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
  bottomHud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  libraryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  libraryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  libraryBtnPlaceholder: {
    width: 58,
  },
  shutterRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
  },
  postFlowContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  postFlowContent: {
    // Dynamic paddingBottom supplied inline to clear floating tab bar
  },
  paddedSection: {
    paddingHorizontal: Spacing.four,
  },
  flowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    marginBottom: Spacing.two,
  },
  flowTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerPillBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#262626',
  },
  cancelPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
  },
  retakePillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  photoPreviewCard: {
    width: '100%',
    aspectRatio: 3 / 4, // 3:4 aspect ratio picture area on post screen
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0A0A0A',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  previewLocationBadge: {
    position: 'absolute',
    bottom: Spacing.three,
    left: Spacing.three,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    paddingHorizontal: Spacing.three + 2,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewLocationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionCard: {
    marginTop: Spacing.three,
    backgroundColor: '#121212',
    borderRadius: 24,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: '#242424',
  },
  stylisticCaptionInput: {
    fontSize: 15,
    color: '#FFFFFF',
    paddingVertical: Spacing.one,
  },
  captionMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  captionHint: {
    fontSize: 11,
    color: '#666666',
  },
  captionCount: {
    fontSize: 11,
    color: '#666666',
  },
  section: {
    marginTop: Spacing.three,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#8E8E93',
    marginBottom: Spacing.two,
    marginLeft: 4,
  },
  locationScroll: {
    gap: Spacing.two,
    paddingVertical: 2,
  },
  locPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three + 2,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#262626',
  },
  locPillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  locPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  locPillTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  audienceContainer: {
    flexDirection: 'row',
    borderRadius: 22,
    padding: 3,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#262626',
  },
  audienceTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 19,
  },
  audienceTabActive: {
    backgroundColor: '#FFFFFF',
  },
  audienceTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  audienceTabTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  sendButton: {
    marginTop: Spacing.four,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.2,
  },
});
