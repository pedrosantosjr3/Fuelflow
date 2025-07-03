// Core Types
export interface User {
  userId: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  addresses: Address[];
  vehicles: Vehicle[];
  paymentMethods: PaymentMethod[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  addressId: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isDefault: boolean;
}

export interface Vehicle {
  vehicleId: string;
  make: string;
  model: string;
  year: number;
  fuelType: FuelType;
  tankCapacity: number;
  isDefault: boolean;
  image?: string;
}

export interface Order {
  orderId: string;
  userId: string;
  status: OrderStatus;
  fuelType: FuelType;
  quantity: number;
  pricePerGallon: number;
  deliveryFee: number;
  tax: number;
  totalAmount: number;
  deliveryAddress: Address;
  vehicle: Vehicle;
  scheduledTime: Date;
  specialInstructions?: string;
  driverId?: string;
  paymentMethodId: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface GasStation {
  stationId: string;
  name: string;
  brand: string;
  address: Address;
  currentPrices: {
    regular: number;
    premium: number;
    diesel: number;
    lastUpdated: Date;
  };
  priceHistory: PriceHistory[];
  distance: number;
  amenities: string[];
  isActive: boolean;
}

export interface PriceHistory {
  date: Date;
  regular: number;
  premium: number;
  diesel: number;
}

export interface PriceComparison {
  comparisonId: string;
  zipCode: string;
  fuelType: FuelType;
  ourPrice: number;
  marketAverage: number;
  nearbyStations: NearbyStation[];
  savings: {
    perGallon: number;
    percentage: number;
  };
  createdAt: Date;
}

export interface NearbyStation {
  stationId: string;
  name: string;
  price: number;
  distance: number;
}

export interface PaymentMethod {
  paymentMethodId: string;
  type: PaymentType;
  last4: string;
  isDefault: boolean;
}

// Enums
export enum FuelType {
  REGULAR = 'regular',
  PREMIUM = 'premium',
  DIESEL = 'diesel',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  EN_ROUTE = 'en_route',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentType {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  OrderTracking: { orderId: string };
  OrderDetails: { orderId: string };
  PriceComparison: { zipCode: string };
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Orders: undefined;
  Profile: undefined;
  History: undefined;
};

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface OrderForm {
  fuelType: FuelType;
  quantity: number;
  addressId: string;
  vehicleId: string;
  scheduledTime: Date;
  specialInstructions?: string;
}

// Hook Types
export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginForm) => Promise<void>;
  register: (userData: RegisterForm) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  createOrder: (orderData: OrderForm) => Promise<Order>;
  getOrder: (orderId: string) => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<void>;
  trackOrder: (orderId: string) => Promise<Order>;
}

// Component Props
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
  disabled?: boolean;
}