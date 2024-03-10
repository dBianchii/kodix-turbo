import { Suspense } from "react";
import Link from "next/link";
import { MdNotificationsActive } from "react-icons/md";

import { auth } from "@kdx/auth";
import { Button, buttonVariants } from "@kdx/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@kdx/ui/popover";
import { Skeleton } from "@kdx/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@kdx/ui/tooltip";

import HeaderFooterRemover from "~/app/_components/header-footer-remover";
import MaxWidthWrapper from "~/app/_components/max-width-wrapper";
import { api } from "~/trpc/server";
import { AppSwitcher } from "../app-switcher/app-switcher";
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
              {!!session && (
                <>
                  <Suspense>
                    <NotificationsPopover />
                  </Suspense>
                  <UserProfileButton session={session} />
                </>
              )}
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

async function NotificationsPopover() {
  const { invitations } = await api.user.getNotifications();
  if (!invitations.length) return null;
  return (
    <Popover>
      <PopoverTrigger>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <MdNotificationsActive className="size-4 text-orange-500" />
                <span className="sr-only">Notifications</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex items-center gap-2">
          <MdNotificationsActive className="size-4 text-orange-500" />
          <h4 className="text-md font-semibold">Notifications</h4>
        </div>
        <ul className="space-y-2">
          {invitations.map((invitation) => (
            <li key={invitation.id}>
              <div>
                <p>
                  <strong>{invitation.InvitedBy.name}</strong> invited you to{" "}
                  <strong>{invitation.Team.name}</strong>
                </p>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    Accept
                  </Button>
                  <Button variant="ghost" size="sm">
                    Decline
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
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
