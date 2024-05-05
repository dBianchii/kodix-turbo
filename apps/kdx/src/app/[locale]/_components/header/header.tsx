import { Suspense } from "react";
import Link from "next/link";

import { auth } from "@kdx/auth";
import { getI18n } from "@kdx/locales/server";
import { buttonVariants } from "@kdx/ui/button";

import HeaderFooterRemover from "~/app/[locale]/_components/header-footer-remover";
import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { api } from "~/trpc/server";
import { AppSwitcher } from "../app-switcher";
import { I18nPicker } from "./i18n-picker";
import { NotificationsPopoverClient } from "./notifications-popover-client";
import { UserProfileButton } from "./user-profile-button";

export function Header() {
  return (
    <HeaderFooterRemover>
      <header className="border-b py-2">
        <MaxWidthWrapper className="max-w-screen-2xl">
          <div className="mx-auto flex max-w-screen-2xl items-center">
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
    </HeaderFooterRemover>
  );
}

async function LogoWithAppSwitcher() {
  const session = await auth();

  return (
    <>
      <Logo redirect={session ? "/team" : "/"} />
      {session && (
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
          <AppSwitcher />
        </>
      )}
    </>
  );
}

function Logo({ redirect }: { redirect: string }) {
  return (
    <Link
      href={redirect}
      className="text-bold text-xl font-medium text-primary"
    >
      <span className="hidden bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text font-extrabold tracking-tight text-transparent md:block">
        Kodix
      </span>
      <span className="block bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text font-extrabold tracking-tight text-transparent md:hidden">
        Kdx
      </span>
    </Link>
  );
}

async function NotificationsPopover() {
  const session = await auth();
  if (!session) return null;

  const initialNotifications = await api.user.getInvitations();
  if (!initialNotifications.length) return null;

  return (
    <NotificationsPopoverClient initialNotifications={initialNotifications} />
  );
}

async function RightSide() {
  const session = await auth();
  const t = await getI18n();

  return (
    <>
      <I18nPicker />
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
          <Link href="/signin" className={buttonVariants({ variant: "ghost" })}>
            {t("header.Log in")}
          </Link>
          <Link
            href="/signin"
            className={buttonVariants({ variant: "default" })}
          >
            {t("header.Sign up")}
          </Link>
        </div>
      )}
    </>
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
