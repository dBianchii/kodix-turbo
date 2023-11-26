"use client";

import React from "react";
import { MoreHorizontal } from "lucide-react";

import type { Session } from "@kdx/auth";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  toast,
} from "@kdx/ui";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

export default function LeaveWsDropdown({ session }: { session: Session }) {
  const utils = api.useUtils();
  const { mutate } = api.workspace.removeUser.useMutation({
    onSuccess: () => {
      toast("User removed from workspace");
      void utils.workspace.getAllUsers.invalidate();
    },
    onError: (e) => trpcErrorToastDefault(e),
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="text-destructive"
          onSelect={() => {
            mutate({
              workspaceId: session.user.activeWorkspaceId,
              userId: session.user.id,
            });
          }}
        >
          Leave
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}