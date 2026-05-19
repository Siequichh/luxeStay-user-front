import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();

  const navigation = [
    { name: 'Inicio',        path: '/' },
    { name: 'Habitaciones',  path: '/rooms' },
    { name: 'Servicios',     path: '#services' },
    { name: 'Contacto',      path: '#contact' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md fixed w-full top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/">
            <img src={`${import.meta.env.BASE_URL}logoLuxeStay.webp`} alt="LuxeStay" className="h-12 w-auto" />
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

            {isLoggedIn ? (
              /* User dropdown */
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen((o) => !o)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user.fullName?.[0]?.toUpperCase() ?? 'U'}
                    </span>
                  </div>
                  <span className="font-medium text-sm max-w-[140px] truncate">
                    {user.fullName}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-900 truncate">{user.fullName}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                        {user.role}
                      </span>
                    </div>
                    <Link
                      to="/my-bookings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Mis Reservas
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary transition-colors font-medium"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white px-5 py-2 rounded-full hover:bg-primary-600 transition-colors font-medium"
                >
                  Registrarse
                </Link>
              </>
            )}

            <Link
              to="/rooms"
              className="border border-primary text-primary px-5 py-2 rounded-full hover:bg-primary hover:text-white transition-colors"
            >
              Reservar
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block py-2 text-sm ${
                  isActive(item.path) ? 'text-primary font-semibold' : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            <div className="pt-3 border-t border-gray-100 space-y-2">
              {isLoggedIn ? (
                <>
                  <div className="text-sm text-gray-700 font-medium">{user.fullName}</div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                  <Link
                    to="/my-bookings"
                    className="block text-sm text-gray-700 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mis Reservas
                  </Link>
                  <button
                    onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                    className="block w-full text-left text-sm text-red-600 py-1"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block text-sm text-gray-700 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/register"
                    className="block text-sm text-primary font-medium py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </>
              )}
              <Link
                to="/rooms"
                className="block mt-2 bg-primary text-white px-6 py-2 rounded-full text-center text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Reservar
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
