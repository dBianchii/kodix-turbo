"use server";

import { revalidatePath } from "next/cache";

import { kodixCareAppId, kodixCareConfigSchema } from "@kdx/shared";

import { action } from "~/helpers/safe-action/safe-action";
import { trpc } from "~/trpc/server";

export const finishKodixCareOnboardingAction = action
  .schema(kodixCareConfigSchema)
  .action(async ({ parsedInput }) => {
    await trpc.app.saveConfig({
      appId: kodixCareAppId,
      config: parsedInput,
    });
    await trpc.app.installApp({
      appId: kodixCareAppId,
    });
    revalidatePath("/", "layout");
  });
