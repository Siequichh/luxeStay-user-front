const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="text-center p-6 rounded-xl hover:shadow-xl transition-shadow bg-gray-50 hover:bg-white border border-gray-100">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default FeatureCard;
