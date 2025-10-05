"use server";

import { revalidatePath } from "next/cache";

import { trpcCaller } from "@kdx/api/trpc/react/server";
import { ZSaveUserAppTeamConfigInputSchema } from "@kdx/validators/trpc/app";

import { protectedAction } from "~/helpers/safe-action/safe-action";

export const saveUserAppTeamConfig = protectedAction
  .inputSchema(ZSaveUserAppTeamConfigInputSchema)
  .action(async ({ parsedInput }) => {
    await trpcCaller.app.saveUserAppTeamConfig(parsedInput);
    revalidatePath("/apps/kodixCare/settings");
  });
