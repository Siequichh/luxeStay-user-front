# LuxeStay Frontend

Aplicación web React para plataforma de reserva de habitaciones hoteleras con soporte para reservas por noche y por bloque horario (Luxe Velocity).

## 📋 Descripción

Frontend de LuxeStay construido con **React + Vite + TailwindCSS**. Proporciona:
- Landing page y búsqueda de habitaciones
- Detalle de habitación con galería de imágenes optimizada
- Formulario de reserva (nightly y hourly)
- Pago integrado con MercadoPago
- Autenticación con JWT y OAuth2 (Google)
- Panel de mis reservas
- Notificaciones en tiempo real
- Dark mode (opcional)

## 🛠 Stack Tecnológico

- **React 19** - Framework de UI
- **Vite** - Build tool (desarrollo ultrarrápido)
- **TailwindCSS** - Estilos utility-first
- **React Router v6** - Enrutamiento
- **MercadoPago SDK** - Integración de pagos
- **Axios** - Cliente HTTP
- **Date-fns** - Manipulación de fechas

## 📋 Requisitos Previos

- **Node.js 20+** o superior
- **npm** (incluido con Node)
- Acceso a la API del backend en `http://localhost:8080` (dev) o producción

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/Siequichh/luxeStay-user-front.git
cd luxeStay-user-front
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copiar `.env.example` a `.env`:

```bash
cp .env.example .env
```

**Variables requeridas:**

```env
# API Backend (obligatorio)
VITE_API_URL=http://localhost:8080/api

# MercadoPago (obligatorio para pagar)
VITE_MP_PUBLIC_KEY=APP_USR-...

# Datos de la app
VITE_APP_NAME=LuxeStay
VITE_APP_VERSION=1.0.0

# Mock data para desarrollo (true = usar datos locales, false = API real)
VITE_USE_MOCK_DATA=false
```

Ver `CREDENCIALES.md` en la raíz para obtener las claves de MercadoPago.

### 4. Correr en desarrollo

```bash
npm run dev
```

La aplicación estará en `http://localhost:5173`

## 📖 Comandos Disponibles

```bash
# Desarrollo (Vite dev server con HMR)
npm run dev

# Build para producción
npm run build

# Vista previa del build
npm run preview

# Linting (ESLint)
npm run lint

# Deploy a GitHub Pages
npm run deploy
```

## 📁 Estructura del Proyecto

```
src/
├── pages/                  # Páginas principales (lazy-loaded)
│   ├── Home.jsx
│   ├── Rooms.jsx          # Búsqueda y listado
│   ├── RoomDetail.jsx     # Detalle + formulario de reserva
│   ├── BookingConfirmation.jsx
│   ├── MyBookings.jsx
│   ├── Login.jsx
│   └── Register.jsx
├── components/
│   ├── common/
│   │   ├── OptimizedImage.jsx      # Lazy loading + WebP
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── booking/
│   │   ├── BookingForm.jsx
│   │   └── PaymentMethods.jsx      # MercadoPago Wallet Brick
│   ├── room/
│   │   ├── RoomCard.jsx
│   │   └── RoomGallery.jsx
│   └── filters/
│       └── SearchFilters.jsx
├── services/
│   ├── api.js              # Cliente HTTP (Axios + interceptores)
│   ├── roomService.js      # Búsqueda y disponibilidad
│   ├── bookingService.js   # Reservas y pagos
│   └── authService.js      # Login y registro
├── hooks/
│   ├── useRooms.js         # Fetch habitaciones con filtros
│   ├── useRoom.js          # Fetch habitación por ID
│   ├── useSimilarRooms.js  # Recomendaciones
│   ├── useBooking.js       # Estado de reserva
│   └── useAuth.js          # Contexto de autenticación
├── context/
│   ├── AuthContext.jsx     # Usuario logueado, JWT
│   └── NotificationContext.jsx
├── data/
│   └── roomsData.js        # Mock data para desarrollo
├── styles/
│   └── globals.css         # TailwindCSS + custom styles
├── App.jsx                 # Router principal
├── main.jsx                # Entry point
└── config.js               # Constantes y configuración
```

## 🎨 Diseño y Componentes

### Color Scheme (TailwindCSS)

- **Primary**: `#64289B` (púrpura) - Acciones principales
- **Accent**: `#FFD700` (oro) - Elementos destacados
- **Fonts**: Inter (body), Playfair Display (headings)

### Componentes Principales

- **OptimizedImage**: Lazy loading + WebP automático desde Unsplash
- **RoomCard**: Tarjeta de habitación en grid
- **BookingForm**: Formulario reactivo (nightly/hourly)
- **PaymentMethods**: Integración de MercadoPago Wallet Brick
- **SearchFilters**: Filtros por ubicación, precio, huéspedes

## 🔐 Autenticación

- **JWT**: Token de 24h + refresh token de 7 días
- **OAuth2 Google**: Login social
- **Persistencia**: localStorage para tokens y datos de usuario
- **Interceptores**: Auto-retry con refresh en 401

## 💳 Integración de Pagos (MercadoPago)

### Flujo Wallet Brick

1. Usuario crea reserva (`PENDING`)
2. Click en "Pagar" → obtiene `preferenceId` del backend
3. MercadoPago Wallet Brick se renderiza con los medios guardados
4. Usuario selecciona método y paga
5. Frontend hace polling a `/payments/{bookingId}` para confirmar
6. Al confirmar, transición a reserva `CONFIRMED` y muestra QR

## 📱 Responsive Design

- **Mobile-first** approach con breakpoints Tailwind
- Media queries: `sm`, `md`, `lg`, `xl`, `2xl`
- Imágenes optimizadas automáticamente por Unsplash para cada viewport

## 🚀 Deployment (GitHub Pages)

### Automático (CI/CD)

1. Push a rama `main`
2. GitHub Actions ejecuta `npm run build`
3. Despliega contenido de `dist/` a rama `gh-pages`

**URL en vivo**: https://siequichh.github.io/luxeStay-user-front/

### Variables de Entorno en GitHub Actions

Configurar en GitHub → Settings → Secrets and variables → Actions:

```
VITE_API_URL = https://luxestay-backend-ubax.onrender.com/api
VITE_MP_PUBLIC_KEY = APP_USR-...
```

## 🧪 Testing

```bash
# Ejecutar tests (si existen)
npm run test

# Con cobertura
npm run test:coverage
```

## 📊 Rendimiento

- **Code Splitting**: Páginas lazy-loaded con React.lazy()
- **Image Optimization**: WebP automático + placeholders blur
- **Tree Shaking**: Vite elimina código no utilizado
- **Minificación**: Build optimizado para producción

### Métricas de PageSpeed

- Ejecutar: `npm run build && npm run preview`
- Ver: https://pagespeed.web.dev/

## 🛠️ Desarrollo Local

### HMR (Hot Module Replacement)

Vite soporta HMR automático — cambios en código se reflejan al instante sin recargar la página.

### Mock Data

Para desarrollo sin backend, cambiar en `.env`:

```env
VITE_USE_MOCK_DATA=true
```

Los servicios retornarán datos locales de `src/data/roomsData.js`

### Acceder al Backend en Desarrollo

```bash
# Terminal 1 - Backend
cd luxeStay-backend
./mvnw spring-boot:run

# Terminal 2 - Frontend
cd luxeStay-front
npm run dev
```

## 📝 Convenciones de Código

- **Componentes**: PascalCase (`RoomCard.jsx`)
- **Hooks**: camelCase con prefijo `use` (`useRooms.js`)
- **Servicios**: camelCase (`roomService.js`)
- **CSS**: TailwindCSS utilities (no CSS modules)
- **Commits**: Conventional commits (`feat:`, `fix:`, `docs:`, etc.)

## 🤝 Contribuir

1. Crear rama: `git checkout -b feature/mi-feature`
2. Commit: `git commit -m "feat: descripción"`
3. Push: `git push origin feature/mi-feature`
4. Abrir Pull Request

## 🎓 Proyecto Académico

Proyecto desarrollado para el curso **Integrador 2** de la carrera de **Ingeniería de Sistemas** en la **Universidad Tecnológica del Perú (UTP)**.

Integrantes del equipo:
- Frontend: Desarrollo de interfaz de usuario con React
- Backend: API REST y lógica de negocio
- Admin: Panel administrativo

## 📄 Licencia

Uso educativo - Proyecto de la Universidad Tecnológica del Perú
