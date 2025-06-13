import { Skeleton } from "./ui/skeleton";

export function SkeletonLoader() {
  // Show 3 skeleton cards by default
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="border-l-4 border-l-white/30 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 p-4"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <Skeleton className="h-4 w-20 bg-white/20" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-5 w-3/4 bg-white/20" />
              <Skeleton className="h-4 w-full bg-white/15" />
              <Skeleton className="h-4 w-5/6 bg-white/15" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Skeleton className="h-8 w-8 bg-white/20 rounded" />
              <Skeleton className="h-8 w-8 bg-white/20 rounded" />
              <Skeleton className="h-8 w-20 bg-white/20 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
