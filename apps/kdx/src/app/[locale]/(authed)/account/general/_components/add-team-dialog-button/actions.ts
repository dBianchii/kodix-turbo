"use server";

import { revalidatePath } from "next/cache";

import { ZCreateInputSchema } from "@kdx/validators/trpc/team";

import { action } from "~/helpers/safe-action/safe-action";
import { trpcCaller } from "~/trpc/server";

export const createTeamAction = action
  .schema(ZCreateInputSchema)
  .action(async ({ parsedInput }) => {
    const team = await trpcCaller.team.create(parsedInput);
    void trpcCaller.user.switchActiveTeam({ teamId: team.id });
    revalidatePath("/team");
    return team;
  });
