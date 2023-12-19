import { Suspense } from "react";

import SettingsEditCardSkeleton from "~/app/team/settings/general/_components/edit-team-name-card-skeleton";
import { EditUserTeamsTable } from "./_components/edit-users-teams-card/edit-users-teams-table";

export const dynamic = "force-dynamic"; //TODO: help me
export default function Teams() {
  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <div className="flex flex-col space-y-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          Teams
        </h3>
        <p className="text-muted-foreground text-sm">
          Manage the Teams that you&apos;re a part of, or create a new one.
        </p>
      </div>
      <Suspense fallback={<SettingsEditCardSkeleton />}>
        <EditUserTeamsTable />
      </Suspense>
    </div>
  );
}
