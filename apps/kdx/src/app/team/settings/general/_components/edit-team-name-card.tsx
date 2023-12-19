import { auth } from "@kdx/auth";

import { EditTeamNameCardClient } from "./edit-team-name-card-client";

export async function EditTeamNameCard() {
  const session = await auth();
  if (!session) return null;

  return (
    <EditTeamNameCardClient
      teamId={session.user.activeTeamId}
      teamName={session.user.activeTeamName}
    />
  );
}
