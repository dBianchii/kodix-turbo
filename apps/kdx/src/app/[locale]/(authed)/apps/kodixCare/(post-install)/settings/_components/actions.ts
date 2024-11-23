"use server";

import { revalidatePath } from "next/cache";

import { ZSaveUserAppTeamConfigInputSchema } from "@kdx/validators/trpc/app";

import { protectedAction } from "~/helpers/safe-action/safe-action";
import { api } from "~/trpc/server";

export const saveUserAppTeamConfig = protectedAction
  .schema(ZSaveUserAppTeamConfigInputSchema)
  .action(async ({ parsedInput }) => {
    await api.app.saveUserAppTeamConfig(parsedInput);
    revalidatePath("/apps/kodixCare/settings");
  });