"use server";

import { revalidatePath } from "next/cache";

import { ZSaveUserAppTeamConfigInputSchema } from "@kdx/validators/trpc/app";

import { protectedAction } from "~/helpers/safe-action/safe-action";
import { trpcCaller } from "~/trpc/server";

export const saveUserAppTeamConfig = protectedAction
  .inputSchema(ZSaveUserAppTeamConfigInputSchema)
  .action(async ({ parsedInput }) => {
    await trpcCaller.app.saveUserAppTeamConfig(parsedInput);
    revalidatePath("/apps/kodixCare/settings");
  });
