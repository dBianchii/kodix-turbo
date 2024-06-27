import { auth } from "@kdx/auth";

import { api } from "~/trpc/server";
import EditUserTeamsTableClient from "./edit-user-teams-table-client";

export async function EditUserTeamsTable() {
  const teams = await api.team.getAllForLoggedUser();

  const { user } = await auth();
  if (!session) return null;

  return <EditUserTeamsTableClient teams={teams} user={user} />;
}
