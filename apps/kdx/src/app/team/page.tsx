import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import type { KodixAppId } from "@kdx/shared";
import { auth } from "@kdx/auth";
import { Skeleton } from "@kdx/ui/skeleton";

import {
  CustomKodixIcon,
  IconKodixApp,
} from "~/app/_components/app/kodix-icon";
import MaxWidthWrapper from "~/app/_components/max-width-wrapper";
import { getAppUrl } from "~/helpers/miscelaneous";
import { api } from "~/trpc/server";

export default async function Team() {
  const session = await auth();
  if (!session) return redirect("/");

  return (
    <main className="flex-1 py-8">
      <MaxWidthWrapper className="flex flex-col gap-12">
        <div className="flex">
          <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-4xl font-bold">
            {session.user.activeTeamName}
          </span>
        </div>
        <Suspense fallback={<AppsSectionSkeleton />}>
          <AppsSection />
        </Suspense>
      </MaxWidthWrapper>
    </main>
  );
}

function AppsSectionSkeleton() {
  const numberOfApps = 5;
  return (
    <div className="flex flex-row items-center space-x-10">
      <CustomKodixIcon
        appName={"App Store"}
        appUrl={"/apps"}
        iconPath={"/appIcons/appstore.png"}
      />
      <CustomKodixIcon
        appName={"Settings"}
        appUrl={"/team/settings"}
        iconPath={"/appIcons/settings.png"}
      />
      {Array.from({ length: numberOfApps }).map((_, i) => (
        <Skeleton className="mb-2 h-[80px] w-[80px] rounded-xl" key={i} />
      ))}
    </div>
  );
}

async function AppsSection() {
  const apps = await api.app.getInstalled();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return (
    <div className="flex flex-row items-center space-x-10">
      <CustomKodixIcon
        appName={"App Store"}
        appUrl={"/apps"}
        iconPath={"/appIcons/appstore.png"}
      />
      <CustomKodixIcon
        appName={"Settings"}
        appUrl={"/team/settings"}
        iconPath={"/appIcons/settings.png"}
      />
      {apps?.map((app) => (
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
