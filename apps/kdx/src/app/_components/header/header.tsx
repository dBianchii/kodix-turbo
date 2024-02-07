import { Suspense } from "react";
import Link from "next/link";
import { RxPlusCircled } from "react-icons/rx";

import type { KodixAppId } from "@kdx/shared";
import { auth } from "@kdx/auth";
import { getAppName } from "@kdx/shared";
import { buttonVariants } from "@kdx/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@kdx/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "@kdx/ui/navigationMenuTriggerStyle";
import { Skeleton } from "@kdx/ui/skeleton";
import { cn } from "@kdx/ui/utils";

import HeaderFooterRemover from "~/app/_components/header-footer-remover";
import MaxWidthWrapper from "~/app/_components/max-width-wrapper";
import { getAppUrl } from "~/helpers/miscelaneous";
import { api } from "~/trpc/server";
import { IconKodixApp } from "../app/kodix-icon";
import CurrentAppIcon from "./current-app-icon";
import { UserProfileButton } from "./user-profile-button";

export async function Header() {
  const session = await auth();

  return (
    <HeaderFooterRemover>
      <header className="border-b py-2">
        <MaxWidthWrapper className="max-w-screen-2xl">
          <div className="mx-auto flex max-w-screen-2xl items-center">
            <Link
              href={session ? "/team" : "/"}
              className="text-bold text-xl font-medium text-primary"
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
                <Suspense fallback={<Skeleton className="h-9 w-16 py-2" />}>
                  <AppSwitcher />
                </Suspense>
              </>
            )}

            <div className="ml-auto flex items-center space-x-4">
              {!!session && <UserProfileButton session={session} />}
              {!session && (
                <div className="mr-5 space-x-2">
                  <Link
                    href="/signin"
                    className={buttonVariants({ variant: "ghost" })}
                  >
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
            </div>
          </div>
        </MaxWidthWrapper>
      </header>
    </HeaderFooterRemover>
  );
}

async function AppSwitcher() {
  const apps = await api.app.getInstalled();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <CurrentAppIcon />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="flex flex-col">
              {apps.map((app) => (
                <NavigationMenuItem
                  className="flex w-full flex-row"
                  key={app.id}
                >
                  <Link
                    href={getAppUrl(app.id as KodixAppId)}
                    legacyBehavior
                    passHref
                  >
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "py-6, w-44 justify-start p-4",
                      )}
                    >
                      <IconKodixApp
                        appId={app.id as KodixAppId}
                        renderText={false}
                        size={28}
                      />
                      <p className="ml-4">{getAppName(app.id as KodixAppId)}</p>
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
              <NavigationMenuItem className="flex w-full flex-row">
                <Link href={"/apps"} legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "py-6, w-44 justify-start p-4",
                    )}
                  >
                    <RxPlusCircled className="ml-2 h-4 w-4" />
                    <p className="ml-4">Add more apps</p>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

// async function MainNav() {
//   const session = await auth();
//   const navigation: {
//     href: string;
//     title: string;
//     shown: boolean;
//   }[] = [
//     {
//       href: "/marketplace",
//       title: "Marketplace",
//       shown: true,
//     },
//     {
//       href: "/apps",
//       title: "Apps",
//       shown: !!session,
//     },
//   ];

//   return (
//     <NavigationMenu className="space-x-1">
//       {navigation
//         .filter((x) => x.shown)
//         .map((item) => (
//           <NavigationMenuList key={item.href}>
//             <NavigationMenuItem>
//               <Link href={item.href} legacyBehavior passHref>
//                 <NavigationMenuLink
//                   className={cn(navigationMenuTriggerStyle())}
//                 >
//                   {item.title}
//                 </NavigationMenuLink>
//               </Link>
//             </NavigationMenuItem>
//           </NavigationMenuList>
//         ))}
//     </NavigationMenu>
//   );
// }
