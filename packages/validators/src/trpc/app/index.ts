import { z } from "zod";

import { calendarAppId, kodixCareAppId, todoAppId } from "@kdx/shared";

import { kodixCareConfigSchema, ZNanoId } from "../..";

type AppIdsWithConfig = typeof kodixCareAppId; //? Some apps might not have config implemented

export const ZGetConfigInput = z.object({
  appId: z.custom<AppIdsWithConfig>(),
});
export type TGetConfigInput = z.infer<typeof ZGetConfigInput>;

export const ZInstallAppInputSchema = z.object({
  appId: z.union([
    z.literal(todoAppId),
    z.literal(calendarAppId),
    z.literal(kodixCareAppId),
  ]),
});
export type TInstallAppInputSchema = z.infer<typeof ZInstallAppInputSchema>;

export const ZSaveConfigInput = z.object({
  appId: z.literal(kodixCareAppId),
  config: kodixCareConfigSchema.partial(), //? Partial because we can just be updating a single field
}); //TODO: make dynamic based on app
export type TSaveConfigInput = z.infer<typeof ZSaveConfigInput>;

export const ZUninstallAppInputSchema = z.object({
  appId: ZNanoId,
});
export type TUninstallAppInputSchema = z.infer<typeof ZUninstallAppInputSchema>;
