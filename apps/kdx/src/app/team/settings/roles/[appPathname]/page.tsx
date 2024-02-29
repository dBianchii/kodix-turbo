import { notFound, redirect } from "next/navigation";

import type { KodixAppId } from "@kdx/shared";
import { auth } from "@kdx/auth";
import { getAppName } from "@kdx/shared";

import type { AppPathnames } from "~/helpers/miscelaneous";
import { appIdToPathname, appPathnameToAppId } from "~/helpers/miscelaneous";
import { api } from "~/trpc/server";
import { DataTableUserAppRoles } from "./_components/data-table-user-app-roles";

export default async function RolesForAppPage({
  params,
}: {
  params: { appPathname: string };
}) {
  const appPathname = params.appPathname as AppPathnames;
  if (!Object.values(appIdToPathname).includes(appPathname)) notFound();

  const appId = appPathnameToAppId[appPathname];

  const session = await auth();
  if (!session) redirect("/");

  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <UserAppRolesTable appId={appId} />
    </div>
  );
}

async function UserAppRolesTable({ appId }: { appId: KodixAppId }) {
  const initialUsers = await api.team.appRole.getUsersWithRoles({ appId });
  const allAppRoles = await api.team.appRole.getAll({ appId });

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-lg font-semibold text-muted-foreground">
        Edit {getAppName(appId)} Roles
      </h1>
      <DataTableUserAppRoles
        initialUsers={initialUsers}
        appId={appId}
        allAppRoles={allAppRoles}
      />
    </div>
  );
}
