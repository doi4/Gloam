import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { locationService, getSolarAltitude } from '@/services/location-service';

// ─── Palette ────────────────────────────────────────────────────────────────
// The sky is keyed to the sun's height above the horizon, in degrees.
// At <= -14 degrees (stars fully visible), the sky reaches pure True OLED Black (#000000).
const SUN_ALT = [-14, -8, -3, 0, 5, 15, 45];
const SKY_TOP = ['#000000', '#080C1E', '#1F2455', '#343A85', '#3F68B3', '#3B78CB', '#2C7BD9'];
const SKY_MID = ['#000000', '#141842', '#5A3B80', '#C05C7E', '#D89A78', '#7FAEDD', '#5BA4EA'];
const SKY_LOW = ['#000000', '#221E4A', '#B4507C', '#FF8A4F', '#FFC27A', '#BBD8F0', '#A6D3F5'];

const LIGHT_ALT = [-12, -3, 3, 15, 45];
const GLOW_RGB = ['255,120,90', '255,110,100', '255,170,90', '255,225,170', '255,255,255'];
const GLOW_ALPHA = [0, 0.35, 0.85, 0.6, 0.4];
const GLOW_IN = GLOW_RGB.map((rgb, i) => `rgba(${rgb},${GLOW_ALPHA[i]})`);
const GLOW_OUT = GLOW_RGB.map((rgb) => `rgba(${rgb},0)`);
const CLOUD_COLOR = [
  'rgba(120,130,210,0)', // 0 alpha at night so it is true black with zero cloud residue
  'rgba(255,150,150,0.22)',
  'rgba(255,190,140,0.32)',
  'rgba(255,255,255,0.28)',
  'rgba(255,255,255,0.32)',
];

// ─── Scenery ────────────────────────────────────────────────────────────────
const rand = (i: number, k: number) => {
  const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const STARS = Array.from({ length: 64 }, (_, i) => ({
  x: rand(i, 1),
  y: rand(i, 2) * 0.82,
  r: 0.6 + rand(i, 3) * 1.2,
  seed: rand(i, 4),
}));

const CLOUDS = [
  { y: 0.28, w: 0.95, h: 0.09, speed: 9, start: 0.15 },
  { y: 0.44, w: 1.25, h: 0.12, speed: 6, start: 0.6 },
  { y: 0.6, w: 0.85, h: 0.08, speed: 13, start: 0.9 },
];

export function defaultAltitude(now: Date = new Date()): number {
  const loc = locationService.getLocation();
  if (loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
    return getSolarAltitude(now, loc.latitude, loc.longitude);
  }
  const hours = now.getHours() + now.getMinutes() / 60;
  return 55 * Math.sin(((hours - 6) / 24) * 2 * Math.PI);
}

function parseColor(c: string): [number, number, number, number] {
  if (c.startsWith('#')) {
    let hex = c.slice(1);
    if (hex.length === 3) hex = hex.split('').map((x) => x + x).join('');
    const num = parseInt(hex, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255, 1];
  }
  const match = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (match) {
    return [
      parseInt(match[1], 10),
      parseInt(match[2], 10),
      parseInt(match[3], 10),
      match[4] !== undefined ? parseFloat(match[4]) : 1,
    ];
  }
  return [0, 0, 0, 1];
}

function interpolateCol(value: number, input: number[], output: string[]): string {
  if (value <= input[0]) return output[0];
  if (value >= input[input.length - 1]) return output[output.length - 1];
  let i = 0;
  while (i < input.length - 1 && value > input[i + 1]) {
    i++;
  }
  const t = (value - input[i]) / (input[i + 1] - input[i]);
  const c1 = parseColor(output[i]);
  const c2 = parseColor(output[i + 1]);
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
  const a = c1[3] + (c2[3] - c1[3]) * t;
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

function interpolateNum(value: number, input: number[], output: number[]): number {
  if (value <= input[0]) return output[0];
  if (value >= input[input.length - 1]) return output[output.length - 1];
  let i = 0;
  while (i < input.length - 1 && value > input[i + 1]) {
    i++;
  }
  const t = (value - input[i]) / (input[i + 1] - input[i]);
  return output[i] + (output[i + 1] - output[i]) * t;
}

export type SkyBackgroundProps = {
  getAltitude?: (now: Date) => number;
};

export function SkyBackground({ getAltitude }: SkyBackgroundProps) {
  const { width, height } = useWindowDimensions();
  const altitudeFn = getAltitude ?? defaultAltitude;
  const [alt, setAlt] = useState(() => altitudeFn(new Date()));
  const [clockMs, setClockMs] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      setAlt(altitudeFn(new Date()));
    };
    const timer = setInterval(update, 60_000);
    const unsub = locationService.subscribe(update);
    return () => {
      clearInterval(timer);
      unsub();
    };
  }, [altitudeFn]);

  useEffect(() => {
    const start = performance.now();
    let isRunning = true;
    const loop = (now: number) => {
      if (!isRunning) return;
      setClockMs(now - start);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      isRunning = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const topColor = interpolateCol(alt, SUN_ALT, SKY_TOP);
  const midColor = interpolateCol(alt, SUN_ALT, SKY_MID);
  const lowColor = interpolateCol(alt, SUN_ALT, SKY_LOW);

  const glowIn = interpolateCol(alt, LIGHT_ALT, GLOW_IN);
  const glowOut = interpolateCol(alt, LIGHT_ALT, GLOW_OUT);
  const cloudColor = interpolateCol(alt, LIGHT_ALT, CLOUD_COLOR);

  const glowY = interpolateNum(alt, [-12, 0, 45], [height, height * 0.74, height * 0.3]);
  const glowX = width * (0.5 + 0.06 * Math.sin(clockMs / 7000));
  const glowRadius = width * 0.95;

  const starLevel = Math.max(0, Math.min(1, interpolateNum(alt, [-14, -4], [1, 0])));

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000000' }]} pointerEvents="none">
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}>
        <defs>
          <linearGradient id="sky-linear" x1="0" y1="0" x2="0" y2="100%">
            <stop offset="0%" stopColor={topColor} />
            <stop offset="55%" stopColor={midColor} />
            <stop offset="100%" stopColor={lowColor} />
          </linearGradient>

          <radialGradient
            id="horizon-glow"
            cx={`${(glowX / width) * 100}%`}
            cy={`${(glowY / height) * 100}%`}
            r={`${(glowRadius / Math.max(width, height)) * 100}%`}
            gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={glowIn} />
            <stop offset="100%" stopColor={glowOut} />
          </radialGradient>

          <filter id="cloud-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="15" />
          </filter>
        </defs>

        {/* Sky Background Gradient */}
        <rect width="100%" height="100%" fill="url(#sky-linear)" />

        {/* Stars */}
        {starLevel > 0 &&
          STARS.map((s, i) => {
            const twinkle = 0.5 + 0.5 * Math.sin(clockMs / (700 + s.seed * 900) + s.seed * 40);
            const opacity = starLevel * (0.35 + 0.65 * twinkle);
            return (
              <circle
                key={i}
                cx={s.x * width}
                cy={s.y * height}
                r={s.r}
                fill="white"
                opacity={opacity}
              />
            );
          })}

        {/* Horizon Glow (only when above -12 degrees) */}
        {alt > -12 && <rect width="100%" height="100%" fill="url(#horizon-glow)" />}

        {/* Clouds (only when above -12 degrees) */}
        {alt > -12 &&
          CLOUDS.map((spec, i) => {
            const w = spec.w * width;
            const h = spec.h * height;
            const travel = width + w;
            const x = (((clockMs / 1000) * spec.speed + spec.start * travel) % travel) - w;
            const y = spec.y * height;
            return (
              <ellipse
                key={i}
                cx={x + w / 2}
                cy={y + h / 2}
                rx={w / 2}
                ry={h / 2}
                fill={cloudColor}
                filter="url(#cloud-blur)"
              />
            );
          })}
      </svg>
    </View>
  );
}
