import React, {useRef, useEffect, useState} from 'react';
import {StyleSheet, View, Text, ActivityIndicator} from 'react-native';
import MapView, {Marker, Polyline, Region, PROVIDER_GOOGLE} from 'react-native-maps';
import {Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {useLocationService, LocationUtils} from '@/services/location';
import {GOOGLE_MAPS_CONFIG, createRegion, MAP_ZOOM_LEVELS} from '@/config/maps';
import {COLORS, SPACING} from '@/constants';
import {Address} from '@/types';

interface MapViewProps {
  initialRegion?: Region;
  addresses?: Address[];
  selectedAddress?: Address;
  onAddressSelect?: (address: Address) => void;
  showUserLocation?: boolean;
  showRoute?: boolean;
  routeOrigin?: {latitude: number; longitude: number};
  routeDestination?: {latitude: number; longitude: number};
  onRegionChange?: (region: Region) => void;
  style?: any;
  editable?: boolean;
  onMapPress?: (coordinate: {latitude: number; longitude: number}) => void;
}

const CustomMapView: React.FC<MapViewProps> = ({
  initialRegion = GOOGLE_MAPS_CONFIG.DEFAULT_REGION,
  addresses = [],
  selectedAddress,
  onAddressSelect,
  showUserLocation = true,
  showRoute = false,
  routeOrigin,
  routeDestination,
  onRegionChange,
  style,
  editable = false,
  onMapPress,
}) => {
  const mapRef = useRef<MapView>(null);
  const locationService = useLocationService();
  
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{latitude: number; longitude: number}>>([]);
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Get user's current location
  useEffect(() => {
    if (showUserLocation) {
      getCurrentLocation();
    }
  }, [showUserLocation]);

  // Calculate route when origin and destination change
  useEffect(() => {
    if (showRoute && routeOrigin && routeDestination) {
      calculateRoute();
    }
  }, [showRoute, routeOrigin, routeDestination]);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const hasPermission = await locationService.requestLocationPermission();
      
      if (hasPermission) {
        const position = await locationService.getCurrentPosition();
        if (position) {
          setUserLocation(position);
          
          // Center map on user location if no initial region
          if (mapRef.current && !addresses.length) {
            const region = createRegion(position.latitude, position.longitude, MAP_ZOOM_LEVELS.NEIGHBORHOOD);
            mapRef.current.animateToRegion(region, 1000);
          }
        }
      }
    } catch (error) {
      console.error('Get current location error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRoute = async () => {
    if (!routeOrigin || !routeDestination) return;
    
    try {
      const route = await locationService.calculateRoute(routeOrigin, routeDestination);
      if (route) {
        // Decode polyline to coordinates
        const coordinates = decodePolyline(route.polyline);
        setRouteCoordinates(coordinates);
        
        // Fit map to show entire route
        if (mapRef.current && coordinates.length > 0) {
          mapRef.current.fitToCoordinates(coordinates, {
            edgePadding: {top: 50, right: 50, bottom: 50, left: 50},
            animated: true,
          });
        }
      }
    } catch (error) {
      console.error('Calculate route error:', error);
    }
  };

  const handleMarkerPress = (address: Address) => {
    onAddressSelect?.(address);
    
    // Center map on selected address
    if (mapRef.current) {
      const region = createRegion(
        address.coordinates.latitude,
        address.coordinates.longitude,
        MAP_ZOOM_LEVELS.STREET
      );
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  const handleMapPress = (event: any) => {
    if (editable && onMapPress) {
      const {latitude, longitude} = event.nativeEvent.coordinate;
      onMapPress({latitude, longitude});
    }
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      const region = createRegion(
        userLocation.latitude,
        userLocation.longitude,
        MAP_ZOOM_LEVELS.NEIGHBORHOOD
      );
      mapRef.current.animateToRegion(region, 1000);
    } else {
      getCurrentLocation();
    }
  };

  const fitToAddresses = () => {
    if (addresses.length > 0 && mapRef.current) {
      const coordinates = addresses.map(addr => addr.coordinates);
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: {top: 50, right: 50, bottom: 50, left: 50},
        animated: true,
      });
    }
  };

  // Simple polyline decoder (you might want to use a library for this)
  const decodePolyline = (encoded: string): Array<{latitude: number; longitude: number}> => {
    // This is a simplified decoder - use @mapbox/polyline or similar for production
    const poly = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;
      
      shift = 0;
      result = 0;
      
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;
      
      poly.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    
    return poly;
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        onMapReady={() => setMapReady(true)}
        onRegionChangeComplete={onRegionChange}
        onPress={handleMapPress}
        mapType="standard"
        customMapStyle={GOOGLE_MAPS_CONFIG.MAP_STYLES.standard}>
        
        {/* Address markers */}
        {addresses.map((address, index) => (
          <Marker
            key={address.addressId}
            coordinate={address.coordinates}
            title={address.label}
            description={`${address.street}, ${address.city}`}
            onPress={() => handleMarkerPress(address)}
            pinColor={selectedAddress?.addressId === address.addressId ? COLORS.FUEL_ORANGE : COLORS.PRIMARY_BLUE}>
            <View style={[
              styles.markerContainer,
              selectedAddress?.addressId === address.addressId && styles.selectedMarker
            ]}>
              <Icon
                name="location-on"
                size={30}
                color={selectedAddress?.addressId === address.addressId ? COLORS.FUEL_ORANGE : COLORS.PRIMARY_BLUE}
              />
            </View>
          </Marker>
        ))}

        {/* User location marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            pinColor={COLORS.SUCCESS_GREEN}>
            <View style={[styles.markerContainer, styles.userMarker]}>
              <Icon name="my-location" size={20} color={COLORS.PURE_WHITE} />
            </View>
          </Marker>
        )}

        {/* Route polyline */}
        {showRoute && routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={COLORS.PRIMARY_BLUE}
            strokeWidth={4}
            lineDashPattern={[0]}
          />
        )}
      </MapView>

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY_BLUE} />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      )}

      {/* Map controls */}
      <View style={styles.controls}>
        {showUserLocation && (
          <Button
            mode="contained"
            onPress={centerOnUser}
            style={styles.controlButton}
            icon="my-location"
            compact>
            My Location
          </Button>
        )}
        
        {addresses.length > 1 && (
          <Button
            mode="contained"
            onPress={fitToAddresses}
            style={styles.controlButton}
            icon="fit-to-page"
            compact>
            Fit All
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedMarker: {
    transform: [{scale: 1.2}],
  },
  userMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.SUCCESS_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.PURE_WHITE,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -50}, {translateY: -50}],
    backgroundColor: COLORS.PURE_WHITE,
    padding: SPACING.LG,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
  },
  loadingText: {
    marginTop: SPACING.SM,
    color: COLORS.DARK_SLATE,
  },
  controls: {
    position: 'absolute',
    bottom: SPACING.LG,
    right: SPACING.LG,
    gap: SPACING.SM,
  },
  controlButton: {
    backgroundColor: COLORS.PRIMARY_BLUE,
    borderRadius: 8,
  },
});

export default CustomMapView;