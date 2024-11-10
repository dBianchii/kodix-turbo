"use client";

import { LuArrowLeft } from "react-icons/lu";

import { useRouter } from "@kdx/locales/next-intl/navigation";
import { Button } from "@kdx/ui/button";

export function BackButton() {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      size="icon"
      className="shrink-0"
      onClick={() => router.back()}
    >
      <LuArrowLeft className="size-4" />
      <span className="sr-only">Back</span>
    </Button>
  );
}
