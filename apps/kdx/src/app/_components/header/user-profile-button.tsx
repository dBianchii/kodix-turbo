"use client";

import React from "react";
import Link from "next/link";
import { LogOut, Settings, User, Users } from "lucide-react";
import { signOut } from "next-auth/react";
import { MdOutlineSwapHorizontalCircle } from "react-icons/md";

import type { Session } from "@kdx/auth";
import {
  AvatarWrapper,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@kdx/ui";

import { AddTeamDialog } from "./add-team-dialog";

export function UserProfileButton({ session }: { session: Session }) {
  const [showNewTeamDialog, setShowNewTeamDialog] = React.useState(false);
  if (!session) return null;
  return (
    <AddTeamDialog
      session={session}
      open={showNewTeamDialog}
      onOpenChange={setShowNewTeamDialog}
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
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/account">
                <User className="mr-2 h-4 w-4" />
                <span>Account</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="mb-2" />
            <DropdownMenuItem asChild>
              <Link href="/team" className="flex border border-gray-600">
                <Users className="h-4 w-4" />
                <p className="ml-2 font-bold">{session.user.activeTeamName}</p>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/team/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/account/teams">
                <MdOutlineSwapHorizontalCircle className="mr-2 h-4 w-4" />
                Change team...
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => void signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </AddTeamDialog>
  );
}
