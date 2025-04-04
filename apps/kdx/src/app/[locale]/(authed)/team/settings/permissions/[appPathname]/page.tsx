import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import type { KodixAppId } from "@kdx/shared";
import { auth } from "@kdx/auth";
import { getAppName } from "@kdx/locales/next-intl/server-hooks";

import type { AppPathnames } from "~/helpers/miscelaneous";
import { appIdToPathname, appPathnameToAppId } from "~/helpers/miscelaneous";
import { redirect } from "~/i18n/routing";
import { trpc } from "~/trpc/server";
import { DataTableUserAppRoles } from "./_components/data-table-user-app-roles";

export default async function RolesForAppPage(props: {
  params: Promise<{ appPathname: string }>;
}) {
  const params = await props.params;
  const appPathname = params.appPathname as AppPathnames;
  if (!Object.values(appIdToPathname).includes(appPathname)) notFound();

  const appId = appPathnameToAppId[appPathname];

  const { user } = await auth();
  if (!user) redirect({ href: "/", locale: await getLocale() });

  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <UserAppRolesTable appId={appId} />
    </div>
  );
}

async function UserAppRolesTable({ appId }: { appId: KodixAppId }) {
  const initialUsers = await trpc.team.appRole.getUsersWithRoles({ appId });
  const t = await getTranslations();
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-muted-foreground font-semibold">
          {t("Edit name roles", { name: getAppName(t, appId) })}
        </h1>
        <DataTableUserAppRoles initialUsers={initialUsers} appId={appId} />
      </div>
    </div>
  );
}
