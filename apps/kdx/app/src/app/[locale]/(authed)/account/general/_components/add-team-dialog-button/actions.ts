"use server";

import { revalidatePath } from "next/cache";

import { trpcCaller } from "@kdx/api/trpc/react/server";
import { ZCreateInputSchema } from "@kdx/validators/trpc/team";

import { action } from "~/helpers/safe-action/safe-action";

export const createTeamAction = action
  .inputSchema(ZCreateInputSchema)
  .action(async ({ parsedInput }) => {
    const team = await trpcCaller.team.create(parsedInput);
    void trpcCaller.user.switchActiveTeam({ teamId: team.id });
    revalidatePath("/team");
    return team;
  });
