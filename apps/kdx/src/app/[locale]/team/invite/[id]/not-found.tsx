"use client";

import { signOut } from "next-auth/react";

import { Button } from "@kdx/ui/button";

export default function InviteNotFound() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center space-y-8">
      <h1 className="text-4xl font-bold">Not found</h1>
      <p className="text-center">
        Team not found by the given invite code or user is not authorized to
        join the team. Did you log into the correct account?
      </p>

      <Button
        onClick={() => {
          void signOut();
        }}
      >
        Use another account...
      </Button>
    </section>
  );
}
