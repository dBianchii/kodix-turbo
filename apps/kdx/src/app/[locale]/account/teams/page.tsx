import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@kdx/auth";
import { getI18n } from "@kdx/locales/server";

import { AddTeamDialogButton } from "~/app/[locale]/account/teams/_components/add-team-dialog-button/add-team-dialog-button";
import SettingsEditCardSkeleton from "~/app/[locale]/team/settings/general/_components/edit-team-name-card-skeleton";
import { EditUserTeamsTable } from "./_components/edit-users-teams-card/edit-users-teams-table";

export default async function Teams() {
  const { user } = await auth();
  if (!user) redirect("/");
  const t = await getI18n();
  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <div className="flex flex-col space-y-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          {t("Teams")}
        </h3>
        <div className="flex flex-row">
          <p className="pr-8 text-sm text-muted-foreground">
            {t(
              "account.Manage the teams you are a part of or create a new one",
            )}
          </p>
          <AddTeamDialogButton className="ml-auto" />
        </div>
      </div>
      <Suspense fallback={<SettingsEditCardSkeleton />}>
        <EditUserTeamsTable />
      </Suspense>
    </div>
  );
}
