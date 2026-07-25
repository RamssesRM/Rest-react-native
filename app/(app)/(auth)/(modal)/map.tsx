import { Colors } from "@/constants/theme";
import { useRestaurantMarkers, useRestaurants } from "@/hooks/useRestaurants";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react"; // 👈 Asegúrate de importar useEffect
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Page = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const { data: restaurants, isLoading: restaurantsLoading } = useRestaurants();
  const { data: restaurantMarkers, isLoading: markersLoading } =
    useRestaurantMarkers();

  // 🔴 AQUÍ VA EL BLOQUE DE CÓDIGO 🔴
  useEffect(() => {
    if (restaurantMarkers && restaurantMarkers.length > 0 && mapRef.current) {
      const coordinates = restaurantMarkers.map((m) => ({
        latitude: m.latitude,
        longitude: m.longitude,
      }));

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
        animated: true,
      });
    }
  }, [restaurantMarkers]);

  const locateMe = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Se requieren permisos de ubicación.");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    mapRef.current?.animateToRegion(
      {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000,
    );
  };

  const markerSelected = (restaurantId: string) => {
    console.log("Restaurante seleccionado:", restaurantId);
  };

  if (restaurantsLoading || markersLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size={"large"} color={Colors.secondary} />
      </View>
    );
  }

  if (Platform.OS === "android" || Platform.OS === "ios") {
    return (
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: restaurantMarkers?.[0]?.latitude || 7.7669,
            longitude: restaurantMarkers?.[0]?.longitude || -72.225,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={true}
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

        {/* Botón flotante para cerrar */}
        <TouchableOpacity
          style={[styles.floatingButton, { top: insets.top + 10, left: 16 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="close-outline" size={24} color="#000" />
        </TouchableOpacity>

        {/* Botón flotante para ubicar */}
        <TouchableOpacity
          style={[
            styles.floatingButton,
            { bottom: insets.bottom + 20, right: 16 },
          ]}
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  floatingButton: {
    position: "absolute",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
