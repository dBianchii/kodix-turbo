import { auth } from "@kdx/auth";

import { EditTeamNameCardClient } from "./edit-team-name-card-client";

export async function EditTeamNameCard() {
  const { user } = await auth();
  if (!session) return null;

  return (
    <EditTeamNameCardClient
      teamId={user.activeTeamId}
      teamName={user.activeTeamName}
    />
  );
}
