"use server";

import { revalidatePath } from "next/cache";

import { kodixCareAppId, kodixCareConfigSchema } from "@kdx/shared";

import { action } from "~/helpers/safe-action/safe-action";
import { trpcCaller } from "~/trpc/server";

export const finishKodixCareOnboardingAction = action
  .schema(kodixCareConfigSchema)
  .action(async ({ parsedInput }) => {
    await trpcCaller.app.saveConfig({
      appId: kodixCareAppId,
      config: parsedInput,
    });
    await trpcCaller.app.installApp({
      appId: kodixCareAppId,
    });
    revalidatePath("/", "layout");
  });
