import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@kodix/ui/card";
import { Skeleton } from "@kodix/ui/skeleton";

export default function SettingsEditCardSkeleton() {
  return (
    <Card className="w-full text-left">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-[140px]" />
        </CardTitle>
        <Skeleton className="h-4 w-[200px]" />
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t px-6 py-4">
        <Skeleton className="h-4 w-60" />
        <Skeleton className="h-8 w-16" />
      </CardFooter>
    </Card>
  );
}
