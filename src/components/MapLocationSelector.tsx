import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Geolocation from 'react-native-geolocation-service';
import { SearchIcon, UndoIcon } from '../assets';

MapboxGL.setAccessToken(
  'sk.eyJ1IjoiZ2FtZW1wZXJvciIsImEiOiJjbWVoOGdsdnAwNW03Mmpvamk3ODEwbmp5In0.PLqz87n9PC-bXkHQwt9zZw',
);

interface LocationMarker {
  id: string;
  coordinate: [number, number];
  title?: string;
}

interface MapLocationSelectorProps {
  onLocationSelect: (
    location: string,
    coordinates?: { latitude: number; longitude: number }[],
  ) => void;
  initialValue?: string;
}

const MapLocationSelector: React.FC<MapLocationSelectorProps> = ({
  onLocationSelect,
  initialValue = '',
}) => {
  const [markers, setMarkers] = useState<LocationMarker[]>([]);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(initialValue);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    67.0011, 24.8607,
  ]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [zoomLevel, setZoomLevel] = useState(18);

  // Separate refs for main map
  const mainMapRef = useRef<MapboxGL.MapView>(null);
  const mainCameraRef = useRef<MapboxGL.Camera>(null);

  // Separate refs for modal map
  const modalMapRef = useRef<MapboxGL.MapView>(null);
  const modalCameraRef = useRef<MapboxGL.Camera>(null);

  const searchInputRef = useRef<TextInput>(null);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);
        return (
          granted['android.permission.ACCESS_FINE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.ACCESS_COARSE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        return false;
      }
    }
    return true;
  };

  const handleMapReady = useCallback(() => {
    setTimeout(() => {
      setIsMapReady(true);
    }, 500);
  }, []);

  const fetchCurrentLocation = useCallback(
    async (retries = 2) => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        console.warn('Location permission denied');
        return;
      }

      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          const coordinates: [number, number] = [longitude, latitude];

          setUserLocation(coordinates);
          setMapCenter(coordinates);

          if (isMapReady) {
            setTimeout(() => {
              mainCameraRef.current?.setCamera({
                centerCoordinate: coordinates,
                zoomLevel: 13,
                animationDuration: 1000,
              });
              modalCameraRef.current?.setCamera({
                centerCoordinate: coordinates,
                zoomLevel: 13,
                animationDuration: 1000,
              });
            }, 100);
          }
        },
        error => {
          if ((error.code === 3 || error.code === 4) && retries > 0) {
            console.log('Retrying location fetch...');
            fetchCurrentLocation(retries - 1);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 1000,
          forceRequestLocation: true,
          showLocationDialog: true,
        },
      );
    },
    [isMapReady],
  );

  useEffect(() => {
    if (isMapReady) {
      fetchCurrentLocation();
    }
  }, [isMapReady, fetchCurrentLocation]);

  const handleMapPress = (feature: any) => {
    if (!isBottomSheetVisible) {
      setIsBottomSheetVisible(true);
      return;
    }

    const coordinates = feature.geometry.coordinates;
    const newMarker: LocationMarker = {
      id: Date.now().toString(),
      coordinate: coordinates,
      title: searchText || `Location ${markers.length + 1}`,
    };
    setMarkers(prev => [...prev, newMarker]);
  };

  const handleUndo = () => {
    if (markers.length > 0) {
      setMarkers(prev => prev.slice(0, -1));
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query,
        )}.json?access_token=sk.eyJ1IjoiZ2FtZW1wZXJvciIsImEiOiJjbWVoOGdsdnAwNW03Mmpvamk3ODEwbmp5In0.PLqz87n9PC-bXkHQwt9zZw&limit=5`,
      );

      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Failed to search location');
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchText.length > 0) {
        handleSearch(searchText);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchText]);

  const handleSelectResult = (place: any) => {
    const [longitude, latitude] = place.center;

    const newMarker: LocationMarker = {
      id: Date.now().toString(),
      coordinate: [longitude, latitude],
      title: place.place_name,
    };

    setMarkers([newMarker]);
    setMapCenter([longitude, latitude]);
    setSearchText('');
    setSearchResults([]);
    searchInputRef.current?.blur();

    if (modalCameraRef.current) {
      setTimeout(() => {
        modalCameraRef.current?.setCamera({
          centerCoordinate: [longitude, latitude],
          zoomLevel: 14,
          animationDuration: 1000,
        });
      }, 100);
    }
  };

  const handleSave = () => {
    if (markers.length === 0) {
      Alert.alert(
        'No Location Selected',
        'Please select at least one location on the map',
      );
      return;
    }

    const locationName = searchText || 'Selected Locations';
    setSelectedLocation(locationName);

    const coordinates = markers.map(m => ({
      latitude: m.coordinate[1],
      longitude: m.coordinate[0],
    }));

    onLocationSelect(locationName, coordinates);
    setIsBottomSheetVisible(false);
  };

  const closeBottomSheet = () => {
    setIsBottomSheetVisible(false);
  };

  const renderMarkers = () => {
    return markers.map(marker => (
      <MapboxGL.PointAnnotation
        key={marker.id}
        id={marker.id}
        coordinate={marker.coordinate}
      >
        <View style={styles.markerContainer}>
          <View style={styles.marker} />
        </View>
        {marker.title && <MapboxGL.Callout title={marker.title} />}
      </MapboxGL.PointAnnotation>
    ));
  };

  return (
    <View style={styles.container}>
      {!isBottomSheetVisible && (
        <View style={styles.mapContainer}>
          <MapboxGL.MapView
            key="mainMap"
            ref={mainMapRef}  
            style={styles.map}
            onPress={handleMapPress}
            onDidFinishLoadingMap={handleMapReady}
            compassEnabled
            compassViewPosition={3}
            logoEnabled={false}
            attributionEnabled={false}
          >
            {mapCenter && (
              <MapboxGL.Camera
              key={'mainCamera'}
                ref={mainCameraRef}
                centerCoordinate={mapCenter}
                zoomLevel={zoomLevel}
              />
            )}
            <MapboxGL.UserLocation visible showsUserHeadingIndicator />
            {renderMarkers()}
          </MapboxGL.MapView>
        </View>
      )}

      <Modal
        visible={isBottomSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={closeBottomSheet}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            onPress={closeBottomSheet}
            activeOpacity={1}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.searchContainer}>
              <SearchIcon width={15} />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Search location..."
                placeholderTextColor={'#6B7280'}
                value={searchText}
                onChangeText={setSearchText}
                returnKeyType="search"
              />
            </View>

            {searchResults.length > 0 && (
              <View style={styles.dropdownContainer}>
                <FlatList
                  data={searchResults}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.resultItem}
                      onPress={() => handleSelectResult(item)}
                    >
                      <Text>{item.place_name}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            <View style={styles.InsideMapContainer}>
              <MapboxGL.MapView
                key="modalMap"
                ref={modalMapRef}
                style={styles.map}
                onPress={handleMapPress}
                scrollEnabled
                zoomEnabled
                rotateEnabled
                pitchEnabled
                compassEnabled
                logoEnabled={false}
                attributionEnabled={false}
              >
                {mapCenter && (
                  <MapboxGL.Camera
                  key={'modalCamera'}
                    ref={modalCameraRef}
                    centerCoordinate={mapCenter}
                    zoomLevel={zoomLevel}
                  />
                )}
                <MapboxGL.UserLocation visible showsUserHeadingIndicator />
                {renderMarkers()}
              </MapboxGL.MapView>

              <TouchableOpacity
                style={[
                  styles.undoButton,
                  markers.length === 0 && styles.undoButtonDisabled,
                ]}
                onPress={handleUndo}
                disabled={markers.length === 0}
              >
                <UndoIcon width={15} height={15} />
              </TouchableOpacity>
            </View>

            <View style={styles.infoCards}>
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>Safety Info</Text>
                <Text style={styles.infoCardDesc}>Local safety alerts</Text>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>Weather</Text>
                <Text style={styles.infoCardDesc}>
                  Current forecast updates
                </Text>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>Air Quality</Text>
                <Text style={styles.infoCardDesc}>Live AQI Status</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    zIndex: 100,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#111827' },
  dropdownContainer: {
    position: 'absolute',
    top: 90,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  mapContainer: { height: 130, borderRadius: 12, overflow: 'hidden' },
  InsideMapContainer: { height: 175, borderRadius: 12, overflow: 'hidden' },
  map: { flex: 1 },
  markerContainer: { alignItems: 'center', justifyContent: 'center' },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B6B',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  undoButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  undoButtonDisabled: { backgroundColor: '#F3F4F6' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBackground: { flex: 1 },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
    maxHeight: 550,
  },
  infoCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
    gap: 8,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  infoCardDesc: { fontSize: 12, color: '#000' },
  saveButton: {
    backgroundColor: '#6C9F1C',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default MapLocationSelector;