import { Colors } from "@/constants/theme";
import { useRestaurantMarkers, useRestaurants } from "@/hooks/useRestaurants";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Page = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const { data: restaurants } = useRestaurants();
  const { data: restaurantMarkers, isLoading: markersLoading } =
    useRestaurantMarkers();

  const [mapReady, setMapReady] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);

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
  }, [restaurantMarkers, mapReady]);

  const locateMe = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Se requieren permisos de ubicación.");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setUserLocation(location);
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

  const openDirections = async (destLat: number, destLng: number) => {
    let originParam = "";

    if (userLocation) {
      originParam = `origin=${userLocation.coords.latitude},${userLocation.coords.longitude}&`;
    } else {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation(loc);
        originParam = `origin=${loc.coords.latitude},${loc.coords.longitude}&`;
      }
    }

    const url = `https://www.google.com/maps/dir/?${originParam}destination=${destLat},${destLng}&travelmode=driving`;

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "No se puede abrir Google Maps.");
    }
  };

  const onMapReady = useCallback(() => {
    setMapReady(true);
  }, []);

  const selectedRestaurant = selectedId
    ? restaurants?.find((r) => r.id === selectedId)
    : null;

  if (markersLoading) {
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
            latitude: restaurantMarkers?.[0]?.latitude || 7.7776,
            longitude: restaurantMarkers?.[0]?.longitude || -72.2333,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={true}
          onMapReady={onMapReady}
        >
          {restaurantMarkers?.map((marker) => {
            const restaurant = restaurants?.find((r) => r.id === marker.id);
            return (
              <Marker
                key={marker.id}
                coordinate={{
                  latitude: marker.latitude,
                  longitude: marker.longitude,
                }}
                title={marker.name}
                onPress={() => setSelectedId(marker.id)}
              >
                <Callout
                  tooltip
                  onPress={() => {
                    if (selectedRestaurant) {
                      openDirections(
                        selectedRestaurant.location.latitude,
                        selectedRestaurant.location.longitude,
                      );
                    }
                  }}
                >
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle} numberOfLines={1}>
                      {marker.name}
                    </Text>

                    {restaurant && (
                      <>
                        <Text style={styles.calloutAddress} numberOfLines={1}>
                          {restaurant.location.address}
                        </Text>

                        <View style={styles.calloutRow}>
                          <Ionicons name="star" size={14} color="#FFB800" />
                          <Text style={styles.calloutRating}>
                            {marker.rating}
                          </Text>
                          <Text style={styles.calloutDot}> • </Text>
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color="#666"
                          />
                          <Text style={styles.calloutDelivery}>
                            {marker.deliveryTime}
                          </Text>
                        </View>

                        <Text style={styles.calloutCuisine} numberOfLines={1}>
                          {marker.cuisine.join(" • ")}
                        </Text>

                        <View style={styles.calloutDivider} />

                        <View style={styles.calloutDirectionsRow}>
                          <Ionicons
                            name="navigate-outline"
                            size={16}
                            color="#4285F4"
                          />
                          <Text style={styles.calloutDirectionsText}>
                            Cómo llegar
                          </Text>
                        </View>

                        {!restaurant.isOpen && (
                          <Text style={styles.calloutClosed}>
                            Cerrado ahora
                          </Text>
                        )}
                      </>
                    )}
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>

        <TouchableOpacity
          style={[styles.floatingButton, { top: insets.top + 10, left: 16 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="close-outline" size={24} color="#000" />
        </TouchableOpacity>

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
  calloutContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    minWidth: 220,
    maxWidth: 260,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  calloutAddress: {
    fontSize: 12,
    color: "#888",
    marginBottom: 6,
  },
  calloutRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  calloutRating: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginLeft: 3,
  },
  calloutDot: {
    fontSize: 13,
    color: "#ccc",
  },
  calloutDelivery: {
    fontSize: 13,
    color: "#666",
    marginLeft: 2,
  },
  calloutCuisine: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  calloutDivider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 8,
  },
  calloutDirectionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 4,
  },
  calloutDirectionsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4285F4",
  },
  calloutClosed: {
    fontSize: 11,
    color: "#E53935",
    fontWeight: "500",
    marginTop: 4,
    textAlign: "center",
  },
});
