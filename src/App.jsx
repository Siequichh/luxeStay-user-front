import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

const Home                = lazy(() => import('./pages/Home'));
const Rooms               = lazy(() => import('./pages/Rooms'));
const RoomDetail          = lazy(() => import('./pages/RoomDetail'));
const Login               = lazy(() => import('./pages/Login'));
const Register            = lazy(() => import('./pages/Register'));
const MyBookings          = lazy(() => import('./pages/MyBookings'));
const BookingConfirmation = lazy(() => import('./pages/BookingConfirmation'));
const OAuth2Callback      = lazy(() => import('./pages/OAuth2Callback'));

function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function AuthLayout({ children }) {
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public pages — with header + footer */}
        <Route
          path="/"
          element={
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow"><Home /></main>
              <Footer />
            </div>
          }
        />
        <Route
          path="/rooms"
          element={
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow"><Rooms /></main>
              <Footer />
            </div>
          }
        />
        <Route
          path="/rooms/:id"
          element={
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow"><RoomDetail /></main>
              <Footer />
            </div>
          }
        />

        {/* Protected pages — with header + footer */}
        <Route
          path="/my-bookings"
          element={
            <PrivateRoute>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow"><MyBookings /></main>
                <Footer />
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/booking/confirmation/:code"
          element={
            <PrivateRoute>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow"><BookingConfirmation /></main>
                <Footer />
              </div>
            </PrivateRoute>
          }
        />

        {/* Auth pages — no header/footer */}
        <Route path="/login"           element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register"        element={<AuthLayout><Register /></AuthLayout>} />
        <Route path="/oauth2/callback" element={<AuthLayout><OAuth2Callback /></AuthLayout>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
