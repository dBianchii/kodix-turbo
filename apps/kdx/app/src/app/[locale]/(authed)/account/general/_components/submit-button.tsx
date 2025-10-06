"use client";

import { Button } from "@kodix/ui/button";
import { useFormStatus } from "react-dom";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const formStatus = useFormStatus();

  return (
    <Button loading={formStatus.pending} type="submit">
      {children}
    </Button>
  );
}
