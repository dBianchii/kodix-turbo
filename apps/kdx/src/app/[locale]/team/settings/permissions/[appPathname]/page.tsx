import { notFound } from "next/navigation";

import type { KodixAppId } from "@kdx/shared";
import { auth } from "@kdx/auth";
import { redirect } from "@kdx/locales/navigation";
import { getTranslations } from "@kdx/locales/server";
import { getAppName } from "@kdx/locales/server-hooks";

import type { AppPathnames } from "~/helpers/miscelaneous";
import { appIdToPathname, appPathnameToAppId } from "~/helpers/miscelaneous";
import { api } from "~/trpc/server";
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
  const initialPermissions = await api.team.appRole.getPermissions({ appId });
  const initialUsers = await api.team.appRole.getUsersWithRoles({ appId });
  const allAppRoles = await api.team.appRole.getAll({ appId });
  const t = await getTranslations();
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-semibold text-muted-foreground">
          {t("Define the role of each user")}
        </h1>
        <DataTableAppPermissions
          initialPermissions={initialPermissions}
          appId={appId}
          allAppRoles={allAppRoles}
        />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-semibold text-muted-foreground">
          {t("Edit name roles", { name: await getAppName(appId) })}
        </h1>
        <DataTableUserAppRoles
          initialUsers={initialUsers}
          appId={appId}
          allAppRoles={allAppRoles}
        />
      </div>
    </div>
  );
}
