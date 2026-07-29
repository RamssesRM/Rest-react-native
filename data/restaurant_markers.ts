export interface RestaurantMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  cuisine: string[];
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
}

export const restaurantMarkers: RestaurantMarker[] = [
  {
    id: 'heluz_001',
    name: 'Heluz Restobar',
    latitude: 7.777850508202828,
    longitude: -72.2333325,
    cuisine: ['Restaurante', 'Bar', 'Cocina Internacional'],
    rating: 4.8,
    deliveryTime: '25-35 min',
    deliveryFee: 2.0,
  },
];
