import { Link } from 'react-router-dom';
import SearchBar from '../components/search/SearchBar';
import FeatureCard from '../components/room/FeatureCard';
import RoomCard from '../components/room/RoomCard';
import { rooms } from '../data/roomsData';

const Home = () => {
  const features = [
    {
      icon: '⚡',
      title: 'Reserva Rápida',
      description: 'Proceso de reserva en menos de 3 minutos, simple e intuitivo.'
    },
    {
      icon: '🕐',
      title: 'Luxe Velocity',
      description: 'Reserva por horas con bloques flexibles de 4 horas según tu necesidad.'
    },
    {
      icon: '💳',
      title: 'Pago Seguro',
      description: 'Sistema de pagos confiable con confirmación inmediata.'
    },
    {
      icon: '📱',
      title: 'Check-in Digital',
      description: 'Código QR único para check-in rápido sin colas ni esperas.'
    }
  ];

  const featuredRooms = rooms.slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 lg:pt-0">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&auto=format&fit=crop"
            alt="Hotel Lobby"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 to-primary-600/80"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full px-4 py-8 sm:py-12 lg:py-0">
          <div className="max-w-6xl mx-auto">
            {/* Title */}
            <div className="text-center text-white mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif font-bold mb-4 sm:mb-6 leading-tight">
                Reserva fácil y rápido
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto px-2">
                Tu habitación ideal con flexibilidad de horarios y pago seguro
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-8 sm:mb-12">
              <SearchBar />
            </div>

            {/* Quick Links */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
              <Link
                to="/rooms"
                className="text-white hover:text-accent transition-colors text-sm font-medium"
              >
                Ver todas las habitaciones →
              </Link>
              <a
                href="#about"
                className="text-white hover:text-accent transition-colors text-sm font-medium"
              >
                Conoce más sobre nosotros →
              </a>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="services" className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-3 sm:mb-4">
              ¿Por qué LuxeStay?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
              Sistema de reservas moderno y flexible que se adapta a tus necesidades
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Rooms Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-3 sm:mb-4">
              Habitaciones Disponibles
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
              Encuentra la opción perfecta para tu estadía
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>

          <div className="text-center mt-10 sm:mt-12">
            <Link
              to="/rooms"
              className="inline-block bg-gray-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Ver Todas las Habitaciones
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-4 sm:mb-6">
                Sistema de Reservas Moderno
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
                LuxeStay es una plataforma diseñada para hacer tu experiencia de reserva
                simple, rápida y segura. Con opciones flexibles que se adaptan a tus necesidades.
              </p>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                Reserva por noche completa o aprovecha nuestro sistema Luxe Velocity para
                estadías por horas con bloques de 4 horas. Tú decides cómo y cuándo.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mt-6 sm:mt-8">
                <div>
                  <div className="text-3xl sm:text-4xl font-bold text-primary">&lt;3min</div>
                  <div className="text-sm sm:text-base text-gray-600">Proceso de Reserva</div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-bold text-primary">24/7</div>
                  <div className="text-sm sm:text-base text-gray-600">Disponibilidad</div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-bold text-primary">100%</div>
                  <div className="text-sm sm:text-base text-gray-600">Pago Seguro</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop"
                alt="Sistema de Reservas"
                className="rounded-2xl shadow-2xl w-full"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-primary to-primary-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4 sm:mb-6">
            ¿Listo para Reservar?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Proceso rápido, seguro y flexible. Reserva en menos de 3 minutos
          </p>
          <Link
            to="/rooms"
            className="inline-block bg-accent text-gray-900 px-6 sm:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-accent-light transition-all transform hover:scale-105 shadow-xl"
          >
            Reservar Ahora
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
