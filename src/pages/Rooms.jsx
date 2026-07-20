import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import RoomCard from '../components/room/RoomCard';
import { useRooms } from '../hooks/useRooms';

const Rooms = () => {
  const [searchParams] = useSearchParams();

  const paramCheckIn   = searchParams.get('checkIn')  ?? '';
  const paramCheckOut  = searchParams.get('checkOut') ?? '';
  const paramGuests    = parseInt(searchParams.get('guests') ?? '1', 10);
  const paramLocation  = searchParams.get('location') ?? '';

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  // Categorías reales del backend (RoomCategory)
  const categories = [
    { id: 'all',         name: 'Todas' },
    { id: 'individual',  name: 'Individual' },
    { id: 'doble',       name: 'Doble' },
    { id: 'matrimonial', name: 'Matrimonial' },
    { id: 'triple',      name: 'Triple' },
    { id: 'familiar',    name: 'Familiar' },
  ];

  // Todos los filtros van al backend vía roomService
  const filters = useMemo(() => ({
    checkIn:  paramCheckIn  || undefined,
    checkOut: paramCheckOut || undefined,
    guests:   paramGuests > 1 ? paramGuests : undefined,
    location: paramLocation || undefined,
    category: selectedCategory,
    priceRange,
    sortBy,
  }), [paramCheckIn, paramCheckOut, paramGuests, paramLocation, selectedCategory, priceRange, sortBy]);

  const { rooms: filteredRooms, loading, error, refetch } = useRooms(filters);

  const hasSearchContext = paramCheckIn || paramCheckOut || paramGuests > 1 || paramLocation;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-primary text-white py-16">
        {/* Detalle decorativo: anillos concéntricos dorados */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border border-accent/20 pointer-events-none" aria-hidden="true"></div>
        <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full border border-accent/10 pointer-events-none" aria-hidden="true"></div>
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5 pointer-events-none" aria-hidden="true"></div>
        <div className="container mx-auto px-4 text-center relative">
          <span className="inline-block text-accent text-xs font-bold tracking-[0.3em] uppercase mb-3">
            LuxeStay
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Nuestras Habitaciones
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
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
                  <option value="rating">Mejor valorados</option>
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
              <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 mb-6 shadow-sm">
                <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-gray-400 mb-2.5">
                  Tu búsqueda
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {paramLocation && (
                    <span className="inline-flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-full pl-1.5 pr-4 py-1.5 text-sm text-gray-800">
                      <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </span>
                      <strong className="font-semibold">{paramLocation}</strong>
                    </span>
                  )}
                  {(paramCheckIn || paramCheckOut) && (
                    <span className="inline-flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-full pl-1.5 pr-4 py-1.5 text-sm text-gray-800">
                      <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <span>
                        <strong className="font-semibold">{paramCheckIn}</strong>
                        {paramCheckOut && <span className="text-gray-400 mx-1.5">→</span>}
                        {paramCheckOut && <strong className="font-semibold">{paramCheckOut}</strong>}
                      </span>
                    </span>
                  )}
                  {paramGuests > 1 && (
                    <span className="inline-flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-full pl-1.5 pr-4 py-1.5 text-sm text-gray-800">
                      <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </span>
                      <strong className="font-semibold">{paramGuests} huéspedes</strong>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                    <div className="h-56 bg-gray-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-2/3" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="text-center py-12 bg-red-50 border border-red-200 rounded-xl">
                <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-red-700 mb-2">
                  No se pudieron cargar las habitaciones
                </h3>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <button
                  onClick={refetch}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Results */}
            {!loading && !error && (
              <>
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
                      Intenta ajustar los filtros o cambiar las fechas de búsqueda
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rooms;
