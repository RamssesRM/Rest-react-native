import { useTheme } from "@/hooks/use-theme";
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
import MapView, { Callout, Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HELUZ_COORDS = { latitude: 7.777850508202828, longitude: -72.2333325 };
const DEFAULT_ORIGIN = { latitude: 7.7745, longitude: -72.2310 };
const DIRECTIONS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_DIRECTIONS_API_KEY ?? "";

function decodePolyline(encoded: string): { latitude: number; longitude: number }[] {
  const points: { latitude: number; longitude: number }[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return points;
}

async function fetchRoute(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): Promise<{ coords: { latitude: number; longitude: number }[]; distance: string; duration: string }> {
  if (!DIRECTIONS_API_KEY) {
    console.warn("Directions API key no configurada");
    return { coords: [origin, destination], distance: "", duration: "" };
  }

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=driving&key=${DIRECTIONS_API_KEY}`;

  console.log("Fetching route:", url);
  const response = await fetch(url);
  const data = await response.json();

  console.log("Directions API response:", data.status);

  if (data.routes && data.routes.length > 0) {
    const route = data.routes[0];
    const encodedPolyline = route.overview_polyline.points;
    const leg = route.legs[0];
    return {
      coords: decodePolyline(encodedPolyline),
      distance: leg.distance.text,
      duration: leg.duration.text,
    };
  }

  console.warn("No routes found:", data);
  return { coords: [origin, destination], distance: "", duration: "" };
}

const Page = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const { colors } = useTheme();

  const { data: restaurants } = useRestaurants();
  const { data: restaurantMarkers, isLoading: markersLoading } =
    useRestaurantMarkers();

  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);
  const [routeCoords, setRouteCoords] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [routeInfo, setRouteInfo] = useState({ distance: "", duration: "" });
  const [routeLoading, setRouteLoading] = useState(false);
  const [origin, setOrigin] = useState(DEFAULT_ORIGIN);

  useEffect(() => {
    loadDefaultRoute();
  }, []);

  const loadDefaultRoute = async () => {
    setRouteLoading(true);
    try {
      const result = await fetchRoute(DEFAULT_ORIGIN, HELUZ_COORDS);
      setRouteCoords(result.coords);
      setRouteInfo({ distance: result.distance, duration: result.duration });
      setOrigin(DEFAULT_ORIGIN);

      if (mapRef.current && result.coords.length > 0) {
        mapRef.current.fitToCoordinates(result.coords, {
          edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
          animated: true,
        });
      }
    } catch (error) {
      console.log("Error obteniendo ruta:", error);
    } finally {
      setRouteLoading(false);
    }
  };

  const locateMe = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Se requieren permisos de ubicación.");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setUserLocation(location);
    const newOrigin = { latitude: location.coords.latitude, longitude: location.coords.longitude };
    setOrigin(newOrigin);

    setRouteLoading(true);
    try {
      const result = await fetchRoute(newOrigin, HELUZ_COORDS);
      setRouteCoords(result.coords);
      setRouteInfo({ distance: result.distance, duration: result.duration });

      if (mapRef.current && result.coords.length > 0) {
        mapRef.current.fitToCoordinates(result.coords, {
          edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
          animated: true,
        });
      }
    } catch (error) {
      console.log("Error obteniendo ruta:", error);
    } finally {
      setRouteLoading(false);
    }
  };

  const openInGoogleMaps = async () => {
    const originParam = `origin=${origin.latitude},${origin.longitude}`;
    const destParam = `destination=${HELUZ_COORDS.latitude},${HELUZ_COORDS.longitude}`;
    const url = `https://www.google.com/maps/dir/?${originParam}&${destParam}&travelmode=driving`;

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

  const s = styles(colors);

  if (markersLoading) {
    return (
      <View style={s.loaderContainer}>
        <ActivityIndicator size={"large"} color={colors.secondary} />
      </View>
    );
  }

  if (Platform.OS === "android" || Platform.OS === "ios") {
    return (
      <View style={s.container}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: HELUZ_COORDS.latitude,
            longitude: HELUZ_COORDS.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          onMapReady={onMapReady}
        >
          {restaurantMarkers?.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              title={marker.name}
              description="San Cristóbal, Táchira"
            >
              <Callout
                tooltip
                onPress={openInGoogleMaps}
              >
                <View style={s.calloutContainer}>
                  <Text style={s.calloutTitle} numberOfLines={1}>
                    {marker.name}
                  </Text>

                  <Text style={s.calloutAddress} numberOfLines={1}>
                    San Cristóbal, Táchira, Venezuela
                  </Text>

                  <View style={s.calloutRow}>
                    <Ionicons name="star" size={14} color="#FFB800" />
                    <Text style={s.calloutRating}>
                      {marker.rating}
                    </Text>
                    <Text style={s.calloutDot}> • </Text>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={colors.textMuted}
                    />
                    <Text style={s.calloutDelivery}>
                      {marker.deliveryTime}
                    </Text>
                  </View>

                  <Text style={s.calloutCuisine} numberOfLines={1}>
                    {marker.cuisine.join(" • ")}
                  </Text>

                  <View style={s.calloutDivider} />

                  <View style={s.calloutDirectionsRow}>
                    <Ionicons
                      name="navigate-outline"
                      size={16}
                      color="#4285F4"
                    />
                    <Text style={s.calloutDirectionsText}>
                      Cómo llegar
                    </Text>
                  </View>
                </View>
              </Callout>
            </Marker>
          ))}

          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor="#4285F4"
              strokeWidth={4}
            />
          )}
        </MapView>

        <TouchableOpacity
          style={[s.floatingButton, { top: insets.top + 10, left: 16 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="close-outline" size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.floatingButton, { top: insets.top + 10, right: 16 }]}
          onPress={locateMe}
        >
          <Ionicons name="locate-outline" size={24} color={colors.text} />
        </TouchableOpacity>

        {routeLoading && (
          <View style={[s.routeBadge, { bottom: insets.bottom + 140, alignSelf: "center" }]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={s.routeBadgeText}>Calculando ruta...</Text>
          </View>
        )}

        {!routeLoading && routeInfo.distance ? (
          <View style={[s.routeInfoBar, { bottom: insets.bottom + 80 }]}>
            <View style={s.routeInfoStats}>
              <Ionicons name="navigate-outline" size={16} color="#4285F4" />
              <Text style={s.routeInfoText}>{routeInfo.distance}</Text>
              <Text style={s.routeInfoDot}> • </Text>
              <Ionicons name="time-outline" size={16} color="#4285F4" />
              <Text style={s.routeInfoText}>{routeInfo.duration}</Text>
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          style={[s.directionsButton, { bottom: insets.bottom + 20 }]}
          onPress={openInGoogleMaps}
        >
          <Ionicons name="navigate-outline" size={20} color="#fff" />
          <Text style={s.directionsButtonText}>Cómo llegar a Heluz</Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    return (
      <Text style={{ color: colors.text }}>
        El mapa no es compatible con esta plataforma.
      </Text>
    );
  }
};

export default Page;

const styles = (c: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: c.background,
    },
    floatingButton: {
      position: "absolute",
      backgroundColor: c.card,
      padding: 12,
      borderRadius: 30,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    routeBadge: {
      position: "absolute",
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.card,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 6,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    routeBadgeText: {
      fontSize: 12,
      fontWeight: "500",
      color: c.textMuted,
    },
    routeInfoBar: {
      position: "absolute",
      alignSelf: "center",
      backgroundColor: c.card,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    routeInfoStats: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    routeInfoText: {
      fontSize: 13,
      fontWeight: "600",
      color: c.text,
    },
    routeInfoDot: {
      fontSize: 13,
      color: c.gray300,
    },
    directionsButton: {
      position: "absolute",
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#4285F4",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 24,
      gap: 8,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    directionsButtonText: {
      fontSize: 15,
      fontWeight: "600",
      color: "#fff",
    },
    calloutContainer: {
      backgroundColor: c.card,
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
      color: c.text,
      marginBottom: 2,
    },
    calloutAddress: {
      fontSize: 12,
      color: c.textMuted,
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
      color: c.text,
      marginLeft: 3,
    },
    calloutDot: {
      fontSize: 13,
      color: c.gray300,
    },
    calloutDelivery: {
      fontSize: 13,
      color: c.textSecondary,
      marginLeft: 2,
    },
    calloutCuisine: {
      fontSize: 12,
      color: c.textSecondary,
      marginBottom: 4,
    },
    calloutDivider: {
      height: 1,
      backgroundColor: c.border,
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
  });
