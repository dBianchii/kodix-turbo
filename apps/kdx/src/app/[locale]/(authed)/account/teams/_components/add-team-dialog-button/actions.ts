"use server";

import { revalidatePath } from "next/cache";

import { ZCreateInputSchema } from "@kdx/validators/trpc/team";

import { action } from "~/helpers/safe-action/safe-action";
import { trpc } from "~/trpc/server";

export const createTeamAction = action
  .schema(ZCreateInputSchema)
  .action(async ({ parsedInput }) => {
    const team = await trpc.team.create(parsedInput);
    void trpc.user.switchActiveTeam({ teamId: team.id });
    revalidatePath("/team");
    return team;
  });
