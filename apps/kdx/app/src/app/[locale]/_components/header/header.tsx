import { Suspense } from "react";
import { buttonVariants } from "@kodix/ui/button";
import { getTranslations } from "next-intl/server";

import { trpcCaller } from "@kdx/api/trpc/react/server";
import { auth } from "@kdx/auth";

import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { Link } from "~/i18n/routing";

import { AppSwitcherClient } from "../app-switcher/app-switcher-client";
import { I18nPicker } from "./i18n-picker";
import { Logo } from "./logo";
import { NotificationsPopoverClient } from "./notifications-popover-client";
import { UserProfileButton } from "./user-profile-button";

export function Header() {
  return (
    <header className="border-b py-2">
      <MaxWidthWrapper className="max-w-(--breakpoint-2xl)">
        <div className="mx-auto flex max-w-(--breakpoint-2xl) items-center">
          <Suspense fallback={<Logo redirect="/team" />}>
            <LogoWithAppSwitcher />
          </Suspense>

          <div className="ml-auto flex items-center space-x-4">
            <Suspense>
              <RightSide />
            </Suspense>
          </div>
        </div>
      </MaxWidthWrapper>
    </header>
  );
}

async function LogoWithAppSwitcher() {
  const { user } = await auth();

  return (
    <>
      <Logo redirect={user ? "/team" : "/"} />
      {user && (
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
            <title>slash Icon</title>
            <path d="M16.88 3.549L7.12 20.451"></path>
          </svg>
          <AppSwitcherClient appsPromise={trpcCaller.app.getInstalled()} />
        </>
      )}
    </>
  );
}

async function NotificationsPopover() {
  const { user } = await auth();
  if (!user) return null;

  const initialNotifications = await trpcCaller.user.getInvitations();
  if (!initialNotifications.length) return null;

  return (
    <NotificationsPopoverClient initialNotifications={initialNotifications} />
  );
}

async function RightSide() {
  const { user } = await auth();
  const t = await getTranslations();

  return (
    <>
      <I18nPicker />
      {!!user && (
        <>
          <Suspense>
            <NotificationsPopover />
          </Suspense>
          <UserProfileButton user={user} />
        </>
      )}
      {!user && (
        <div className="mr-5 space-x-2">
          <Link className={buttonVariants({ variant: "ghost" })} href="/signin">
            {t("header.Log in")}
          </Link>
          <Link
            className={buttonVariants({ variant: "default" })}
            href="/signup"
          >
            {t("header.Sign up")}
          </Link>
        </div>
      )}
    </>
  );
}

// async function MainNav() {
//   const { user } = await auth();
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
//       shown: !!user,
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
