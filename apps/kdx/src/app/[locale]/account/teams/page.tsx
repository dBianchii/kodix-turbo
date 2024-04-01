import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@kdx/auth";

import { AddTeamDialogButton } from "~/app/[locale]/_components/header/add-team-dialog-button";
import SettingsEditCardSkeleton from "~/app/[locale]/team/settings/general/_components/edit-team-name-card-skeleton";
import { EditUserTeamsTable } from "./_components/edit-users-teams-card/edit-users-teams-table";

export default async function Teams() {
  const session = await auth();
  if (!session) redirect("/");

  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <div className="flex flex-col space-y-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          Teams
        </h3>
        <div className="flex flex-row">
          <p className="pr-8 text-sm text-muted-foreground">
            Manage the Teams that you&apos;re a part of, or create a new one.
          </p>
          <AddTeamDialogButton session={session} className="ml-auto" />
        </div>
      </div>
      <Suspense fallback={<SettingsEditCardSkeleton />}>
        <EditUserTeamsTable />
      </Suspense>
    </div>
  );
}
