// App Constants
export const APP_NAME = 'FuelFlow';
export const APP_VERSION = '1.0.0';

// Colors (Design System)
export const COLORS = {
  // Primary Colors
  PRIMARY_BLUE: '#1E3A8A',
  FUEL_ORANGE: '#F97316',
  SUCCESS_GREEN: '#10B981',
  WARNING_AMBER: '#F59E0B',
  DANGER_RED: '#EF4444',
  
  // Neutral Colors
  DARK_SLATE: '#0F172A',
  MEDIUM_GRAY: '#64748B',
  LIGHT_GRAY: '#F1F5F9',
  PURE_WHITE: '#FFFFFF',
  
  // Dark Mode Colors
  DARK_BACKGROUND: '#0F172A',
  DARK_SURFACE: '#1E293B',
  DARK_PRIMARY: '#3B82F6',
  DARK_TEXT: '#F8FAFC',
  DARK_SECONDARY_TEXT: '#94A3B8',
} as const;

// Typography
export const TYPOGRAPHY = {
  DISPLAY: {
    fontSize: 32,
    fontWeight: 'bold' as const,
  },
  HEADING_1: {
    fontSize: 24,
    fontWeight: '600' as const,
  },
  HEADING_2: {
    fontSize: 20,
    fontWeight: '500' as const,
  },
  BODY: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  CAPTION: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  BUTTON: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
} as const;

// Spacing (8px base unit)
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 24,
  XXL: 32,
  XXXL: 48,
  XXXXL: 64,
} as const;

// Border Radius
export const BORDER_RADIUS = {
  SM: 4,
  MD: 8,
  LG: 12,
  XL: 16,
  CIRCLE: 50,
} as const;

// Shadow
export const SHADOW = {
  SMALL: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  MEDIUM: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  LARGE: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Animation Durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__ ? 'http://localhost:3000/api' : 'https://api.fuelflow.com',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

// Firebase Configuration
export const FIREBASE_CONFIG = {
  COLLECTIONS: {
    USERS: 'users',
    ORDERS: 'orders',
    GAS_STATIONS: 'gasStations',
    PRICE_COMPARISONS: 'priceComparisons',
  },
} as const;

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_REGION: {
    latitude: 40.7128,
    longitude: -74.0060,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  ZOOM_LEVEL: 15,
} as const;

// Fuel Types
export const FUEL_TYPES = [
  { value: 'regular', label: 'Regular Gas', icon: '⛽' },
  { value: 'premium', label: 'Premium Gas', icon: '🏆' },
  { value: 'diesel', label: 'Diesel', icon: '🚛' },
] as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: { label: 'Pending', color: COLORS.WARNING_AMBER },
  CONFIRMED: { label: 'Confirmed', color: COLORS.PRIMARY_BLUE },
  EN_ROUTE: { label: 'En Route', color: COLORS.FUEL_ORANGE },
  DELIVERED: { label: 'Delivered', color: COLORS.SUCCESS_GREEN },
  CANCELLED: { label: 'Cancelled', color: COLORS.DANGER_RED },
} as const;

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PHONE_NUMBER_LENGTH: 10,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\d{10}$/,
  ZIP_CODE_REGEX: /^\d{5}(-\d{4})?$/,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'userToken',
  USER_DATA: 'userData',
  REMEMBER_ME: 'rememberMe',
  LAST_LOCATION: 'lastLocation',
  PREFERENCES: 'preferences',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long.`,
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  ORDER_PLACED: 'Order placed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_RESET: 'Password reset email sent!',
  PAYMENT_PROCESSED: 'Payment processed successfully!',
} as const;

// Screen Names
export const SCREEN_NAMES = {
  // Auth Stack
  WELCOME: 'Welcome',
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
  
  // Main Stack
  HOME: 'Home',
  ORDERS: 'Orders',
  PROFILE: 'Profile',
  HISTORY: 'History',
  ORDER_TRACKING: 'OrderTracking',
  ORDER_DETAILS: 'OrderDetails',
  PRICE_COMPARISON: 'PriceComparison',
  
  // Profile Stack
  EDIT_PROFILE: 'EditProfile',
  MANAGE_ADDRESSES: 'ManageAddresses',
  MANAGE_VEHICLES: 'ManageVehicles',
  PAYMENT_METHODS: 'PaymentMethods',
  SETTINGS: 'Settings',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  BIOMETRIC_AUTH: true,
  DARK_MODE: true,
  PUSH_NOTIFICATIONS: true,
  PRICE_ALERTS: true,
  RECURRING_ORDERS: true,
} as const;

// Business Rules
export const BUSINESS_RULES = {
  MIN_ORDER_QUANTITY: 5, // gallons
  MAX_ORDER_QUANTITY: 50, // gallons
  DELIVERY_FEE: 4.99,
  TAX_RATE: 0.08, // 8%
  MIN_DELIVERY_TIME: 30, // minutes
  MAX_DELIVERY_TIME: 180, // minutes
  PRICE_UPDATE_INTERVAL: 4 * 60 * 60 * 1000, // 4 hours in milliseconds
} as const;