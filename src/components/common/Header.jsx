import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Inicio', path: '/' },
    { name: 'Habitaciones', path: '/rooms' },
    { name: 'Servicios', path: '#services' },
    { name: 'Contacto', path: '#contact' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-md fixed w-full top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-2xl font-serif font-bold text-primary">LuxeStay</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`transition-colors ${
                  isActive(item.path)
                    ? 'text-primary font-semibold'
                    : 'text-gray-700 hover:text-primary'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <button className="text-gray-700 hover:text-primary transition-colors font-medium">
              Iniciar Sesión
            </button>
            <Link
              to="/rooms"
              className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-600 transition-colors"
            >
              Reservar
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block py-2 ${
                  isActive(item.path)
                    ? 'text-primary font-semibold'
                    : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <button
              className="block w-full text-left py-2 text-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Iniciar Sesión
            </button>
            <Link
              to="/rooms"
              className="block mt-4 bg-primary text-white px-6 py-2 rounded-full text-center hover:bg-primary-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Reservar
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
