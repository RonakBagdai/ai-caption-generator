const LoadingSkeleton = ({ className = "", children }) => {
  return <div className={`animate-pulse ${className}`}>{children}</div>;
};

export const PostCardSkeleton = () => {
  return (
    <LoadingSkeleton className="bg-white rounded-lg overflow-hidden shadow border border-gray-200">
      <div className="aspect-square bg-gray-300"></div>
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </LoadingSkeleton>
  );
};

export const PostGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </div>
  );
};

export const ProfileSkeleton = () => {
  return (
    <LoadingSkeleton className="bg-white rounded-lg p-6 shadow">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-300 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </LoadingSkeleton>
  );
};

export const StatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <LoadingSkeleton key={index} className="bg-white rounded-lg p-6 shadow">
          <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </LoadingSkeleton>
      ))}
    </div>
  );
};

export const TimelineSkeleton = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <LoadingSkeleton
          key={index}
          className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow"
        >
          <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </LoadingSkeleton>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
