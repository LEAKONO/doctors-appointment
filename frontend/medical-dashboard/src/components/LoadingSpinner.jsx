export const LoadingSpinner = ({ size = 8, color = 'blue' }) => {
  const sizeClasses = {
    4: 'h-4 w-4',
    6: 'h-6 w-6',
    8: 'h-8 w-8',
    12: 'h-12 w-12'
  };

  const colorClasses = {
    blue: 'border-blue-500',
    gray: 'border-gray-400',
    white: 'border-white'
  };

  return (
    <div 
      className={`inline-block animate-spin rounded-full border-t-2 border-b-2 ${sizeClasses[size]} ${colorClasses[color]}`}
      aria-label="Loading..."
    ></div>
  );
};

export const SkeletonCard = () => (
  <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-lg animate-pulse">
    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-300"></div>
    <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
    <div className="h-3 bg-gray-300 rounded w-1/2 mx-auto mb-4"></div>
    <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
    <div className="h-3 bg-gray-300 rounded w-full"></div>
  </div>
);

export const FullPageLoader = () => (
  <div className="flex min-h-screen bg-gray-50 items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size={12} />
      <p className="text-gray-600 mt-4">Loading your dashboard...</p>
    </div>
  </div>
);