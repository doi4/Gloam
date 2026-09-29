import { AppIcon } from '@/components/ui/app-icon';
import { getTabBarBottomOffset, TAB_BAR_HEIGHT, TAB_BAR_WIDTH } from '@/constants/theme';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = getTabBarBottomOffset(insets.bottom);

  return (
    <View
      style={[styles.tabBarWrapper, { bottom: bottomOffset }]}
      pointerEvents="box-none">
      <View style={styles.tabBarCapsule}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          
          // Expo Router converts href: null into tabBarItemStyle: { display: 'none' }
          const isHidden = 
            (options.tabBarItemStyle as any)?.display === 'none' || 
            ['settings', 'friends', 'public'].includes(route.name);
            
          if (isHidden) return null;

          const isFocused = state.index === index;
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}>
              {options.tabBarIcon?.({
                focused: isFocused,
                color: isFocused ? '#FFFFFF' : '#777777',
                size: route.name === 'capture' ? 34 : 22,
              })}
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? '#FFFFFF' : '#777777' },
                ]}>
                {typeof label === 'string' ? label : route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      {/* 1. Feed (Home) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ focused }) => (
            <View style={styles.standardIconWrap}>
              <AppIcon
                name="feed"
                size={22}
                color={focused ? '#FFFFFF' : '#777777'}
              />
            </View>
          ),
        }}
      />

      {/* 2. Post / Capture */}
      <Tabs.Screen
        name="capture"
        options={{
          title: 'Post',
          tabBarIcon: ({ focused }) => (
            <View style={styles.biggerPlusIconWrap}>
              <AppIcon
                name="plus"
                size={34}
                color={focused ? '#FFFFFF' : '#DDDDDD'}
              />
            </View>
          ),
        }}
      />

      {/* 3. Forecast */}
      <Tabs.Screen
        name="forecast"
        options={{
          title: 'Forecast',
          tabBarIcon: ({ focused }) => (
            <View style={styles.standardIconWrap}>
              <AppIcon
                name="sun"
                size={22}
                color={focused ? '#FFFFFF' : '#777777'}
              />
            </View>
          ),
        }}
      />

      {/* Hidden Screens: Not in Menu Bar */}
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="public"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  tabBarCapsule: {
    width: TAB_BAR_WIDTH, // 320px
    height: TAB_BAR_HEIGHT, // 64px
    borderRadius: TAB_BAR_HEIGHT / 2, // 32px
    backgroundColor: 'rgba(0, 0, 0)', // Translucent glass effect
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.8,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingVertical: 2,
  },
  tabLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  standardIconWrap: {
    width: 32,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  biggerPlusIconWrap: {
    width: 38,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});
