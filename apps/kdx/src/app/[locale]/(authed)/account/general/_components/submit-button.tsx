"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@kdx/ui/button";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const formStatus = useFormStatus();

  return (
    <Button type="submit" loading={formStatus.pending}>
      {children}
    </Button>
  );
}
