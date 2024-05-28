"use server";

import { revalidatePath } from "next/cache";

import { ZCreateInputSchema } from "@kdx/validators/trpc/team";

import { action } from "~/helpers/safe-action/safe-action";
import { api } from "~/trpc/server";

export const createTeamAction = action(ZCreateInputSchema, async (input) => {
  const team = await api.team.create(input);
  void api.user.switchActiveTeam({ teamId: team.id });
  revalidatePath("/team");
  return team;
});
