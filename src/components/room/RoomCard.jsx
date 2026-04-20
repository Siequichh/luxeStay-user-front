import { Link } from 'react-router-dom';
import OptimizedImage from '../common/OptimizedImage';

const RoomCard = ({ room, variant = 'default' }) => {
  if (variant === 'compact') {
    return (
      <Link
        to={`/rooms/${room.id}`}
        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
      >
        <div className="relative h-48 overflow-hidden group">
          <OptimizedImage
            src={room.image}
            alt={room.name}
            width={600}
            quality={80}
            className="w-full h-48 group-hover:scale-110 transition-transform duration-500"
            blur={true}
          />
        </div>
        <div className="p-4">
          <h3 className="text-xl font-serif font-bold mb-2">{room.name}</h3>
          <p className="text-primary font-semibold">S/. {room.price}/noche</p>
          <p className="text-sm text-gray-600">S/. {room.pricePerHour}/4h</p>
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
      <div className="relative h-56 overflow-hidden group">
        <OptimizedImage
          src={room.image}
          alt={room.name}
          width={800}
          quality={80}
          className="w-full h-56 group-hover:scale-110 transition-transform duration-500"
          blur={true}
        />
        <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-lg font-semibold shadow-lg text-sm z-10">
          <div>S/. {room.price}/noche</div>
          <div className="text-xs opacity-90">S/. {room.pricePerHour}/4h</div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-2xl font-serif font-bold mb-2 text-gray-900">
          {room.name}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {room.description}
        </p>

        <div className="grid grid-cols-3 gap-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {room.guests} personas
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            {room.size}
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {room.bed}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {room.amenities.slice(0, 4).map((amenity, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {amenity}
            </span>
          ))}
        </div>

        <Link
          to={`/rooms/${room.id}`}
          className="block w-full text-center bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors font-semibold"
        >
          Ver Detalles
        </Link>
      </div>
    </div>
  );
};

export default RoomCard;
