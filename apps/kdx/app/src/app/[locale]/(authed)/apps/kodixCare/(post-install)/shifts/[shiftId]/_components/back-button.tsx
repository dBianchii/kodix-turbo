"use client";

import { Button } from "@kodix/ui/button";
import { LuArrowLeft } from "react-icons/lu";

import { useRouter } from "~/i18n/routing";

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
