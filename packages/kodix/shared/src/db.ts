import dayjs from "@kodix/dayjs";
import z from "zod";

//* Partners
export const kdxPartnerId = "p8bmvvk3cy3l";

//-------------------------------  	Apps 	 -------------------------------//
export const commonRolesForAllApps = ["ADMIN"] as const;

//* Todo *//
export const todoAppId = "7mwag78tv8pa";

//* Calendar *//
export const calendarAppId = "rglo4zodf341";

//*  KodixCare *//
export const kodixCareAppId = "1z50i9xblo4b";

export const appIdToRoles = {
  [kodixCareAppId]: [...commonRolesForAllApps, "CAREGIVER"] as const,
  [calendarAppId]: [...commonRolesForAllApps] as const,
  [todoAppId]: [...commonRolesForAllApps] as const,
};
export const allRoles = [...new Set(Object.values(appIdToRoles).flat())];

export type AppRole<T extends KodixAppId = keyof typeof appIdToRoles> =
  (typeof appIdToRoles)[T][number];

export type KodixAppId =
  | typeof todoAppId
  | typeof calendarAppId
  | typeof kodixCareAppId;

export type AppIdsWithConfig = typeof kodixCareAppId; //? Some apps might not have config implemented
export type AppIdsWithUserAppTeamConfig = typeof kodixCareAppId; //? Some apps might not have userAppTeamConfig implemented
//-------------------------------  	Apps 	 -------------------------------//

//* Helpers *//

/**
 * Converts a value to a Date object using the ISO 8601 format.
 * If the value is already a Date object, it is returned as is.
 * If the value is a string, it is parsed using the dayjs library and converted to a Date object.
 * @returns A Date object representing the input value.
 */
const dateFromISO8601 = z.preprocess(
  (value) => (value instanceof Date ? value : dayjs(value as string).toDate()),
  z.date()
);

/**
 * @description Schema for validating kodix care config
 */
export const kodixCareConfigSchema = z.object({
  clonedCareTasksUntil: dateFromISO8601.optional(),
  patientName: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[^\d]+$/, {
      message: "Numbers are not allowed in the patient name",
    }),
});

export const kodixCareUserAppTeamConfigSchema = z.object({
  sendNotificationsForDelayedTasks: z.boolean().optional(),
});

//TODO: Maybe move this getAppTeamConfigSchema elsewhere
export const appIdToAppTeamConfigSchema = {
  [kodixCareAppId]: kodixCareConfigSchema,
};

//TODO: Maybe move this getAppTeamConfigSchema elsewhere
export const appIdToUserAppTeamConfigSchema = {
  [kodixCareAppId]: kodixCareUserAppTeamConfigSchema,
};
