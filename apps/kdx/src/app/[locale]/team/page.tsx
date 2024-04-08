import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import type { KodixAppId } from "@kdx/shared";
import { auth } from "@kdx/auth";
import { getI18n } from "@kdx/locales/server";
import { Separator } from "@kdx/ui/separator";
import { Skeleton } from "@kdx/ui/skeleton";

import {
  CustomKodixIcon,
  IconKodixApp,
} from "~/app/[locale]/_components/app/kodix-icon";
import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { getAppUrl } from "~/helpers/miscelaneous";
import { api } from "~/trpc/server";

interface CustomApp {
  appName: string;
  appUrl: string;
  iconPath: string;
  shown?: boolean;
}

export default async function Team() {
  const session = await auth();
  if (!session) redirect("/");
  const t = await getI18n();

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
    // {
    //   appName: "Dev Settings",
    //   appUrl: "/devsettings",
    //   iconPath: "/appIcons/devsettings.png",
    //   shown: !!session.user.kodixAdmin,
    // },
  ];

  return (
    <MaxWidthWrapper className="flex flex-col">
      <div className="flex">
        <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-xl font-bold">
          {session.user.activeTeamName}
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
        <CustomKodixIcon
          appName={app.appName}
          appUrl={app.appUrl}
          iconPath={app.iconPath}
          key={app.appName}
        />
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
    <div className="flex flex-row items-center space-x-10">
      {customApps.map((app) => (
        <CustomKodixIcon
          appName={app.appName}
          appUrl={app.appUrl}
          iconPath={app.iconPath}
          key={app.appName}
        />
      ))}
      {apps.map((app) => (
        <Link
          key={app.id}
          href={getAppUrl(app.id as KodixAppId)}
          className="flex flex-col items-center"
        >
          <IconKodixApp appId={app.id as KodixAppId} />
        </Link>
      ))}
    </div>
  );
}
