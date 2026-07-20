// Iconos SVG por clave — reemplaza los emojis (se veían genéricos y varían por SO)
const ICONS = {
  bolt: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
  ),
  clock: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  ),
  card: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  ),
  qr: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
  ),
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="group text-center p-8 rounded-2xl transition-all duration-300 bg-gray-50 hover:bg-white border border-gray-100 hover:border-primary/20 hover:shadow-xl hover:-translate-y-1">
      <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/30">
        <svg className="w-7 h-7 text-primary transition-colors group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {ICONS[icon] || ICONS.bolt}
        </svg>
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;
