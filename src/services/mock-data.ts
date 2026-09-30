export interface DailyForecast {
  id: string;
  dayLabel: string;
  dateLabel: string;
  sunsetTime: string;
  index: number;
  ratingLabel: string;
  vibrancy: number;
  cloudCover: number;
  goldenHour: string;
}

export interface SunsetData {
  id: string;
  location: string;
  index: number; // 0-100
  ratingLabel: string;
  goldenHourStart: string; // 12-hour format
  goldenHourEnd: string; // 12-hour format
  sunsetTime: string; // 12-hour format
  cloudCover: number;
  visibility: number;
  vibrancy: number;
  humidity: number;
  temperature?: number;
  historicPhotos?: { id: string; url: string; score: number; date: string }[];
  forecastNext5Days: DailyForecast[];
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  imageUrl: string;
  location: string;
  hotspot?: string;
  beautyScore?: number;
  timestamp: string;
  description: string;
  likes?: number;
  isLiked?: boolean;
}

export const MOCK_5_DAY_FORECAST: DailyForecast[] = [
  {
    id: 'd1',
    dayLabel: 'Tomorrow',
    dateLabel: 'Sep 30',
    sunsetTime: '7:10 PM',
    index: 94,
    ratingLabel: 'Spectacular Dusk',
    vibrancy: 96,
    cloudCover: 24,
    goldenHour: '6:14 PM - 7:04 PM',
  },
  {
    id: 'd2',
    dayLabel: 'Thursday',
    dateLabel: 'Oct 1',
    sunsetTime: '7:08 PM',
    index: 88,
    ratingLabel: 'Golden & Vivid',
    vibrancy: 90,
    cloudCover: 18,
    goldenHour: '6:12 PM - 7:02 PM',
  },
  {
    id: 'd3',
    dayLabel: 'Friday',
    dateLabel: 'Oct 2',
    sunsetTime: '7:07 PM',
    index: 97,
    ratingLabel: 'Rare Fire Sky',
    vibrancy: 98,
    cloudCover: 28,
    goldenHour: '6:11 PM - 7:01 PM',
  },
  {
    id: 'd4',
    dayLabel: 'Saturday',
    dateLabel: 'Oct 3',
    sunsetTime: '7:05 PM',
    index: 82,
    ratingLabel: 'Warm Pastel Glow',
    vibrancy: 84,
    cloudCover: 35,
    goldenHour: '6:09 PM - 6:59 PM',
  },
  {
    id: 'd5',
    dayLabel: 'Sunday',
    dateLabel: 'Oct 4',
    sunsetTime: '7:03 PM',
    index: 91,
    ratingLabel: 'High Contrast Horizon',
    vibrancy: 93,
    cloudCover: 20,
    goldenHour: '6:07 PM - 6:57 PM',
  },
];

export const MOCK_SUNSETS_BY_LOCATION: Record<string, SunsetData> = {
  'Laguna Beach, CA': {
    id: '1',
    location: 'Laguna Beach, CA',
    index: 92,
    ratingLabel: 'Spectacular Dusk',
    goldenHourStart: '6:15 PM',
    goldenHourEnd: '7:05 PM',
    sunsetTime: '7:12 PM',
    cloudCover: 22,
    visibility: 98,
    vibrancy: 95,
    humidity: 48,
    temperature: 72,
    forecastNext5Days: MOCK_5_DAY_FORECAST,
  },
  'Santa Monica, CA': {
    id: '2',
    location: 'Santa Monica, CA',
    index: 85,
    ratingLabel: 'Golden & Vibrant',
    goldenHourStart: '6:18 PM',
    goldenHourEnd: '7:08 PM',
    sunsetTime: '7:15 PM',
    cloudCover: 30,
    visibility: 92,
    vibrancy: 88,
    humidity: 55,
    temperature: 70,
    forecastNext5Days: MOCK_5_DAY_FORECAST,
  },
  'Miami Beach, FL': {
    id: '3',
    location: 'Miami Beach, FL',
    index: 76,
    ratingLabel: 'Warm Pastel Glow',
    goldenHourStart: '6:40 PM',
    goldenHourEnd: '7:25 PM',
    sunsetTime: '7:32 PM',
    cloudCover: 45,
    visibility: 85,
    vibrancy: 80,
    humidity: 72,
    temperature: 84,
    forecastNext5Days: MOCK_5_DAY_FORECAST,
  },
  'Honolulu, HI': {
    id: '4',
    location: 'Honolulu, HI',
    index: 97,
    ratingLabel: 'Rare Fire Sky',
    goldenHourStart: '5:55 PM',
    goldenHourEnd: '6:45 PM',
    sunsetTime: '6:52 PM',
    cloudCover: 18,
    visibility: 99,
    vibrancy: 98,
    humidity: 60,
    temperature: 82,
    forecastNext5Days: MOCK_5_DAY_FORECAST,
  },
};

export const MOCK_SUNSET: SunsetData = MOCK_SUNSETS_BY_LOCATION['Laguna Beach, CA'];

export const MOCK_FRIENDS_POSTS: Post[] = [
  {
    id: 'f1',
    userId: 'u1',
    username: 'maya_sky',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    imageUrl: 'https://images.unsplash.com/photo-1501179691627-eeaa65ea017c?w=1000',
    location: 'Laguna Beach, CA',
    timestamp: '18m ago',
    description: 'The purple gradient tonight is genuinely unreal.',
    likes: 42,
    isLiked: true,
  },
  {
    id: 'f2',
    userId: 'u2',
    username: 'kai_wander',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    imageUrl: 'https://images.unsplash.com/photo-1470252649358-96957c053e9a?w=1000',
    location: 'Laguna Beach, CA',
    timestamp: '1h ago',
    description: 'Caught golden hour right over the cliffs.',
    likes: 29,
    isLiked: false,
  },
  {
    id: 'f3',
    userId: 'u4',
    username: 'chloe_sunsets',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000',
    location: 'Laguna Beach, CA',
    timestamp: '2h ago',
    description: 'Best sunset of September hands down.',
    likes: 67,
    isLiked: false,
  },
];

// Local posts: automatically from user's current city (Laguna Beach)
export const MOCK_LOCAL_POSTS: Post[] = [
  {
    id: 'loc1',
    userId: 'u5',
    username: 'laguna_local',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    imageUrl: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1000',
    location: 'Laguna Beach, CA',
    timestamp: '25m ago',
    description: 'Crescent Bay glow looking like a painting right now.',
    likes: 114,
    isLiked: false,
  },
  {
    id: 'loc2',
    userId: 'u7',
    username: 'victoria_beach',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000',
    location: 'Laguna Beach, CA',
    timestamp: '38m ago',
    description: 'Pirate tower reflections during peak low tide dusk.',
    likes: 82,
    isLiked: false,
  },
  ...MOCK_FRIENDS_POSTS,
];

export const GLOBAL_HOTSPOTS = [
  'All Hotspots',
  'Santorini',
  'Maui',
  'Bali',
  'Ibiza',
  'Malibu',
  'Santa Monica',
];

// Global posts: Famous sunset hotspots from around the world
export const MOCK_GLOBAL_POSTS: Post[] = [
  {
    id: 'g1',
    userId: 'g_u1',
    username: 'elena_aegean',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1000',
    location: 'Oia, Santorini',
    hotspot: 'Santorini',
    timestamp: '14m ago',
    description: 'Caldera glow tonight over the whitewashed cliffs.',
    likes: 248,
    isLiked: true,
  },
  {
    id: 'g2',
    userId: 'g_u2',
    username: 'aloha_keanu',
    userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000',
    location: 'Makena Beach, Maui',
    hotspot: 'Maui',
    timestamp: '32m ago',
    description: 'Molokini silhouette during sunset golden hour.',
    likes: 189,
    isLiked: false,
  },
  {
    id: 'g3',
    userId: 'g_u3',
    username: 'wayan_bali',
    userAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1000',
    location: 'Uluwatu, Bali',
    hotspot: 'Bali',
    timestamp: '1h ago',
    description: 'Indian Ocean swell catching the last rays of sun.',
    likes: 312,
    isLiked: false,
  },
  {
    id: 'g4',
    userId: 'g_u4',
    username: 'ibiza_sunset',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    imageUrl: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=1000',
    location: 'San Antonio, Ibiza',
    hotspot: 'Ibiza',
    timestamp: '2h ago',
    description: 'Cafe del Mar sunset session with deep amber skies.',
    likes: 145,
    isLiked: false,
  },
  {
    id: 'g5',
    userId: 'g_u5',
    username: 'malibu_drift',
    userAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    imageUrl: 'https://images.unsplash.com/photo-1472120482482-d43ba79ff5f0?w=1000',
    location: 'El Matador, Malibu',
    hotspot: 'Malibu',
    timestamp: '2h ago',
    description: 'Sea arches backlit by radiant golden light.',
    likes: 95,
    isLiked: false,
  },
  {
    id: 'g6',
    userId: 'g_u6',
    username: 'pier_vibes',
    userAvatar: 'https://images.unsplash.com/photo-1501179691627-eeaa65ea017c?w=150',
    imageUrl: 'https://images.unsplash.com/photo-1501179691627-eeaa65ea017c?w=1000',
    location: 'Santa Monica Pier, CA',
    hotspot: 'Santa Monica',
    timestamp: '3h ago',
    description: 'Ferris wheel glow against the violet dusk.',
    likes: 178,
    isLiked: true,
  },
];

export const MOCK_PUBLIC_POSTS = MOCK_LOCAL_POSTS;
