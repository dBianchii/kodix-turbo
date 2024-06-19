"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { protectedAction } from "~/helpers/trpc-server-actions";
import { api } from "~/trpc/server";

export const switchTeamAction = protectedAction
  .input(
    z.object({
      teamId: z.string(),
      redirect: z.string().optional(),
    }),
  )
  .mutation(async ({ input }) => {
    await api.user.switchActiveTeam(input);
    revalidatePath("/", "layout"); //IDK what this is doing exactly
    redirect(input.redirect ?? "/team");
  });
