"use client";

import { useTransition } from "react";
import { LuRefreshCw } from "react-icons/lu";

import { cn } from "@kdx/ui";
import { Button } from "@kdx/ui/button";

import { api } from "~/trpc/react";

export function ReloadMembersButton() {
  const utils = api.useUtils();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="icon"
      variant={"ghost"}
      onClick={() => {
        startTransition(async () => {
          await Promise.allSettled([
            utils.team.getAllUsers.invalidate(),
            utils.team.invitation.getAll.invalidate(),
          ]);
        });
      }}
    >
      <LuRefreshCw
        className={cn({
          "animate-spin": isPending,
        })}
      />
    </Button>
  );
}
