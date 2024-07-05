import { notFound, redirect } from "next/navigation";

import type { KodixAppId } from "@kdx/shared";
import { auth } from "@kdx/auth";
import { getI18n } from "@kdx/locales/server";
import { getAppName } from "@kdx/locales/server-hooks";

import type { AppPathnames } from "~/helpers/miscelaneous";
import { appIdToPathname, appPathnameToAppId } from "~/helpers/miscelaneous";
import { api, HydrateClient } from "~/trpc/server";
import { DataTableAppPermissions } from "./_components/data-table-app-permissions";
import { DataTableUserAppRoles } from "./_components/data-table-user-app-roles";

export default async function RolesForAppPage({
  params,
}: {
  params: { appPathname: string };
}) {
  const appPathname = params.appPathname as AppPathnames;
  if (!Object.values(appIdToPathname).includes(appPathname)) notFound();

  const appId = appPathnameToAppId[appPathname];

  const { user } = await auth();
  if (!user) redirect("/");

  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <UserAppRolesTable appId={appId} />
    </div>
  );
}

async function UserAppRolesTable({ appId }: { appId: KodixAppId }) {
  void api.team.appRole.getPermissions.prefetch({ appId });
  void api.team.appRole.getUsersWithRoles.prefetch({ appId });
  void api.team.appRole.getAll.prefetch({ appId });
  const t = await getI18n();
  return (
    <HydrateClient>
      <div className="flex flex-col gap-2">
        <h1 className="font-semibold text-muted-foreground">
          {t("Edit name permissions", { name: await getAppName(appId) })}
        </h1>
        <DataTableAppPermissions appId={appId} />
        <h1 className="font-semibold text-muted-foreground">
          {t("Edit name roles", { name: await getAppName(appId) })}
        </h1>
        <DataTableUserAppRoles appId={appId} />
      </div>
    </HydrateClient>
  );
}
