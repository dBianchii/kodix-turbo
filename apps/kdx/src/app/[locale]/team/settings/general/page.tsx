import { Suspense } from "react";

import { auth } from "@kdx/auth";
import { redirect } from "@kdx/locales/next-intl/navigation";

import { api } from "~/trpc/server";
import { DeleteTeamCardClient } from "./_components/delete-team-name-card-client";
import { EditTeamNameCardClient } from "./_components/edit-team-name-card-client";
import SettingsEditCardSkeleton from "./_components/edit-team-name-card-skeleton";
import { LeaveTeamCardClient } from "./_components/leave-team-card-client";

export default async function SettingsGeneralPage() {
  const { user } = await auth();
  if (!user) return redirect("/");
  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <Suspense fallback={<SettingsEditCardSkeleton />}>
        <EditTeamNameCard />
      </Suspense>
      <Suspense fallback={<SettingsEditCardSkeleton />}>
        <DeleteTeamCardOrLeaveTeamCard />
      </Suspense>
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
  if (isOwner) return <DeleteTeamCardClient teamName={user.activeTeamName} />;

  return (
    <LeaveTeamCardClient
      teamId={user.activeTeamId}
      teamName={user.activeTeamName}
    />
  );
}
