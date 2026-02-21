interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => (
  <div className={`skeleton ${className}`} />
);

export const SkeletonCard = () => (
  <div className="glass-card rounded-2xl overflow-hidden">
    <div className="skeleton-image skeleton" />
    <div className="p-4">
      <div className="skeleton skeleton-text w-3/4" />
      <div className="flex items-center gap-3 mb-3">
        <div className="skeleton skeleton-avatar w-6 h-6" />
        <div className="skeleton skeleton-text-sm w-20" />
      </div>
      <div className="flex gap-2 mb-3">
        <div className="skeleton w-14 h-5 rounded-md" />
        <div className="skeleton w-16 h-5 rounded-md" />
        <div className="skeleton w-12 h-5 rounded-md" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
        <div className="flex items-center gap-4">
          <div className="skeleton w-12 h-4" />
          <div className="skeleton w-12 h-4" />
        </div>
        <div className="skeleton w-16 h-4" />
      </div>
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={`skeleton-${i}-${Date.now()}`}
        className="animate-stagger"
        style={{ animationDelay: `${i * 50}ms` }}
      >
        <SkeletonCard />
      </div>
    ))}
  </div>
);

export const SkeletonAgentCard = () => (
  <div className="glass-card rounded-2xl p-6 flex flex-col items-center">
    <div className="skeleton w-20 h-20 rounded-2xl mb-4" />
    <div className="skeleton skeleton-text w-24 mb-2" />
    <div className="skeleton skeleton-text-sm w-32 mb-4" />
    <div className="skeleton w-full h-8 rounded-xl" />
  </div>
);

export const SkeletonSearchResult = () => (
  <div className="flex items-center gap-4 p-3 rounded-xl">
    <div className="skeleton w-14 h-14 rounded-lg" />
    <div className="flex-1">
      <div className="skeleton skeleton-text w-32 mb-2" />
      <div className="skeleton skeleton-text-sm w-24 mb-2" />
      <div className="flex gap-1">
        <div className="skeleton w-12 h-4 rounded-md" />
        <div className="skeleton w-14 h-4 rounded-md" />
      </div>
    </div>
  </div>
);

export default Skeleton;
