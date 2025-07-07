"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import z from "zod/v4";

import { action } from "~/helpers/safe-action/safe-action";
import { redirect } from "~/i18n/routing";
import { trpcCaller } from "~/trpc/server";

export const switchTeamAction = action
  .inputSchema(
    z.object({
      teamId: z.string(),
      redirect: z.string().optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    await trpcCaller.user.switchActiveTeam(parsedInput);
    revalidatePath("/", "layout"); //IDK what this is doing exactly
    redirect({
      href: parsedInput.redirect ?? "/team",
      locale: await getLocale(),
    });
  });
