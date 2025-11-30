"use client";

import { useRouter } from "next/navigation";
import { Button } from "@kodix/ui/button";

export function ErrorFallback({ error }: { error: Error }) {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col items-center justify-center space-y-4">
      <div>
        <h2 className="text-md">Something went wrong</h2>
        <p className="text-muted-foreground text-sm">{error.message}</p>
      </div>
      <Button onClick={() => router.refresh()} variant="outline">
        Try again
      </Button>
    </div>
  );
}
