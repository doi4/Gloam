import { useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import {
  Blur,
  Canvas,
  Circle,
  Group,
  LinearGradient,
  Oval,
  RadialGradient,
  Rect,
  useClock,
  vec,
} from '@shopify/react-native-skia';
import {
  Extrapolation,
  interpolate,
  interpolateColor,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type DerivedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { locationService, getSolarAltitude } from '@/services/location-service';

// ─── Palette ────────────────────────────────────────────────────────────────
// The sky is keyed to the sun's height above the horizon, in degrees.
// At <= -14 degrees (astronomical twilight / stars fully visible),
// the entire sky transitions into pure True OLED Black (#000000).
const SUN_ALT = [-14, -8, -3, 0, 5, 15, 45];
const SKY_TOP = ['#000000', '#080C1E', '#1F2455', '#343A85', '#3F68B3', '#3B78CB', '#2C7BD9'];
const SKY_MID = ['#000000', '#141842', '#5A3B80', '#C05C7E', '#D89A78', '#7FAEDD', '#5BA4EA'];
const SKY_LOW = ['#000000', '#221E4A', '#B4507C', '#FF8A4F', '#FFC27A', '#BBD8F0', '#A6D3F5'];

// Horizon glow and clouds pick up the light: invisible at night (0 alpha), warm at sunset, white by day.
const LIGHT_ALT = [-12, -3, 3, 15, 45];
const GLOW_RGB = ['255,120,90', '255,110,100', '255,170,90', '255,225,170', '255,255,255'];
const GLOW_ALPHA = [0, 0.35, 0.85, 0.6, 0.4];
const GLOW_IN = GLOW_RGB.map((rgb, i) => `rgba(${rgb},${GLOW_ALPHA[i]})`);
const GLOW_OUT = GLOW_RGB.map((rgb) => `rgba(${rgb},0)`);
const CLOUD_COLOR = [
  'rgba(120,130,210,0)', // Completely transparent at night for true black sky
  'rgba(255,150,150,0.22)',
  'rgba(255,190,140,0.32)',
  'rgba(255,255,255,0.28)',
  'rgba(255,255,255,0.32)',
];

// ─── Scenery ────────────────────────────────────────────────────────────────
// Deterministic pseudo-random numbers, so the stars stay put between renders.
const rand = (i: number, k: number) => {
  const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const STARS = Array.from({ length: 64 }, (_, i) => ({
  x: rand(i, 1),
  y: rand(i, 2) * 0.82, // distributed across sky behind cards
  r: 0.6 + rand(i, 3) * 1.2,
  seed: rand(i, 4),
}));

// y / w / h are fractions of the screen; speed is px per second; start is how far along the loop it begins.
const CLOUDS = [
  { y: 0.28, w: 0.95, h: 0.09, speed: 9, start: 0.15 },
  { y: 0.44, w: 1.25, h: 0.12, speed: 6, start: 0.6 },
  { y: 0.6, w: 0.85, h: 0.08, speed: 13, start: 0.9 },
];

// ─── Sun height ─────────────────────────────────────────────────────────────
// Default astronomical altitude based on location, fallback to clock estimation.
export function defaultAltitude(now: Date = new Date()): number {
  const loc = locationService.getLocation();
  if (loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
    return getSolarAltitude(now, loc.latitude, loc.longitude);
  }
  const hours = now.getHours() + now.getMinutes() / 60;
  return 55 * Math.sin(((hours - 6) / 24) * 2 * Math.PI);
}

function useNow(everyMs = 60_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), everyMs);
    return () => clearInterval(id);
  }, [everyMs]);
  return now;
}

// ─── Layers ─────────────────────────────────────────────────────────────────
function Star(props: {
  clock: SharedValue<number>;
  level: DerivedValue<number>;
  cx: number;
  cy: number;
  r: number;
  seed: number;
}) {
  const { clock, level, cx, cy, r, seed } = props;
  const opacity = useDerivedValue(() => {
    const twinkle = 0.5 + 0.5 * Math.sin(clock.value / (700 + seed * 900) + seed * 40);
    return level.value * (0.35 + 0.65 * twinkle);
  });
  return <Circle cx={cx} cy={cy} r={r} color="white" opacity={opacity} />;
}

function Cloud(props: {
  clock: SharedValue<number>;
  alt: SharedValue<number>;
  screenW: number;
  screenH: number;
  spec: (typeof CLOUDS)[number];
}) {
  const { clock, alt, screenW, screenH, spec } = props;
  const w = spec.w * screenW;
  const h = spec.h * screenH;
  const color = useDerivedValue(() => interpolateColor(alt.value, LIGHT_ALT, CLOUD_COLOR));
  const transform = useDerivedValue(() => {
    const travel = screenW + w;
    const x = ((clock.value / 1000) * spec.speed + spec.start * travel) % travel;
    return [{ translateX: x - w }];
  });
  return (
    <Group transform={transform}>
      <Oval x={0} y={spec.y * screenH} width={w} height={h} color={color}>
        <Blur blur={h * 0.35} />
      </Oval>
    </Group>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────
export type SkyBackgroundProps = {
  /**
   * Sun height in degrees for a given time. Defaults to location-based solar altitude.
   * Pass `() => 3` to preview golden hour, `() => -6` for dusk, `() => -20` for night.
   */
  getAltitude?: (now: Date) => number;
};

/** Live sky background. Render it behind your content; it ignores touches. */
export function SkyBackground({ getAltitude }: SkyBackgroundProps) {
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();

  const now = useNow();
  const [locVersion, setLocVersion] = useState(0);

  useEffect(() => {
    const unsub = locationService.subscribe(() => {
      setLocVersion((v) => v + 1);
    });
    return unsub;
  }, []);

  const altitudeFn = getAltitude ?? defaultAltitude;
  // locVersion is included as dependency of computation
  const target = altitudeFn(now);
  const alt = useSharedValue(target);
  useEffect(() => {
    alt.value = withTiming(target, { duration: 1200 });
  }, [alt, target, locVersion]);

  // Drives the slow drift and twinkle; frozen when the system asks for reduced motion.
  const liveClock = useClock();
  const frozenClock = useSharedValue(0);
  const clock = reduceMotion ? frozenClock : liveClock;

  const skyColors = useDerivedValue(() => [
    interpolateColor(alt.value, SUN_ALT, SKY_TOP),
    interpolateColor(alt.value, SUN_ALT, SKY_MID),
    interpolateColor(alt.value, SUN_ALT, SKY_LOW),
  ]);

  // The glow sits on the horizon at sunset, climbs as the sun rises, and drifts a little.
  const glowCenter = useDerivedValue(() =>
    vec(
      width * (0.5 + 0.06 * Math.sin(clock.value / 7000)),
      interpolate(alt.value, [-12, 0, 45], [height, height * 0.74, height * 0.3], Extrapolation.CLAMP),
    ),
  );
  const glowColors = useDerivedValue(() => [
    interpolateColor(alt.value, LIGHT_ALT, GLOW_IN),
    interpolateColor(alt.value, LIGHT_ALT, GLOW_OUT),
  ]);
  const starLevel = useDerivedValue(() =>
    interpolate(alt.value, [-14, -4], [1, 0], Extrapolation.CLAMP),
  );

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000000' }]} pointerEvents="none">
      <Canvas style={StyleSheet.absoluteFill}>
        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, height)}
            colors={skyColors}
            positions={[0, 0.55, 1]}
          />
        </Rect>

        {STARS.map((s, i) => (
          <Star
            key={i}
            clock={clock}
            level={starLevel}
            cx={s.x * width}
            cy={s.y * height}
            r={s.r}
            seed={s.seed}
          />
        ))}

        <Rect x={0} y={0} width={width} height={height}>
          <RadialGradient c={glowCenter} r={width * 0.95} colors={glowColors} />
        </Rect>

        {CLOUDS.map((spec, i) => (
          <Cloud
            key={i}
            clock={clock}
            alt={alt}
            screenW={width}
            screenH={height}
            spec={spec}
          />
        ))}
      </Canvas>
    </View>
  );
}
