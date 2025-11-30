"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@kodix/ui/button";
import { toast } from "@kodix/ui/sonner";
import { Spinner } from "@kodix/ui/spinner";

import { CLIENT_NOT_FOUND_ERROR_NAME } from "./utils/not-found-error";

export function ErrorFallback({ error }: { error: Error }) {
  const router = useRouter();

  const [isNotFoundError, setIsNotFoundError] = useState(false);

  //Ref is needed because of strict mode
  const hasShownToastRef = useRef(false);

  const showToastOnce = useEffectEvent(() => {
    if (!hasShownToastRef.current) {
      toast.warning(error.message);
      hasShownToastRef.current = true;
    }
  });

  useEffect(() => {
    if (error.name === CLIENT_NOT_FOUND_ERROR_NAME) {
      setIsNotFoundError(true);
      showToastOnce();
      router.push("/admin/clients");
    }
  }, [error, router]);

  return (
    <div className="flex h-full flex-col items-center justify-center space-y-4">
      <div>
        <h2 className="text-md">Something went wrong</h2>
      </div>
      {isNotFoundError ? (
        <Spinner />
      ) : (
        <Button onClick={() => router.refresh()} variant="outline">
          Try again
        </Button>
      )}
    </div>
  );
}
