import { StyleSheet, Text, View, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import React, { useRef } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRestaurants, useRestaurantMarkers } from '@/hooks/useRestaurants';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const Page = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const { data: restaurants, isLoading: restaurantsLoading } = useRestaurants();
  const { data: restaurantMarkers, isLoading: markersLoading } = useRestaurantMarkers();

  // Función corregida con solicitud de permisos
  const locateMe = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Se requieren permisos de ubicación para centrar el mapa.');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    mapRef.current?.animateToRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);
  };

  const markerSelected = (restaurantId: string) => {
    console.log('Restaurante seleccionado:', restaurantId);
    // Aquí podrías navegar al detalle: router.push(`/restaurant/${restaurantId}`);
  };

  if (restaurantsLoading || markersLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size={"large"} color={Colors.secondary} />
      </View>
    );
  }

  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    return (
      <View style={styles.container}>
        <MapView 
          ref={mapRef}
          provider={PROVIDER_GOOGLE} // 👈 Forzar el proveedor de Google Maps
          style={StyleSheet.absoluteFillObject} 
          initialRegion={{
            latitude: restaurantMarkers?.[0]?.latitude || 7.7669,
            longitude: restaurantMarkers?.[0]?.longitude || -72.2250,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={true} // 👈 Muestra el punto azul del usuario
          showsMyLocationButton={false} // Desactivamos el nativo para usar nuestro botón custom
        >
          {restaurantMarkers?.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              title={marker.name}
              onPress={() => markerSelected(marker.id)}
            />
          ))}
        </MapView>

        {/* Botón flotante para regresar */}
        <TouchableOpacity 
          style={[styles.floatingButton, { top: insets.top + 10, left: 16 }]} 
          onPress={() => router.back()}
        >
          <Ionicons name="close-outline" size={24} color="#000" />
        </TouchableOpacity>

        {/* Botón flotante para ubicar al usuario */}
        <TouchableOpacity 
          style={[styles.floatingButton, { bottom: insets.bottom + 20, right: 16 }]} 
          onPress={locateMe}
        >
          <Ionicons name="locate-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    );
  } else {
    return <Text>El mapa no es compatible con esta plataforma.</Text>;
  }
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  floatingButton: {
    position: 'absolute',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});