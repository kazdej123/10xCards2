import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export function SkeletonLoader() {
  // Show 3 skeleton cards by default
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="border-l-4 border-l-gray-200 bg-gray-50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
