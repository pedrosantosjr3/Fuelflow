import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {Provider as PaperProvider} from 'react-native-paper';
import MapView from '../common/MapView';
import {LocationService} from '@/services/location';
import {Address} from '@/types';

// Mock the location service
jest.mock('@/services/location', () => ({
  LocationService: jest.fn().mockImplementation(() => ({
    requestLocationPermission: jest.fn().mockResolvedValue(true),
    getCurrentPosition: jest.fn().mockResolvedValue({
      latitude: 40.7128,
      longitude: -74.0060,
    }),
    calculateRoute: jest.fn().mockResolvedValue({
      distance: '5.2 miles',
      duration: '12 mins',
      polyline: 'mockPolylineString',
    }),
  })),
  useLocationService: jest.fn(),
}));

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const {View, Text} = require('react-native');
  
  const MockMapView = React.forwardRef((props: any, ref: any) => {
    return (
      <View testID="map-view" ref={ref}>
        <Text>Map View</Text>
        {props.children}
      </View>
    );
  });
  
  const MockMarker = (props: any) => (
    <View testID={`marker-${props.title}`} onTouchEnd={props.onPress}>
      <Text>{props.title}</Text>
    </View>
  );
  
  const MockPolyline = (props: any) => (
    <View testID="polyline">
      <Text>Route Polyline</Text>
    </View>
  );
  
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
    Polyline: MockPolyline,
    PROVIDER_GOOGLE: 'google',
  };
});

const mockLocationService = new LocationService() as jest.Mocked<LocationService>;
require('@/services/location').useLocationService.mockReturnValue(mockLocationService);

const mockAddresses: Address[] = [
  {
    addressId: 'addr1',
    label: 'Home',
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    coordinates: {latitude: 40.7128, longitude: -74.0060},
    isDefault: true,
  },
  {
    addressId: 'addr2',
    label: 'Work',
    street: '456 Broadway',
    city: 'New York',
    state: 'NY',
    zipCode: '10013',
    coordinates: {latitude: 40.7205, longitude: -74.0050},
    isDefault: false,
  },
];

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <PaperProvider>
      {component}
    </PaperProvider>
  );
};

describe('MapView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render map view', () => {
    const {getByTestId} = renderWithProvider(
      <MapView />
    );

    expect(getByTestId('map-view')).toBeTruthy();
  });

  it('should render address markers', () => {
    const {getByTestId} = renderWithProvider(
      <MapView addresses={mockAddresses} />
    );

    expect(getByTestId('marker-Home')).toBeTruthy();
    expect(getByTestId('marker-Work')).toBeTruthy();
  });

  it('should handle address selection', () => {
    const mockOnAddressSelect = jest.fn();
    
    const {getByTestId} = renderWithProvider(
      <MapView
        addresses={mockAddresses}
        onAddressSelect={mockOnAddressSelect}
      />
    );

    fireEvent.press(getByTestId('marker-Home'));

    expect(mockOnAddressSelect).toHaveBeenCalledWith(mockAddresses[0]);
  });

  it('should show user location when enabled', async () => {
    const {getByTestId} = renderWithProvider(
      <MapView showUserLocation={true} />
    );

    await waitFor(() => {
      expect(mockLocationService.requestLocationPermission).toHaveBeenCalled();
      expect(mockLocationService.getCurrentPosition).toHaveBeenCalled();
    });

    expect(getByTestId('marker-Your Location')).toBeTruthy();
  });

  it('should show route when enabled', async () => {
    const routeOrigin = {latitude: 40.7128, longitude: -74.0060};
    const routeDestination = {latitude: 40.7205, longitude: -74.0050};

    const {getByTestId} = renderWithProvider(
      <MapView
        showRoute={true}
        routeOrigin={routeOrigin}
        routeDestination={routeDestination}
      />
    );

    await waitFor(() => {
      expect(mockLocationService.calculateRoute).toHaveBeenCalledWith(
        routeOrigin,
        routeDestination
      );
    });

    expect(getByTestId('polyline')).toBeTruthy();
  });

  it('should handle map press when editable', () => {
    const mockOnMapPress = jest.fn();
    
    const {getByTestId} = renderWithProvider(
      <MapView
        editable={true}
        onMapPress={mockOnMapPress}
      />
    );

    const mapView = getByTestId('map-view');
    fireEvent(mapView, 'press', {
      nativeEvent: {
        coordinate: {latitude: 40.7128, longitude: -74.0060},
      },
    });

    expect(mockOnMapPress).toHaveBeenCalledWith({
      latitude: 40.7128,
      longitude: -74.0060,
    });
  });

  it('should show loading indicator during location fetch', async () => {
    // Make location request take time
    mockLocationService.getCurrentPosition.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        latitude: 40.7128,
        longitude: -74.0060,
      }), 100))
    );

    const {getByText} = renderWithProvider(
      <MapView showUserLocation={true} />
    );

    expect(getByText('Getting your location...')).toBeTruthy();

    await waitFor(() => {
      expect(mockLocationService.getCurrentPosition).toHaveBeenCalled();
    });
  });

  it('should handle location permission denied', async () => {
    mockLocationService.requestLocationPermission.mockResolvedValue(false);

    const {queryByTestId} = renderWithProvider(
      <MapView showUserLocation={true} />
    );

    await waitFor(() => {
      expect(mockLocationService.requestLocationPermission).toHaveBeenCalled();
    });

    // Should not show user location marker when permission denied
    expect(queryByTestId('marker-Your Location')).toBeFalsy();
  });

  it('should handle location fetch error', async () => {
    mockLocationService.getCurrentPosition.mockRejectedValue(
      new Error('Location not available')
    );

    const {queryByTestId} = renderWithProvider(
      <MapView showUserLocation={true} />
    );

    await waitFor(() => {
      expect(mockLocationService.getCurrentPosition).toHaveBeenCalled();
    });

    // Should not crash and not show user location marker
    expect(queryByTestId('marker-Your Location')).toBeFalsy();
  });

  it('should handle route calculation error', async () => {
    mockLocationService.calculateRoute.mockRejectedValue(
      new Error('Route calculation failed')
    );

    const routeOrigin = {latitude: 40.7128, longitude: -74.0060};
    const routeDestination = {latitude: 40.7205, longitude: -74.0050};

    const {queryByTestId} = renderWithProvider(
      <MapView
        showRoute={true}
        routeOrigin={routeOrigin}
        routeDestination={routeDestination}
      />
    );

    await waitFor(() => {
      expect(mockLocationService.calculateRoute).toHaveBeenCalled();
    });

    // Should not show route when calculation fails
    expect(queryByTestId('polyline')).toBeFalsy();
  });

  it('should show selected address marker differently', () => {
    const {getByTestId} = renderWithProvider(
      <MapView
        addresses={mockAddresses}
        selectedAddress={mockAddresses[0]}
      />
    );

    // The selected marker should be rendered (exact styling test would depend on implementation)
    expect(getByTestId('marker-Home')).toBeTruthy();
    expect(getByTestId('marker-Work')).toBeTruthy();
  });
});