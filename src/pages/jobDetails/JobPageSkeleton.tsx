import Header from "@/components/Header";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const JobPageSkeleton = () => {
  return (
    <div className="w-full h-full bg-background flex flex-col p-4">
      <Header />
      <div className="flex-1 overflow-y-auto pb-16">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/4" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Separator className="my-2" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-full" />
          </div>
          <Separator className="my-2" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-8 w-1/4" />
        </div>
      </div>
      <div className="fixed bottom-4 left-4 right-4">
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
};

export default JobPageSkeleton;
