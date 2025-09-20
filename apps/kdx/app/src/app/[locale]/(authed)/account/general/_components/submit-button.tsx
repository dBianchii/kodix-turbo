"use client";

import { Button } from "@kodix/ui/button";
import { useFormStatus } from "react-dom";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const formStatus = useFormStatus();

  return (
    <Button type="submit" loading={formStatus.pending}>
      {children}
    </Button>
  );
}
