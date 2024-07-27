"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { redirect } from "@kdx/locales/navigation";

import { action } from "~/helpers/safe-action/safe-action";
import { api } from "~/trpc/server";

export const switchTeamAction = action
  .schema(
    z.object({
      teamId: z.string(),
      redirect: z.string().optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    await api.user.switchActiveTeam(parsedInput);
    revalidatePath("/", "layout"); //IDK what this is doing exactly
    redirect(parsedInput.redirect ?? "/team");
  });
