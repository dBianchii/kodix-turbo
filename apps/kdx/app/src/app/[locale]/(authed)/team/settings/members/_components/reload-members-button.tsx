"use client";

import { useTransition } from "react";
import { cn } from "@kodix/ui";
import { Button } from "@kodix/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { LuRefreshCw } from "react-icons/lu";

import { useTRPC } from "@kdx/api/trpc/react/client";

export function ReloadMembersButton() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="icon"
      variant={"ghost"}
      onClick={() => {
        startTransition(async () => {
          await Promise.allSettled([
            queryClient.invalidateQueries(trpc.team.getAllUsers.pathFilter()),
            queryClient.invalidateQueries(
              trpc.team.invitation.getAll.pathFilter(),
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
