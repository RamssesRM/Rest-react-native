import { StyleSheet, Text, View } from 'react-native'
import React, { useRef } from 'react';
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GoogleMaps } from 'expo-maps';
import { useRestaurants, useRestaurantMarkers } from '@/hooks/useRestaurants';
import { Ionicons } from '@expo/vector-icons';

const Page = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<GoogleMaps.MapView>(null);

  const { data: restaurants, isLoading: restaurantsLoading} = useRestaurants();
  const { data: restaurantMarkers, isLoading: markersLoading} = useRestaurantMarkers();
  console.log('🚀 ~ Page ~ restaurantMarkers:', restaurantMarkers);

  return (
    <View>
      <Text>Page</Text>
    </View>
  )
}

export default Page
const styles = StyleSheet.create({})