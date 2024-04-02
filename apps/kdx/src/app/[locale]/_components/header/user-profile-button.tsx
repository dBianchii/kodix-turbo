"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LuLogOut, LuUsers } from "react-icons/lu";
import { MdOutlineSwapHorizontalCircle } from "react-icons/md";
import { RxGear, RxPerson } from "react-icons/rx";

import type { Session } from "@kdx/auth";
import { useScopedI18n } from "@kdx/locales/client";
import { AvatarWrapper } from "@kdx/ui/avatar-wrapper";
import { Button } from "@kdx/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@kdx/ui/dropdown-menu";

export function UserProfileButton({ session }: { session: Session }) {
  const t = useScopedI18n("header");

  if (!session) return null;
  return (
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
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/account">
              <RxPerson className="mr-2 size-4" />
              <span>{t("Account")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="mb-2" />
          <DropdownMenuItem asChild>
            <Link href="/team" className="flex border border-gray-600">
              <LuUsers className="size-4" />
              <p className="ml-2 font-bold">{session.user.activeTeamName}</p>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/team/settings">
              <RxGear className="mr-2 size-4" />
              {t("Settings")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account/teams">
              <MdOutlineSwapHorizontalCircle className="mr-2 size-4" />
              {t("Change team")}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void signOut()}>
          <LuLogOut className="mr-2 size-4" />
          <span>{t("Log out")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
