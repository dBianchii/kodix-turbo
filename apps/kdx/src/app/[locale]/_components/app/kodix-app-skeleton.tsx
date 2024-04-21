import { Card, CardContent, CardFooter, CardHeader } from "@kdx/ui/card";
import { Skeleton } from "@kdx/ui/skeleton";

export function KodixAppSkeleton() {
  return (
    <Card className="flex h-64 flex-col">
      <CardHeader>
        <Skeleton className="size-12" />
      </CardHeader>
      <CardContent className="flex grow flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardContent>
      <CardFooter className="flex justify-between border-t px-6 py-4">
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-4 w-10" />
      </CardFooter>
    </Card>
  );
}
