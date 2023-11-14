"use client";

import React from "react";
import { CreditCard, LogOut, PlusCircle, Settings, User } from "lucide-react";
import { signOut } from "next-auth/react";

import type { Session } from "@kdx/auth";
import {
  AvatarWrapper,
  Button,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@kdx/ui";

import { AddWorkspaceDialog } from "./add-workspace-dialog";

export function UserProfileButton({ session }: { session: Session }) {
  const [showNewWorkspaceDialog, setShowNewWorkspaceDialog] =
    React.useState(false);
  if (!session) return null;
  return (
    <AddWorkspaceDialog
      session={session}
      open={showNewWorkspaceDialog}
      onOpenChange={setShowNewWorkspaceDialog}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <AvatarWrapper
              className="h-8 w-8"
              src={session.user.image ?? ""}
              fallback={session.user.name}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session.user.name}
              </p>
              <p className="text-muted-foreground text-xs leading-none">
                {session.user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>

            <DialogTrigger asChild>
              <DropdownMenuItem
                onSelect={() => {
                  setShowNewWorkspaceDialog(true);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>New Workspace</span>
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => void signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </AddWorkspaceDialog>
  );
}
