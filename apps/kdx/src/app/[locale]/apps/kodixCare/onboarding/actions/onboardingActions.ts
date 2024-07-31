"use server";

import { revalidatePath } from "next/cache";

import { kodixCareAppId } from "@kdx/shared";
import { kodixCareConfigSchema } from "@kdx/validators";

import { action } from "~/helpers/safe-action/safe-action";
import { api } from "~/trpc/server";

export const finishKodixCareOnboardingAction = action
  .schema(kodixCareConfigSchema)
  .action(async ({ parsedInput }) => {
    await api.app.saveConfig({
      appId: kodixCareAppId,
      config: parsedInput,
    });
    await api.app.installApp({
      appId: kodixCareAppId,
    });
    // revalidatePath("/", "layout");
  });
