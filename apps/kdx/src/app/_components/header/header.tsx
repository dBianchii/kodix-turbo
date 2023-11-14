import React from "react";
import Link from "next/link";

import { auth } from "@kdx/auth";
import {
  buttonVariants,
  cn,
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@kdx/ui";

import HeaderFooterRemover from "../header-footer-remover";
import MaxWidthWrapper from "../max-width-wrapper";
import { TeamSwitcher } from "./team-switcher";
import { UserProfileButton } from "./user-profile-button";

export async function Header() {
  const session = await auth();

  return (
    <HeaderFooterRemover>
      <header className="border-b pb-4">
        <MaxWidthWrapper>
          <div className="mx-auto flex h-16 max-w-screen-2xl items-center">
            <Link
              href="/"
              className="text-bold text-primary mx-5 text-xl font-medium"
            >
              <span className="hidden bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text font-extrabold tracking-tight text-transparent md:block">
                Kodix
              </span>
              <span className="block bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text font-extrabold tracking-tight text-transparent md:hidden">
                Kdx
              </span>
            </Link>
            {session && (
              //Slash icon
              <>
                <svg
                  className="text-[#eaeaea] dark:text-[#333]"
                  data-testid="geist-icon"
                  fill="none"
                  height="24"
                  shapeRendering="geometricPrecision"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M16.88 3.549L7.12 20.451"></path>
                </svg>
                <TeamSwitcher session={session} />
              </>
            )}

            <div className="ml-auto flex items-center space-x-4">
              <UserNav />
            </div>
          </div>
          <div className="mx-auto flex h-8 max-w-screen-2xl items-center px-4">
            <MainNav />
          </div>
        </MaxWidthWrapper>
      </header>
    </HeaderFooterRemover>
  );
}

async function MainNav() {
  const session = await auth();
  const navigation: {
    href: string;
    title: string;
    shown: boolean;
  }[] = [
    {
      href: "/marketplace",
      title: "Marketplace",
      shown: true,
    },
    {
      href: "/apps",
      title: "Apps",
      shown: !!session,
    },
  ];

  return (
    <NavigationMenu className="space-x-1">
      {navigation
        .filter((x) => x.shown)
        .map((item) => (
          <NavigationMenuList key={item.href}>
            <NavigationMenuItem>
              <Link href={item.href} legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(navigationMenuTriggerStyle())}
                >
                  {item.title}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        ))}
    </NavigationMenu>
  );
}

export async function UserNav() {
  const session = await auth();

  return (
    <>
      {!!session && <UserProfileButton session={session} />}
      {!session && (
        <div className="mr-5 space-x-2">
          <Link href="/signin" className={buttonVariants({ variant: "ghost" })}>
            Sign In
          </Link>
          <Link
            href="/signin"
            className={buttonVariants({ variant: "default" })}
          >
            Sign Up
          </Link>
        </div>
      )}
    </>
  );
}
