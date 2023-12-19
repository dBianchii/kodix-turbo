import { redirect } from "next/navigation";

import type { KodixApp as KodixAppType } from "@kdx/db";
import { auth } from "@kdx/auth";

import { CustomKodixIcon, IconKodixApp } from "~/app/_components/app/kodix-app";
import MaxWidthWrapper from "~/app/_components/max-width-wrapper";
import { api } from "~/trpc/server";

export default async function Team() {
  const session = await auth();
  if (!session) return redirect("/");
  const apps = await api.app.getInstalled.query();

  return (
    <main className="flex-1 py-8">
      <MaxWidthWrapper className="flex flex-col gap-12">
        <div className="flex">
          <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-4xl font-bold">
            {session.user.activeTeamName}
          </span>
        </div>
        <div className="flex flex-row items-center space-x-10">
          <CustomKodixIcon
            appName={"Marketplace"}
            appUrl={"/marketplace"}
            iconPath={"/appIcons/marketplace.png"}
          />
          <CustomKodixIcon
            appName={"Settings"}
            appUrl={"/team/settings"}
            iconPath={"/appIcons/settings.png"}
          />
          {apps?.map((app) => (
            <IconKodixApp
              key={app.id}
              appName={app.name as KodixAppType["name"]}
              appUrl={app.url as KodixAppType["url"]}
            />
          ))}
        </div>
      </MaxWidthWrapper>
    </main>
  );
}
