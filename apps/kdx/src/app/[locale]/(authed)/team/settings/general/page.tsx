import { Suspense } from "react";

import { auth } from "@kdx/auth";
import { redirect } from "@kdx/locales/next-intl/navigation";
import { getTranslations } from "@kdx/locales/next-intl/server";

import { api } from "~/trpc/server";
import { DeleteTeamCardClient } from "./_components/delete-team-card-client";
import { EditTeamNameCardClient } from "./_components/edit-team-name-card-client";
import SettingsEditCardSkeleton from "./_components/edit-team-name-card-skeleton";
import { LeaveTeamCardClient } from "./_components/leave-team-card-client";

export default async function SettingsGeneralPage() {
  const { user } = await auth();
  if (!user) redirect("/");
  const t = await getTranslations();
  if (!user) return redirect("/");
  return (
    <div className="mt-8 space-y-6 md:mt-0">
      <div>
        <h2 className="text-center text-2xl font-bold md:text-left">
          {t("General")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t(
            "settings.Change the name of your team and manage your participation",
          )}
        </p>
      </div>
      <div className="space-y-4">
        <Suspense fallback={<SettingsEditCardSkeleton />}>
          <EditTeamNameCard />
        </Suspense>
        <Suspense fallback={<SettingsEditCardSkeleton />}>
          <DeleteTeamCardOrLeaveTeamCard />
        </Suspense>
      </div>
    </div>
  );
}

async function EditTeamNameCard() {
  const { user } = await auth();
  if (!user) return null;
  const team = await api.team.getActiveTeam();
  const canEdit = team.ownerId === user.id;

  return (
    <EditTeamNameCardClient
      canEdit={canEdit}
      teamId={user.activeTeamId}
      teamName={user.activeTeamName}
    />
  );
}

async function DeleteTeamCardOrLeaveTeamCard() {
  const { user } = await auth();
  if (!user) return null;
  const team = await api.team.getActiveTeam();
  const isOwner = team.ownerId === user.id;
  if (isOwner) return <DeleteTeamCardClient user={user} />;

  return (
    <LeaveTeamCardClient
      teamId={user.activeTeamId}
      teamName={user.activeTeamName}
    />
  );
}
