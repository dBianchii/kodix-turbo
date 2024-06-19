"use server";

import { kodixCareAppId } from "@kdx/shared";
import { kodixCareConfigSchema } from "@kdx/validators";

import { protectedAction } from "~/helpers/trpc-server-actions";
import { api } from "~/trpc/server";

export const finishKodixCareOnboardingAction = protectedAction
  .input(kodixCareConfigSchema)
  .mutation(async ({ input }) => {
    await api.app.saveConfig({
      appId: kodixCareAppId,
      config: input,
    });
    await api.app.installApp({
      appId: kodixCareAppId,
    });
  });
