export interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string[];
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  image: ReturnType<typeof require>;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  tags: string[];
  isOpen: boolean;
  openingHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

export const restaurants: Restaurant[] = [
  {
    id: 'heluz_001',
    name: 'Heluz Restobar',
    description: 'Restaurante y bar con cocina internacional',
    cuisine: ['Restaurante', 'Bar', 'Cocina Internacional'],
    rating: 4.8,
    reviewCount: 500,
    deliveryTime: '25-35 min',
    deliveryFee: 2.0,
    minOrder: 10.0,
    image: require('../assets/images/Helus_restaurant4.png'),
    location: {
      address: 'San Cristóbal, Táchira, Venezuela',
      latitude: 7.777850508202828,
      longitude: -72.2333325,
    },
    tags: ['restobar', 'internacional', 'bar', 'cocteles'],
    isOpen: true,
    openingHours: {
      monday: '10:00 AM - 11:00 PM',
      tuesday: '10:00 AM - 11:00 PM',
      wednesday: '10:00 AM - 11:00 PM',
      thursday: '10:00 AM - 11:00 PM',
      friday: '10:00 AM - 12:00 AM',
      saturday: '10:00 AM - 12:00 AM',
      sunday: '10:00 AM - 10:00 PM',
    },
  },
];
