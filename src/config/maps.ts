import {Platform} from 'react-native';
import {Region} from 'react-native-maps';

// Google Maps configuration
export const GOOGLE_MAPS_CONFIG = {
  // API Keys - replace with your actual keys
  API_KEY: {
    android: process.env.GOOGLE_MAPS_ANDROID_API_KEY || 'your-android-api-key',
    ios: process.env.GOOGLE_MAPS_IOS_API_KEY || 'your-ios-api-key',
  },
  
  // Default map region (New York City)
  DEFAULT_REGION: {
    latitude: 40.7128,
    longitude: -74.0060,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  } as Region,
  
  // Map style configurations
  MAP_STYLES: {
    standard: [],
    dark: [
      {
        elementType: 'geometry',
        stylers: [{color: '#212121'}],
      },
      {
        elementType: 'labels.icon',
        stylers: [{visibility: 'off'}],
      },
      {
        elementType: 'labels.text.fill',
        stylers: [{color: '#757575'}],
      },
      {
        elementType: 'labels.text.stroke',
        stylers: [{color: '#212121'}],
      },
    ],
  },
  
  // Geocoding configuration
  GEOCODING: {
    baseUrl: 'https://maps.googleapis.com/maps/api/geocode/json',
    components: 'country:US', // Restrict to US addresses
  },
  
  // Places API configuration
  PLACES: {
    baseUrl: 'https://maps.googleapis.com/maps/api/place',
    types: 'address', // Address autocomplete
    radius: 50000, // 50km radius for nearby places
  },
  
  // Directions API configuration
  DIRECTIONS: {
    baseUrl: 'https://maps.googleapis.com/maps/api/directions/json',
    mode: 'driving',
    avoidTolls: false,
    avoidHighways: false,
  },
};

// Get the appropriate API key for the current platform
export const getGoogleMapsApiKey = (): string => {
  return Platform.select({
    android: GOOGLE_MAPS_CONFIG.API_KEY.android,
    ios: GOOGLE_MAPS_CONFIG.API_KEY.ios,
  }) || '';
};

// Map zoom levels
export const MAP_ZOOM_LEVELS = {
  WORLD: 1,
  CONTINENT: 3,
  COUNTRY: 6,
  STATE: 7,
  CITY: 10,
  DISTRICT: 12,
  NEIGHBORHOOD: 15,
  STREET: 17,
  BUILDING: 20,
} as const;

// Calculate region for given coordinates and zoom
export const createRegion = (
  latitude: number,
  longitude: number,
  zoomLevel: number = MAP_ZOOM_LEVELS.NEIGHBORHOOD
): Region => {
  const delta = Math.pow(2, (20 - zoomLevel)) * 0.009;
  
  return {
    latitude,
    longitude,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in miles
};

// Format address components
export const formatAddress = (components: any): string => {
  const {
    street_number = '',
    route = '',
    locality = '',
    administrative_area_level_1 = '',
    postal_code = '',
  } = components;
  
  const street = `${street_number} ${route}`.trim();
  const cityState = `${locality}, ${administrative_area_level_1}`.trim();
  const zip = postal_code;
  
  return `${street}, ${cityState} ${zip}`.replace(/,\s*,/g, ',').trim();
};

export default GOOGLE_MAPS_CONFIG;