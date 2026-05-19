# LuxeStay — Frontend de Usuario

Documentación de implementación del panel de usuario construido con React + Vite.

---

## Tecnologías utilizadas

| Tecnología | Versión | Propósito |
|---|---|---|
| React | 19.2.4 | Librería principal de UI |
| Vite | 8.0.4 | Bundler y servidor de desarrollo |
| React Router DOM | 7.14.1 | Enrutamiento SPA |
| TailwindCSS | 3.4.19 | Estilos utilitarios |
| Axios | — | Cliente HTTP |
| ESLint | — | Calidad de código |

---

## Estructura del proyecto

```
src/
├── assets/               # Imágenes y recursos estáticos (logoLuxeStay.webp, favicon.webp)
├── components/
│   ├── common/           # Header, Footer, LoadingSpinner, OptimizedImage
│   ├── map/              # MapLocation (componente de mapa)
│   ├── room/             # RoomCard, FeatureCard
│   └── search/           # SearchBar con filtros de fechas y ubicación
├── config/
│   └── config.js         # Toggle mock vs API real (VITE_USE_MOCK_DATA)
├── context/
│   └── AuthContext.jsx   # Estado global de autenticación (JWT + OAuth2)
├── data/
│   └── roomsData.js      # Datos mock (5+ habitaciones: standard, deluxe, suite, presidencial)
├── hooks/
│   ├── useRooms.js       # Listado y filtrado de habitaciones
│   ├── useBooking.js     # Creación y consulta de reservas
│   └── useUbigeo.js      # Carga de departamentos, provincias y distritos
├── pages/
│   ├── Home.jsx          # Página principal con buscador
│   ├── Rooms.jsx         # Listado de habitaciones con filtros
│   ├── RoomDetail.jsx    # Detalle y formulario de reserva
│   ├── Login.jsx         # Autenticación por credenciales
│   ├── Register.jsx      # Registro de nuevo usuario
│   ├── OAuth2Callback.jsx# Callback de autenticación OAuth2 (Google)
│   ├── MyBookings.jsx    # Historial de reservas del usuario
│   └── BookingConfirmation.jsx # Confirmación post-reserva
├── services/
│   ├── api.js            # Instancia Axios con interceptores JWT
│   ├── authService.js    # Login, registro, refresh token, OAuth2
│   ├── bookingService.js # CRUD de reservas
│   ├── roomService.js    # Búsqueda y detalle de habitaciones
│   └── ubigeoService.js  # Jerarquía geográfica peruana
├── utils/
│   └── imageOptimizer.js # Utilidad para carga optimizada de imágenes
├── App.jsx               # Definición de rutas (React.lazy + Suspense)
└── main.jsx              # Punto de entrada — monta la aplicación
```

---

## Arquitectura de datos

```
Páginas / Componentes
        ↓
Hooks personalizados (useRooms, useBooking, useUbigeo)
        ↓
Capa de servicios (roomService, bookingService, authService)
        ↓
config.useMockData  ──true──→  roomsData.js  (datos locales)
        │
       false
        ↓
api.js (Axios) → Backend en localhost:8080/api/v1
```

La variable de entorno `VITE_USE_MOCK_DATA=true` permite desarrollar sin levantar el backend.

---

## Sistema de diseño (Tailwind)

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#64289B` | Color principal (morado) |
| Acento | `#FFD700` | Detalles dorados |
| Fuente sans | Inter | Cuerpo de texto |
| Fuente serif | Playfair Display | Títulos y encabezados |

Paleta completa del color `primary` configurada con escala 50–950 en `tailwind.config.js`.

---

## Sistema de reservas

Se implementaron dos modalidades de reserva:

### Por Noche
- Selector de rango de fechas (check-in / check-out)
- Precio calculado por número de noches
- Validación: check-in desde hoy en adelante (`@FutureOrPresent` en el backend)

### Luxe Velocity (bloques de 4 horas)
Los bloques disponibles son:
- 08:00 – 12:00
- 12:00 – 16:00
- 16:00 – 20:00
- 20:00 – 00:00

Precio calculado por hora dentro del bloque seleccionado.

---

## Autenticación

- **JWT**: El token se almacena en memoria/localStorage y se adjunta automáticamente a cada petición mediante el interceptor de Axios en `api.js`.
- **OAuth2 / Google**: Flujo de redirección; la página `OAuth2Callback.jsx` captura el código de autorización y solicita el token al backend.
- **Contexto global**: `AuthContext.jsx` expone `user`, `login()`, `logout()` y `isAuthenticated` a todos los componentes.

---

## Variables de entorno (`.env`)

```env
VITE_API_URL=http://localhost:8080/api
VITE_USE_MOCK_DATA=false
VITE_APP_NAME=LuxeStay
VITE_APP_VERSION=1.0.0
```

---

## Favicon e identidad visual

El favicon principal es `/favicon.webp` (logo oficial de LuxeStay).
Configurado en `index.html`:

```html
<link rel="icon" type="image/webp" href="/favicon.webp" />
<link rel="apple-touch-icon" href="/favicon.webp" />
```

---

## Comandos de desarrollo

```bash
npm install        # Instalar dependencias
npm run dev        # Servidor de desarrollo en localhost:5173
npm run build      # Compilar para producción en dist/
npm run lint       # Ejecutar ESLint
npm run preview    # Vista previa del build de producción
npm run deploy     # Desplegar en GitHub Pages
```

---

## Despliegue

- **Plataforma**: GitHub Pages
- **URL base**: `/luxeStay-user-front/`
- **Comando**: `npm run deploy` (usa `gh-pages`)
- **Separación de bundles**: El vendor de React se genera como chunk separado para mejor caché.
