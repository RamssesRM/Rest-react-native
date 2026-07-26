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
    id: 'rest_001',
    name: 'Pizza Perfetto',
    latitude: 7.7776,
    longitude: -72.2333,
    cuisine: ['Italian', 'Pizza'],
    rating: 4.6,
    deliveryTime: '25-35 min',
    deliveryFee: 1.9,
  },
  {
    id: 'rest_002',
    name: 'Burgerhaven',
    latitude: 7.7800,
    longitude: -72.2320,
    cuisine: ['American', 'Burgers'],
    rating: 4.8,
    deliveryTime: '20-30 min',
    deliveryFee: 2.5,
  },
  {
    id: 'rest_003',
    name: 'Sushi Takumi',
    latitude: 7.7750,
    longitude: -72.2350,
    cuisine: ['Japanese', 'Sushi', 'Asian'],
    rating: 4.7,
    deliveryTime: '30-40 min',
    deliveryFee: 2.9,
  },
  {
    id: 'rest_004',
    name: 'Döner Palace',
    latitude: 7.7790,
    longitude: -72.2300,
    cuisine: ['Turkish', 'Kebab', 'Mediterranean'],
    rating: 4.5,
    deliveryTime: '15-25 min',
    deliveryFee: 1.5,
  },
  {
    id: 'rest_005',
    name: 'Pad Thai House',
    latitude: 7.7760,
    longitude: -72.2380,
    cuisine: ['Thai', 'Asian', 'Vegetarian'],
    rating: 4.6,
    deliveryTime: '25-35 min',
    deliveryFee: 2.2,
  },
  {
    id: 'rest_006',
    name: 'Salad Bar Fresh',
    latitude: 7.7810,
    longitude: -72.2340,
    cuisine: ['Healthy', 'Salads', 'Vegetarian'],
    rating: 4.4,
    deliveryTime: '20-30 min',
    deliveryFee: 2.0,
  },
  {
    id: 'rest_007',
    name: 'Curry Corner',
    latitude: 7.7740,
    longitude: -72.2310,
    cuisine: ['Indian', 'Curry', 'Asian'],
    rating: 4.7,
    deliveryTime: '30-40 min',
    deliveryFee: 2.4,
  },
  {
    id: 'rest_008',
    name: 'Poke Bowl Paradise',
    latitude: 7.7780,
    longitude: -72.2370,
    cuisine: ['Hawaiian', 'Healthy', 'Seafood'],
    rating: 4.5,
    deliveryTime: '25-35 min',
    deliveryFee: 2.7,
  },
  {
    id: 'rest_009',
    name: 'La Baguette',
    latitude: 7.7820,
    longitude: -72.2330,
    cuisine: ['French', 'Bakery', 'Café'],
    rating: 4.8,
    deliveryTime: '20-30 min',
    deliveryFee: 1.8,
  },
  {
    id: 'rest_010',
    name: 'Taco Loco',
    latitude: 7.7730,
    longitude: -72.2290,
    cuisine: ['Mexican', 'Tacos', 'Latin American'],
    rating: 4.6,
    deliveryTime: '25-35 min',
    deliveryFee: 2.3,
  },
];
