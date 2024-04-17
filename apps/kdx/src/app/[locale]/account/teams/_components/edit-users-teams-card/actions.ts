import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { action } from "~/helpers/safe-action/safe-action";
import { api } from "~/trpc/server";

export const switchTeamAction = action(
  z.object({
    teamId: z.string(),
    redirect: z.string().optional(),
  }),
  async (input) => {
    await api.user.switchActiveTeam(input);
    revalidatePath("/", "layout"); //IDK what this is doing exactly
    redirect(input.redirect ?? "/team");
  },
);
