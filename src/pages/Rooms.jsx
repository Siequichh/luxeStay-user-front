import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import RoomCard from '../components/room/RoomCard';
import { rooms } from '../data/roomsData';

const Rooms = () => {
  const [searchParams] = useSearchParams();

  const paramCheckIn   = searchParams.get('checkIn')  ?? '';
  const paramCheckOut  = searchParams.get('checkOut') ?? '';
  const paramGuests    = parseInt(searchParams.get('guests') ?? '1', 10);
  const paramLocation  = searchParams.get('location') ?? '';

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  const categories = [
    { id: 'all', name: 'Todas' },
    { id: 'standard', name: 'Estándar' },
    { id: 'deluxe', name: 'Deluxe' },
    { id: 'suite', name: 'Suites' },
    { id: 'presidential', name: 'Presidencial' }
  ];

  const hasSearchContext = paramCheckIn || paramCheckOut || paramGuests > 1 || paramLocation;

  // Filtrar habitaciones según criterios
  const filteredRooms = rooms
    .filter(room => selectedCategory === 'all' || room.category === selectedCategory)
    .filter(room => paramGuests <= 1 || room.guests >= paramGuests)
    .filter(room => {
      if (priceRange === 'all') return true;
      if (priceRange === 'budget') return room.price < 200;
      if (priceRange === 'mid') return room.price >= 200 && room.price < 400;
      if (priceRange === 'luxury') return room.price >= 400;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header Section */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Nuestras Habitaciones
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Encuentra el alojamiento perfecto para tu estadía
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-semibold mb-6 text-gray-900">Filtros</h3>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Categoría
                </label>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Rango de Precio
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">Todos los precios</option>
                  <option value="budget">Económico (S/. &lt;200)</option>
                  <option value="mid">Medio (S/. 200-400)</option>
                  <option value="luxury">Lujo (S/. 400+)</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Ordenar por
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="featured">Destacados</option>
                  <option value="price-low">Precio: Menor a Mayor</option>
                  <option value="price-high">Precio: Mayor a Menor</option>
                </select>
              </div>

              {/* Reset Filters */}
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setPriceRange('all');
                  setSortBy('featured');
                }}
                className="w-full mt-6 px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </aside>

          {/* Rooms Grid */}
          <div className="lg:col-span-3">
            {/* Search context banner */}
            {hasSearchContext && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl px-5 py-3 mb-5 flex flex-wrap gap-4 text-sm text-gray-700 items-center">
                {paramLocation  && <span>📍 <strong>{paramLocation}</strong></span>}
                {paramCheckIn   && <span>📅 Entrada: <strong>{paramCheckIn}</strong></span>}
                {paramCheckOut  && <span>📅 Salida: <strong>{paramCheckOut}</strong></span>}
                {paramGuests > 1 && <span>👥 <strong>{paramGuests}</strong> huéspedes</span>}
              </div>
            )}

            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {filteredRooms.length} habitaciones encontradas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>

            {filteredRooms.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                  No se encontraron habitaciones
                </h3>
                <p className="text-gray-500 mb-4">
                  Intenta ajustar los filtros para ver más opciones
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setPriceRange('all');
                  }}
                  className="text-primary hover:underline font-semibold"
                >
                  Limpiar todos los filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rooms;
