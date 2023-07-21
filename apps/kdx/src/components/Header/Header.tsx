"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, LogOut, PlusCircle, Settings, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  buttonVariants,
  cn,
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

import TeamSwitcher, { AddWorkspaceDialog } from "./teamSwitcher";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 ">
        {!session && (
          <Link
            href="/"
            className="text-bold text-primary mx-5 text-xl font-medium"
          >
            Kodix
          </Link>
        )}
        {!!session && <TeamSwitcher />}

        <MainNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          <UserNav />
        </div>
      </div>
    </header>
  );
}

function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const navigation = [
    {
      href: "/marketplace",
      title: "Marketplace",
    },
    {
      href: "/apps",
      title: "Apps",
      shown: session?.user.id !== undefined,
    },
  ].map((item) => ({ ...item, shown: item.shown ?? true })); // defaults shown to true if not defined

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {navigation
        .filter((x) => x.shown)
        .map((item) => (
          <Link
            href={item.href}
            key={item.href}
            className={cn(
              "hover:text-primary text-sm font-medium transition-colors",
              pathname !== item.href ? "text-muted-foreground" : null,
            )}
          >
            {item.title}
          </Link>
        ))}
    </nav>
  );
}

export function UserNav() {
  const { data: session } = useSession();
  const [showNewWorkspaceDialog, setShowNewWorkspaceDialog] =
    React.useState(false);
  return (
    <>
      {session?.user.id && (
        <AddWorkspaceDialog
          open={showNewWorkspaceDialog}
          onOpenChange={setShowNewWorkspaceDialog}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={session.user.image ?? ""}
                    alt="Avatar image"
                  />
                  <AvatarFallback>
                    {session.user.name
                      ? session?.user?.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      : ""}
                  </AvatarFallback>
                </Avatar>
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
      )}
      {!session?.user.id && (
        <div className="mr-5 space-x-2">
          <Link href="/signIn" className={buttonVariants({ variant: "ghost" })}>
            Sign In
          </Link>
          <Link
            href="/signIn"
            className={buttonVariants({ variant: "default" })}
          >
            Sign Up
          </Link>
        </div>
      )}
    </>
  );
}
