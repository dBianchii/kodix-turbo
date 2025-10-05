"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import z from "zod";

import { trpcCaller } from "@kdx/api/trpc/react/server";

import { action } from "~/helpers/safe-action/safe-action";
import { redirect } from "~/i18n/routing";

export const switchTeamAction = action
  .inputSchema(
    z.object({
      redirect: z.string().optional(),
      teamId: z.string(),
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
