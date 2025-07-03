import {Platform, PermissionsAndroid, Alert} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {PERMISSIONS, request, check, RESULTS} from 'react-native-permissions';
import {getGoogleMapsApiKey, GOOGLE_MAPS_CONFIG, calculateDistance, formatAddress} from '@/config/maps';
import {Address} from '@/types';

// Location service for handling GPS and address operations
export class LocationService {
  private apiKey: string;

  constructor() {
    this.apiKey = getGoogleMapsApiKey();
  }

  // Request location permissions
  async requestLocationPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'FuelFlow needs access to your location to provide delivery services.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        return result === RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('Location permission error:', error);
      return false;
    }
  }

  // Check if location permission is granted
  async checkLocationPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const result = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        return result === RESULTS.GRANTED;
      } else {
        const result = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        return result === RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('Location permission check error:', error);
      return false;
    }
  }

  // Get current position
  async getCurrentPosition(): Promise<{latitude: number; longitude: number} | null> {
    return new Promise((resolve, reject) => {
      const hasPermission = this.checkLocationPermission();
      
      if (!hasPermission) {
        reject(new Error('Location permission not granted'));
        return;
      }

      Geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        error => {
          console.error('Get current position error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  // Watch position changes
  watchPosition(
    callback: (position: {latitude: number; longitude: number}) => void,
    errorCallback?: (error: any) => void
  ): number {
    return Geolocation.watchPosition(
      position => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        console.error('Watch position error:', error);
        errorCallback?.(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
        distanceFilter: 10, // Update every 10 meters
      }
    );
  }

  // Clear position watch
  clearWatch(watchId: number): void {
    Geolocation.clearWatch(watchId);
  }

  // Geocode address to coordinates
  async geocodeAddress(address: string): Promise<{latitude: number; longitude: number} | null> {
    try {
      const encodedAddress = encodeURIComponent(address);
      const url = `${GOOGLE_MAPS_CONFIG.GEOCODING.baseUrl}?address=${encodedAddress}&components=${GOOGLE_MAPS_CONFIG.GEOCODING.components}&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Geocode address error:', error);
      return null;
    }
  }

  // Reverse geocode coordinates to address
  async reverseGeocode(latitude: number, longitude: number): Promise<Address | null> {
    try {
      const url = `${GOOGLE_MAPS_CONFIG.GEOCODING.baseUrl}?latlng=${latitude},${longitude}&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const components = this.parseAddressComponents(result.address_components);
        
        return {
          addressId: `addr_${Date.now()}`,
          label: 'Current Location',
          street: `${components.street_number || ''} ${components.route || ''}`.trim(),
          city: components.locality || components.sublocality || '',
          state: components.administrative_area_level_1 || '',
          zipCode: components.postal_code || '',
          coordinates: {latitude, longitude},
          isDefault: false,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Reverse geocode error:', error);
      return null;
    }
  }

  // Get address suggestions (autocomplete)
  async getAddressSuggestions(input: string): Promise<Array<{placeId: string; description: string}>> {
    try {
      if (input.length < 3) return [];
      
      const encodedInput = encodeURIComponent(input);
      const url = `${GOOGLE_MAPS_CONFIG.PLACES.baseUrl}/autocomplete/json?input=${encodedInput}&types=${GOOGLE_MAPS_CONFIG.PLACES.types}&components=${GOOGLE_MAPS_CONFIG.GEOCODING.components}&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK') {
        return data.predictions.map((prediction: any) => ({
          placeId: prediction.place_id,
          description: prediction.description,
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Address suggestions error:', error);
      return [];
    }
  }

  // Get place details from place ID
  async getPlaceDetails(placeId: string): Promise<Address | null> {
    try {
      const url = `${GOOGLE_MAPS_CONFIG.PLACES.baseUrl}/details/json?place_id=${placeId}&fields=address_components,geometry,formatted_address&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK') {
        const result = data.result;
        const components = this.parseAddressComponents(result.address_components);
        const location = result.geometry.location;
        
        return {
          addressId: `addr_${Date.now()}`,
          label: 'Address',
          street: `${components.street_number || ''} ${components.route || ''}`.trim(),
          city: components.locality || components.sublocality || '',
          state: components.administrative_area_level_1 || '',
          zipCode: components.postal_code || '',
          coordinates: {
            latitude: location.lat,
            longitude: location.lng,
          },
          isDefault: false,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Place details error:', error);
      return null;
    }
  }

  // Calculate route between two points
  async calculateRoute(
    origin: {latitude: number; longitude: number},
    destination: {latitude: number; longitude: number}
  ): Promise<{
    distance: string;
    duration: string;
    polyline: string;
  } | null> {
    try {
      const originStr = `${origin.latitude},${origin.longitude}`;
      const destinationStr = `${destination.latitude},${destination.longitude}`;
      const url = `${GOOGLE_MAPS_CONFIG.DIRECTIONS.baseUrl}?origin=${originStr}&destination=${destinationStr}&mode=${GOOGLE_MAPS_CONFIG.DIRECTIONS.mode}&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];
        
        return {
          distance: leg.distance.text,
          duration: leg.duration.text,
          polyline: route.overview_polyline.points,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Calculate route error:', error);
      return null;
    }
  }

  // Find nearby gas stations
  async findNearbyGasStations(
    latitude: number,
    longitude: number,
    radius: number = 5000 // 5km radius
  ): Promise<Array<{
    placeId: string;
    name: string;
    address: string;
    coordinates: {latitude: number; longitude: number};
    distance: number;
    rating?: number;
  }>> {
    try {
      const url = `${GOOGLE_MAPS_CONFIG.PLACES.baseUrl}/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=gas_station&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK') {
        return data.results.map((place: any) => ({
          placeId: place.place_id,
          name: place.name,
          address: place.vicinity,
          coordinates: {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
          },
          distance: calculateDistance(
            latitude,
            longitude,
            place.geometry.location.lat,
            place.geometry.location.lng
          ),
          rating: place.rating,
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Find nearby gas stations error:', error);
      return [];
    }
  }

  // Validate delivery address
  async validateDeliveryAddress(address: Address): Promise<{valid: boolean; message?: string}> {
    try {
      // Check if coordinates are valid
      if (!address.coordinates || 
          address.coordinates.latitude < -90 || address.coordinates.latitude > 90 ||
          address.coordinates.longitude < -180 || address.coordinates.longitude > 180) {
        return {valid: false, message: 'Invalid coordinates'};
      }

      // Check if address is in service area (example: within 50 miles of NYC)
      const serviceCenter = GOOGLE_MAPS_CONFIG.DEFAULT_REGION;
      const distance = calculateDistance(
        serviceCenter.latitude,
        serviceCenter.longitude,
        address.coordinates.latitude,
        address.coordinates.longitude
      );

      if (distance > 50) {
        return {valid: false, message: 'Address is outside our service area'};
      }

      return {valid: true};
    } catch (error) {
      console.error('Validate delivery address error:', error);
      return {valid: false, message: 'Unable to validate address'};
    }
  }

  // Parse Google Maps address components
  private parseAddressComponents(components: any[]): Record<string, string> {
    const parsed: Record<string, string> = {};
    
    components.forEach(component => {
      const types = component.types;
      const value = component.long_name;
      
      if (types.includes('street_number')) {
        parsed.street_number = value;
      } else if (types.includes('route')) {
        parsed.route = value;
      } else if (types.includes('locality')) {
        parsed.locality = value;
      } else if (types.includes('sublocality')) {
        parsed.sublocality = value;
      } else if (types.includes('administrative_area_level_1')) {
        parsed.administrative_area_level_1 = component.short_name;
      } else if (types.includes('postal_code')) {
        parsed.postal_code = value;
      }
    });
    
    return parsed;
  }
}

// Hook for using location service
export const useLocationService = () => {
  return new LocationService();
};

// Location utility functions
export const LocationUtils = {
  calculateDistance,
  formatAddress,
  
  // Check if location is within bounds
  isWithinBounds: (
    location: {latitude: number; longitude: number},
    bounds: {
      northeast: {latitude: number; longitude: number};
      southwest: {latitude: number; longitude: number};
    }
  ): boolean => {
    return (
      location.latitude <= bounds.northeast.latitude &&
      location.latitude >= bounds.southwest.latitude &&
      location.longitude <= bounds.northeast.longitude &&
      location.longitude >= bounds.southwest.longitude
    );
  },
  
  // Get center point between multiple locations
  getCenterPoint: (locations: Array<{latitude: number; longitude: number}>): {latitude: number; longitude: number} => {
    if (locations.length === 0) return {latitude: 0, longitude: 0};
    
    const sum = locations.reduce(
      (acc, loc) => ({
        latitude: acc.latitude + loc.latitude,
        longitude: acc.longitude + loc.longitude,
      }),
      {latitude: 0, longitude: 0}
    );
    
    return {
      latitude: sum.latitude / locations.length,
      longitude: sum.longitude / locations.length,
    };
  },
};

export default LocationService;