"use client";

import { useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LuRefreshCw } from "react-icons/lu";

import { cn } from "@kdx/ui";
import { Button } from "@kdx/ui/button";

import { useTRPC } from "~/trpc/react";

export function ReloadMembersButton() {
  const api = useTRPC();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="icon"
      variant={"ghost"}
      onClick={() => {
        startTransition(async () => {
          await Promise.allSettled([
            queryClient.invalidateQueries(api.team.getAllUsers.pathFilter()),
            queryClient.invalidateQueries(
              api.team.invitation.getAll.pathFilter(),
            ),
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
