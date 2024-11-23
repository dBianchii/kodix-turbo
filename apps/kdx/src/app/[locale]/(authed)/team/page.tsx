import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";

import { auth } from "@kdx/auth";
import { Separator } from "@kdx/ui/separator";
import { Skeleton } from "@kdx/ui/skeleton";

import { IconKodixApp } from "~/app/[locale]/_components/app/kodix-icon";
import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { getAppUrl } from "~/helpers/miscelaneous";
import { Link, redirect } from "~/i18n/routing";
import { api } from "~/trpc/server";
import { CustomKodixIcon } from "../../_components/app/custom-kodix-icon";

interface CustomApp {
  appName: string;
  appUrl: string;
  iconPath: string;
  shown?: boolean;
}

export default async function TeamPage() {
  const { user } = await auth();
  if (!user) return redirect({ href: "/", locale: await getLocale() });

  const t = await getTranslations();

  const customApps: CustomApp[] = [
    {
      appName: t("App Store"),
      appUrl: "/apps",
      iconPath: "/appIcons/appstore.png",
    },
    {
      appName: t("Settings"),
      appUrl: "/team/settings",
      iconPath: "/appIcons/settings.png",
    },
    {
      appName: t("Notifications"),
      appUrl: "/team/notifications",
      iconPath: "/appIcons/notifications.png",
    },
    // {
    //   appName: "Dev Settings",
    //   appUrl: "/devsettings",
    //   iconPath: "/appIcons/devsettings.png",
    //   shown: !!user.kodixAdmin,
    // },
  ];

  return (
    <MaxWidthWrapper className="flex flex-col">
      <div className="flex">
        <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-xl font-bold">
          {user.activeTeamName}
        </span>
      </div>
      <Separator className="mb-8 mt-1" />
      <Suspense fallback={<AppsSectionSkeleton customApps={customApps} />}>
        <AppsSection customApps={customApps} />
      </Suspense>
    </MaxWidthWrapper>
  );
}

function AppsSectionSkeleton({ customApps }: { customApps: CustomApp[] }) {
  const numberOfSkeletonApps = 3;

  return (
    <div className="flex flex-row items-center space-x-10">
      {customApps.map((app) => (
        <Link
          key={app.appName}
          href={app.appUrl}
          className="transition-transform duration-300 ease-out hover:scale-105"
        >
          <CustomKodixIcon
            appName={app.appName}
            iconPath={app.iconPath}
            key={app.appName}
          />
        </Link>
      ))}
      {Array.from({ length: numberOfSkeletonApps }).map((_, i) => (
        <Skeleton
          className="mb-2 h-[80px] w-[80px] rounded-xl bg-primary/5"
          key={i}
        />
      ))}
    </div>
  );
}

async function AppsSection({ customApps }: { customApps: CustomApp[] }) {
  const apps = await api.app.getInstalled();

  return (
    <div className="grid grid-cols-4 items-center gap-4 md:grid-cols-6 lg:grid-cols-11">
      {customApps.map((app) => (
        <Link
          key={app.appUrl}
          href={app.appUrl}
          className="transition-transform duration-300 ease-out hover:scale-105"
        >
          <CustomKodixIcon
            appName={app.appName}
            iconPath={app.iconPath}
            key={app.appName}
          />
        </Link>
      ))}
      {apps.map((app) => (
        <Link
          key={app.id}
          href={getAppUrl(app.id)}
          className="transition-transform duration-300 ease-out hover:scale-105"
        >
          <IconKodixApp appId={app.id} />
        </Link>
      ))}
    </div>
  );
}
