import { auth } from "@kdx/auth";

import { api } from "~/trpc/server";
import { EditTeamNameCardClient } from "./edit-team-name-card-client";

export async function EditTeamNameCard() {
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
