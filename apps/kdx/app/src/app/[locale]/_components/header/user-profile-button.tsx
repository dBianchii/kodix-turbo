"use client";

import { AvatarWrapper } from "@kodix/ui/avatar-wrapper";
import { Button } from "@kodix/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@kodix/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import { LuCog, LuLogOut, LuUser, LuUsers } from "react-icons/lu";
import { MdOutlineSwapHorizontalCircle } from "react-icons/md";

import type { User } from "@kdx/auth";

import { signOutAction } from "~/helpers/actions";
import { Link } from "~/i18n/routing";

export function UserProfileButton({ user }: { user: User }) {
  const t = useTranslations("header");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <AvatarWrapper
            className="h-8 w-8"
            src={user.image ?? ""}
            fallback={user.name}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="font-medium text-sm leading-none">{user.name}</p>
            <p className="text-muted-foreground text-xs leading-none">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/account">
              <LuUser className="mr-2 size-4" />
              <span>{t("Account")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="mb-2" />
          <DropdownMenuItem asChild>
            <Link href="/team" className="flex border border-gray-600">
              <LuUsers className="size-4" />
              <p className="ml-2 font-bold">{user.activeTeamName}</p>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/team/settings">
              <LuCog className="mr-2 size-4" />
              {t("Settings")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account/general">
              <MdOutlineSwapHorizontalCircle className="mr-2 size-4" />
              {t("Change team")}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void signOutAction()}>
          <LuLogOut className="mr-2 size-4" />
          <span>{t("Log out")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
