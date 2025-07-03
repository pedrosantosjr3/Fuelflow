import {LocationService, LocationUtils} from '../location';
import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: {OS: 'android'},
  PermissionsAndroid: {
    PERMISSIONS: {
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
    },
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
    },
    request: jest.fn(),
  },
}));

jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
}));

jest.mock('react-native-permissions', () => ({
  PERMISSIONS: {
    IOS: {
      LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
    },
    ANDROID: {
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
  },
  request: jest.fn(),
  check: jest.fn(),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

const mockGeolocation = Geolocation as jest.Mocked<typeof Geolocation>;
const mockPermissionsAndroid = PermissionsAndroid as jest.Mocked<typeof PermissionsAndroid>;
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('LocationService', () => {
  let locationService: LocationService;

  beforeEach(() => {
    locationService = new LocationService();
    jest.clearAllMocks();
  });

  describe('requestLocationPermission', () => {
    it('should request Android permission successfully', async () => {
      Platform.OS = 'android';
      mockPermissionsAndroid.request.mockResolvedValue('granted');

      const result = await locationService.requestLocationPermission();

      expect(mockPermissionsAndroid.request).toHaveBeenCalledWith(
        'android.permission.ACCESS_FINE_LOCATION',
        expect.any(Object)
      );
      expect(result).toBe(true);
    });

    it('should handle Android permission denial', async () => {
      Platform.OS = 'android';
      mockPermissionsAndroid.request.mockResolvedValue('denied');

      const result = await locationService.requestLocationPermission();

      expect(result).toBe(false);
    });

    it('should handle permission request error', async () => {
      Platform.OS = 'android';
      mockPermissionsAndroid.request.mockRejectedValue(new Error('Permission error'));

      const result = await locationService.requestLocationPermission();

      expect(result).toBe(false);
    });
  });

  describe('getCurrentPosition', () => {
    it('should get current position successfully', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition as any);
      });

      const result = await locationService.getCurrentPosition();

      expect(result).toEqual({
        latitude: 40.7128,
        longitude: -74.0060,
      });
    });

    it('should handle geolocation error', async () => {
      const mockError = new Error('Location not available');

      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error!(mockError as any);
      });

      await expect(locationService.getCurrentPosition()).rejects.toThrow('Location not available');
    });
  });

  describe('geocodeAddress', () => {
    it('should geocode address successfully', async () => {
      const mockResponse = {
        status: 'OK',
        results: [{
          geometry: {
            location: {
              lat: 40.7128,
              lng: -74.0060,
            },
          },
        }],
      };

      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      } as any);

      const result = await locationService.geocodeAddress('123 Main St, New York, NY');

      expect(result).toEqual({
        latitude: 40.7128,
        longitude: -74.0060,
      });
    });

    it('should handle geocoding failure', async () => {
      const mockResponse = {
        status: 'ZERO_RESULTS',
        results: [],
      };

      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      } as any);

      const result = await locationService.geocodeAddress('Invalid Address');

      expect(result).toBe(null);
    });

    it('should handle geocoding API error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await locationService.geocodeAddress('123 Main St');

      expect(result).toBe(null);
    });
  });

  describe('reverseGeocode', () => {
    it('should reverse geocode coordinates successfully', async () => {
      const mockResponse = {
        status: 'OK',
        results: [{
          address_components: [
            {types: ['street_number'], long_name: '123'},
            {types: ['route'], long_name: 'Main St'},
            {types: ['locality'], long_name: 'New York'},
            {types: ['administrative_area_level_1'], short_name: 'NY'},
            {types: ['postal_code'], long_name: '10001'},
          ],
        }],
      };

      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      } as any);

      const result = await locationService.reverseGeocode(40.7128, -74.0060);

      expect(result).toMatchObject({
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        coordinates: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
      });
    });

    it('should handle reverse geocoding failure', async () => {
      const mockResponse = {
        status: 'ZERO_RESULTS',
        results: [],
      };

      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      } as any);

      const result = await locationService.reverseGeocode(0, 0);

      expect(result).toBe(null);
    });
  });

  describe('calculateRoute', () => {
    it('should calculate route successfully', async () => {
      const mockResponse = {
        status: 'OK',
        routes: [{
          legs: [{
            distance: {text: '5.2 miles'},
            duration: {text: '12 mins'},
          }],
          overview_polyline: {
            points: 'mockPolylineString',
          },
        }],
      };

      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      } as any);

      const origin = {latitude: 40.7128, longitude: -74.0060};
      const destination = {latitude: 40.7205, longitude: -74.0050};

      const result = await locationService.calculateRoute(origin, destination);

      expect(result).toEqual({
        distance: '5.2 miles',
        duration: '12 mins',
        polyline: 'mockPolylineString',
      });
    });

    it('should handle route calculation failure', async () => {
      const mockResponse = {
        status: 'ZERO_RESULTS',
        routes: [],
      };

      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      } as any);

      const origin = {latitude: 40.7128, longitude: -74.0060};
      const destination = {latitude: 40.7205, longitude: -74.0050};

      const result = await locationService.calculateRoute(origin, destination);

      expect(result).toBe(null);
    });
  });

  describe('validateDeliveryAddress', () => {
    it('should validate address within service area', async () => {
      const address = {
        addressId: 'addr1',
        label: 'Home',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        coordinates: {latitude: 40.7128, longitude: -74.0060},
        isDefault: true,
      };

      const result = await locationService.validateDeliveryAddress(address);

      expect(result).toEqual({valid: true});
    });

    it('should reject address outside service area', async () => {
      const address = {
        addressId: 'addr1',
        label: 'Remote',
        street: '123 Remote St',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        coordinates: {latitude: 34.0522, longitude: -118.2437}, // LA coordinates
        isDefault: false,
      };

      const result = await locationService.validateDeliveryAddress(address);

      expect(result).toEqual({
        valid: false,
        message: 'Address is outside our service area',
      });
    });

    it('should reject address with invalid coordinates', async () => {
      const address = {
        addressId: 'addr1',
        label: 'Invalid',
        street: '123 Invalid St',
        city: 'Nowhere',
        state: 'XX',
        zipCode: '00000',
        coordinates: {latitude: 999, longitude: 999}, // Invalid coordinates
        isDefault: false,
      };

      const result = await locationService.validateDeliveryAddress(address);

      expect(result).toEqual({
        valid: false,
        message: 'Invalid coordinates',
      });
    });
  });
});

describe('LocationUtils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      const distance = LocationUtils.calculateDistance(
        40.7128, -74.0060, // NYC
        40.7589, -73.9851  // Times Square
      );

      expect(distance).toBeCloseTo(2.9, 1); // Approximately 2.9 miles
    });

    it('should return 0 for same coordinates', () => {
      const distance = LocationUtils.calculateDistance(
        40.7128, -74.0060,
        40.7128, -74.0060
      );

      expect(distance).toBe(0);
    });
  });

  describe('isWithinBounds', () => {
    it('should return true for location within bounds', () => {
      const location = {latitude: 40.7128, longitude: -74.0060};
      const bounds = {
        northeast: {latitude: 41.0, longitude: -73.0},
        southwest: {latitude: 40.0, longitude: -75.0},
      };

      const result = LocationUtils.isWithinBounds(location, bounds);

      expect(result).toBe(true);
    });

    it('should return false for location outside bounds', () => {
      const location = {latitude: 42.0, longitude: -74.0060};
      const bounds = {
        northeast: {latitude: 41.0, longitude: -73.0},
        southwest: {latitude: 40.0, longitude: -75.0},
      };

      const result = LocationUtils.isWithinBounds(location, bounds);

      expect(result).toBe(false);
    });
  });

  describe('getCenterPoint', () => {
    it('should calculate center point of multiple locations', () => {
      const locations = [
        {latitude: 40.0, longitude: -74.0},
        {latitude: 41.0, longitude: -73.0},
        {latitude: 40.5, longitude: -73.5},
      ];

      const center = LocationUtils.getCenterPoint(locations);

      expect(center.latitude).toBeCloseTo(40.5, 1);
      expect(center.longitude).toBeCloseTo(-73.5, 1);
    });

    it('should return origin for empty locations array', () => {
      const center = LocationUtils.getCenterPoint([]);

      expect(center).toEqual({latitude: 0, longitude: 0});
    });

    it('should return same point for single location', () => {
      const locations = [{latitude: 40.7128, longitude: -74.0060}];
      const center = LocationUtils.getCenterPoint(locations);

      expect(center).toEqual({latitude: 40.7128, longitude: -74.0060});
    });
  });
});