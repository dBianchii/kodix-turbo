"use server";

import { revalidatePath } from "next/cache";

import { ZCreateInputSchema } from "@kdx/validators/trpc/team";

import { protectedAction } from "~/helpers/trpc-server-actions";
import { api } from "~/trpc/server";

export const createTeamAction = protectedAction
  .input(ZCreateInputSchema)
  .mutation(async ({ input }) => {
    const team = await api.team.create(input);
    void api.user.switchActiveTeam({ teamId: team.id });
    revalidatePath("/team");
    return team;
  });
