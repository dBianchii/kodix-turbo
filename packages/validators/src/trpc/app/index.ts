import { z } from "zod";

import type { appActivityLogs } from "@kdx/db/schema";
import type { KodixAppId } from "@kdx/shared";
import {
  calendarAppId,
  kodixCareAppId,
  kodixCareConfigSchema,
  kodixCareUserAppTeamConfigSchema,
  todoAppId,
} from "@kdx/shared";

import { ZNanoId } from "../..";

export type AppIdsWithConfig = typeof kodixCareAppId; //? Some apps might not have config implemented
export type AppIdsWithUserAppTeamConfig = typeof kodixCareAppId; //? Some apps might not have userAppTeamConfig implemented

export const ZGetConfigInput = z.object({
  appId: z.custom<AppIdsWithConfig>(),
});
export type TGetConfigInput = z.infer<typeof ZGetConfigInput>;

export const ZGetUserAppTeamConfigInputSchema = z.object({
  appId: z.custom<AppIdsWithUserAppTeamConfig>(),
});
export type TGetUserAppTeamConfigInputSchema = z.infer<
  typeof ZGetUserAppTeamConfigInputSchema
>;

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
  appId: z.custom<KodixAppId>(),
});
export type TUninstallAppInputSchema = z.infer<typeof ZUninstallAppInputSchema>;

export const ZSaveUserAppTeamConfigInputSchema = z.object({
  appId: z.literal(kodixCareAppId),
  config: kodixCareUserAppTeamConfigSchema.partial(), //? Partial because we can just be updating a single field
});
export type TSaveUserAppTeamConfigInputSchema = z.infer<
  typeof ZSaveUserAppTeamConfigInputSchema
>;

export const ZGetAppActivityLogsInputSchema = z.object({
  appId: z.custom<KodixAppId>(),
  tableNames: z
    .array(z.custom<typeof appActivityLogs.$inferSelect.tableName>())
    .min(1),
  rowId: ZNanoId.optional(),
  perPage: z.number().min(1).default(10),
  page: z.number().min(1).default(1),
});
export type TGetAppActivityLogsInputSchema = z.infer<
  typeof ZGetAppActivityLogsInputSchema
>;
