import { z } from "zod";

import { kodixCareAppId } from "@kdx/shared";

import { kodixCareConfigSchema } from "../..";

type AppIdsWithConfig = typeof kodixCareAppId; //? Some apps might not have config implemented

export const ZGetConfigInput = z.object({
  appId: z.custom<AppIdsWithConfig>(),
});
export type TGetConfigInput = z.infer<typeof ZGetConfigInput>;

export const ZSaveConfigInput = z.object({
  appId: z.literal(kodixCareAppId),
  config: kodixCareConfigSchema,
}); //TODO: make dynamic based on app
export type TSaveConfigInput = z.infer<typeof ZSaveConfigInput>;
