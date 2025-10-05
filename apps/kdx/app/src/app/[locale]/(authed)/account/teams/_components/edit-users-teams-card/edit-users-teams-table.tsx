import { trpcCaller } from "@kdx/api/trpc/react/server";
import { auth } from "@kdx/auth";

import EditUserTeamsTableClient from "./edit-user-teams-table-client";

export async function EditUserTeamsTable() {
  const teams = await trpcCaller.team.getAll();

  const { user } = await auth();
  if (!user) return null;

  return <EditUserTeamsTableClient teams={teams} user={user} />;
}
