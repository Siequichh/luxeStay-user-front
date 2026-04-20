// Mock data de habitaciones
export const rooms = [
  {
    id: 1,
    name: 'Habitación Estándar',
    category: 'standard',
    description: 'Confortable habitación con todas las amenidades básicas',
    location: 'Miraflores, Lima',
    address: 'Av. José Larco 1232, Miraflores, Lima',
    coordinates: {
      lat: -12.1203,
      lng: -77.0292
    },
    price: 120,
    pricePerHour: 30,
    guests: 2,
    size: '25m²',
    bed: '1 Cama Queen',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&auto=format&fit=crop'
    ],
    amenities: ['WiFi', 'TV', 'A/C', 'Minibar'],
    detailedAmenities: [
      { icon: '📶', name: 'WiFi Gratuito' },
      { icon: '📺', name: 'TV' },
      { icon: '❄️', name: 'Aire Acondicionado' },
      { icon: '🍷', name: 'Minibar' }
    ]
  },
  {
    id: 2,
    name: 'Habitación Deluxe',
    category: 'deluxe',
    description: 'Confort y practicidad en cada detalle',
    location: 'San Isidro, Lima',
    address: 'Av. República de Panamá 3591, San Isidro, Lima',
    coordinates: {
      lat: -12.0975,
      lng: -77.0368
    },
    price: 180,
    pricePerHour: 45,
    guests: 2,
    size: '35m²',
    bed: '1 Cama King',
    image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618883713251-c77831e67aea?w=1200&auto=format&fit=crop'
    ],
    amenities: ['WiFi', 'TV 4K', 'A/C', 'Minibar', 'Vista Ciudad'],
    detailedAmenities: [
      { icon: '📶', name: 'WiFi Gratuito' },
      { icon: '📺', name: 'TV 4K' },
      { icon: '❄️', name: 'Aire Acondicionado' },
      { icon: '🍷', name: 'Minibar' },
      { icon: '🌆', name: 'Vista Ciudad' }
    ]
  },
  {
    id: 3,
    name: 'Suite Ejecutiva',
    category: 'suite',
    description: 'Ideal para viajeros de negocios y estadías cortas',
    location: 'Centro de Lima',
    address: 'Jr. de la Unión 758, Cercado de Lima, Lima',
    coordinates: {
      lat: -12.0464,
      lng: -77.0428
    },
    price: 280,
    pricePerHour: 70,
    guests: 3,
    size: '50m²',
    bed: '1 Cama King + Sofá',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop',
    amenities: ['WiFi', 'TV 4K', 'A/C', 'Minibar', 'Escritorio', 'Vista Panorámica'],
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&auto=format&fit=crop'
    ],
    detailedAmenities: [
      { icon: '📶', name: 'WiFi de Alta Velocidad' },
      { icon: '📺', name: 'TV 4K de 55"' },
      { icon: '❄️', name: 'Aire Acondicionado' },
      { icon: '🍷', name: 'Minibar Premium' },
      { icon: '💼', name: 'Escritorio Ejecutivo' },
      { icon: '🛁', name: 'Baño de Mármol' },
      { icon: '🌆', name: 'Vista Panorámica' },
      { icon: '☕', name: 'Cafetera Nespresso' }
    ],
    features: [
      'Check-in express',
      'Servicio de habitaciones 24/7',
      'Amenidades de baño de lujo',
      'Caja de seguridad',
      'Plancha y tabla de planchar',
      'Secador de pelo profesional'
    ]
  },
  {
    id: 4,
    name: 'Suite Familiar',
    category: 'suite',
    description: 'Espacio amplio perfecto para familias',
    location: 'Barranco, Lima',
    address: 'Av. Pedro de Osma 135, Barranco, Lima',
    coordinates: {
      lat: -12.1467,
      lng: -77.0208
    },
    price: 320,
    pricePerHour: 80,
    guests: 4,
    size: '60m²',
    bed: '2 Camas Queen',
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618883713251-c77831e67aea?w=1200&auto=format&fit=crop'
    ],
    amenities: ['WiFi', 'TV 4K', 'A/C', 'Minibar', 'Cocina', 'Sala de Estar'],
    detailedAmenities: [
      { icon: '📶', name: 'WiFi de Alta Velocidad' },
      { icon: '📺', name: 'TV 4K' },
      { icon: '❄️', name: 'Aire Acondicionado' },
      { icon: '🍷', name: 'Minibar' },
      { icon: '🍳', name: 'Cocina Completa' },
      { icon: '🛋️', name: 'Sala de Estar' }
    ]
  },
  {
    id: 5,
    name: 'Suite Presidential',
    category: 'presidential',
    description: 'Máximo confort con espacios amplios',
    location: 'San Isidro, Lima',
    address: 'Av. Conquistadores 456, San Isidro, Lima',
    coordinates: {
      lat: -12.0886,
      lng: -77.0352
    },
    price: 520,
    pricePerHour: 130,
    guests: 4,
    size: '100m²',
    bed: '1 Cama King + 2 Queen',
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&auto=format&fit=crop',
    amenities: ['WiFi', 'TV 4K', 'A/C', 'Minibar', 'Jacuzzi', 'Terraza Privada', 'Servicio'],
    images: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&auto=format&fit=crop'
    ],
    detailedAmenities: [
      { icon: '📶', name: 'WiFi Ultra Rápido' },
      { icon: '📺', name: 'TV 4K de 75"' },
      { icon: '❄️', name: 'Climatización Inteligente' },
      { icon: '🍷', name: 'Bar Completo' },
      { icon: '🛀', name: 'Jacuzzi Privado' },
      { icon: '🏠', name: 'Terraza Privada' },
      { icon: '👔', name: 'Servicio de Mayordomo' },
      { icon: '🎵', name: 'Sistema de Audio Premium' }
    ],
    features: [
      'Check-in privado',
      'Servicio de mayordomo 24/7',
      'Amenidades de diseñador',
      'Sala de estar separada',
      'Comedor privado',
      'Vestidor amplio',
      'Bañera hidromasaje',
      'Ducha de lluvia'
    ]
  },
  {
    id: 6,
    name: 'Habitación Superior',
    category: 'standard',
    description: 'Calidad superior con excelente relación calidad-precio',
    location: 'Surco, Lima',
    address: 'Av. Benavides 2891, Santiago de Surco, Lima',
    coordinates: {
      lat: -12.1344,
      lng: -76.9972
    },
    price: 145,
    pricePerHour: 36,
    guests: 2,
    size: '30m²',
    bed: '1 Cama Queen',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&auto=format&fit=crop'
    ],
    amenities: ['WiFi', 'TV', 'A/C', 'Minibar', 'Balcón'],
    detailedAmenities: [
      { icon: '📶', name: 'WiFi Gratuito' },
      { icon: '📺', name: 'TV' },
      { icon: '❄️', name: 'Aire Acondicionado' },
      { icon: '🍷', name: 'Minibar' },
      { icon: '🌳', name: 'Balcón Privado' }
    ]
  },
  {
    id: 7,
    name: 'Suite Junior',
    category: 'suite',
    description: 'Suite compacta con todas las comodidades',
    location: 'Miraflores, Lima',
    address: 'Malecón de la Reserva 1035, Miraflores, Lima',
    coordinates: {
      lat: -12.1298,
      lng: -77.0244
    },
    price: 230,
    pricePerHour: 58,
    guests: 2,
    size: '40m²',
    bed: '1 Cama King',
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618883713251-c77831e67aea?w=1200&auto=format&fit=crop'
    ],
    amenities: ['WiFi', 'TV 4K', 'A/C', 'Minibar', 'Bañera'],
    detailedAmenities: [
      { icon: '📶', name: 'WiFi de Alta Velocidad' },
      { icon: '📺', name: 'TV 4K' },
      { icon: '❄️', name: 'Aire Acondicionado' },
      { icon: '🍷', name: 'Minibar' },
      { icon: '🛁', name: 'Bañera Moderna' }
    ]
  },
  {
    id: 8,
    name: 'Habitación Deluxe Vista',
    category: 'deluxe',
    description: 'Vistas espectaculares con diseño moderno',
    location: 'San Miguel, Lima',
    address: 'Av. La Marina 2000, San Miguel, Lima',
    coordinates: {
      lat: -12.0771,
      lng: -77.0864
    },
    price: 250,
    pricePerHour: 63,
    guests: 2,
    size: '40m²',
    bed: '1 Cama King',
    image: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&auto=format&fit=crop',
    amenities: ['WiFi', 'TV 4K', 'A/C', 'Minibar', 'Vista Especial', 'Balcón'],
    images: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop'
    ],
    detailedAmenities: [
      { icon: '📶', name: 'WiFi Gratuito' },
      { icon: '📺', name: 'TV 4K' },
      { icon: '❄️', name: 'Aire Acondicionado' },
      { icon: '🍷', name: 'Minibar' },
      { icon: '🌆', name: 'Vista Ciudad' },
      { icon: '☕', name: 'Set de Café/Té' },
      { icon: '🛁', name: 'Baño Moderno' },
      { icon: '🔒', name: 'Caja Fuerte' }
    ],
    features: [
      'Servicio de habitaciones',
      'Amenidades de baño premium',
      'Escritorio de trabajo',
      'Ropa de cama de lujo',
      'Cortinas blackout',
      'Secador de pelo'
    ]
  }
];

// Función para obtener habitación por ID
export const getRoomById = (id) => {
  return rooms.find(room => room.id === parseInt(id));
};

// Función para filtrar habitaciones
export const filterRooms = (category, priceRange) => {
  return rooms.filter(room => {
    const categoryMatch = category === 'all' || room.category === category;
    let priceMatch = true;

    if (priceRange === 'budget') priceMatch = room.price < 200;
    else if (priceRange === 'mid') priceMatch = room.price >= 200 && room.price < 400;
    else if (priceRange === 'luxury') priceMatch = room.price >= 400;

    return categoryMatch && priceMatch;
  });
};
