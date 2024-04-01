"use server";

import { kodixCareAppId } from "@kdx/shared";
import { kodixCareConfigSchema } from "@kdx/validators";

import { action } from "~/helpers/safe-action/safe-action";
import { api } from "~/trpc/server";

export const finishKodixCareOnboardingAction = action(
  kodixCareConfigSchema,
  async (input) => {
    await api.app.saveConfig({
      appId: kodixCareAppId,
      config: input,
    });
    await api.team.installApp({
      appId: kodixCareAppId,
    });
  },
);
