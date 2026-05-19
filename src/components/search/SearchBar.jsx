import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUbigeo } from '../../hooks/useUbigeo';

const SearchBar = () => {
  const navigate = useNavigate();
  const {
    departments, provinces, districts,
    selectedDep, selectedProv, selectedDist,
    setSelectedDep, setSelectedProv, setSelectedDist,
    loading: ubigeoLoading,
  } = useUbigeo();

  const [searchData, setSearchData] = useState({
    checkIn:  '',
    checkOut: '',
    guests:   1,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchData.checkIn)    params.set('checkIn',  searchData.checkIn);
    if (searchData.checkOut)   params.set('checkOut', searchData.checkOut);
    if (searchData.guests > 1) params.set('guests',   searchData.guests);

    const locationValue = selectedDist
      ? selectedDist.districtName
      : selectedProv
        ? (provinces.find(p => p.code === selectedProv)?.name ?? '')
        : selectedDep
          ? (departments.find(d => d.code === selectedDep)?.name ?? '')
          : '';
    if (locationValue) params.set('location', locationValue);

    navigate(`/rooms?${params.toString()}`);
  };

  const handleChange = (field, value) => {
    setSearchData(prev => ({ ...prev, [field]: value }));
  };

  const selectBase =
    'w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white transition-colors text-sm';

  return (
    <div className="w-full max-w-5xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-6">

        {/* ── Row 1: Ubigeo cascading selects ──────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

          {/* Departamento */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Departamento
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <select
                value={selectedDep}
                onChange={(e) => setSelectedDep(e.target.value)}
                disabled={ubigeoLoading}
                className={`${selectBase} pl-9 ${ubigeoLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <option value="">Todos los departamentos</option>
                {departments.map(d => (
                  <option key={d.code} value={d.code}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Provincia */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Provincia
            </label>
            <select
              value={selectedProv}
              onChange={(e) => setSelectedProv(e.target.value)}
              disabled={!selectedDep || ubigeoLoading}
              className={`${selectBase} ${!selectedDep ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">Todas las provincias</option>
              {provinces.map(p => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Distrito */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Distrito
            </label>
            <select
              value={selectedDist?.id ?? ''}
              onChange={(e) => setSelectedDist(e.target.value)}
              disabled={!selectedProv || ubigeoLoading}
              className={`${selectBase} ${!selectedProv ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">Todos los distritos</option>
              {districts.map(d => (
                <option key={d.id} value={d.id}>{d.districtName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Row 2: Dates + Guests + Search button ────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* Check-in */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Entrada</label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <input
                type="date"
                value={searchData.checkIn}
                onChange={(e) => handleChange('checkIn', e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
            </div>
          </div>

          {/* Check-out */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Salida</label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <input
                type="date"
                value={searchData.checkOut}
                onChange={(e) => handleChange('checkOut', e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
            </div>
          </div>

          {/* Huéspedes */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Huéspedes</label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <select
                value={searchData.guests}
                onChange={(e) => handleChange('guests', parseInt(e.target.value))}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white transition-colors"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Huésped' : 'Huéspedes'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Buscar */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-transparent select-none" aria-hidden="true">
              Buscar
            </label>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default SearchBar;
