import { auth } from "@kdx/auth";

import { trpc } from "~/trpc/server";
import EditUserTeamsTableClient from "./edit-user-teams-table-client";

export async function EditUserTeamsTable() {
  const teams = await trpc.team.getAll();

  const { user } = await auth();
  if (!user) return null;

  return <EditUserTeamsTableClient teams={teams} user={user} />;
}
