"use client";

import { useFormStatus } from "react-dom";
import { LuLoader2 } from "react-icons/lu";

import { Button } from "@kdx/ui/button";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const formStatus = useFormStatus();

  return (
    <Button type="submit" disabled={formStatus.pending}>
      {formStatus.pending ? <LuLoader2 className="animate-spin" /> : children}
    </Button>
  );
}
