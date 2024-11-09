import { z } from "zod";

import dayjs from "@kdx/dayjs";

//* Partners
export const kdxPartnerId = "p8bmvvk3cy3l";

//-------------------------------  	Apps 	 -------------------------------//
//* Todo *//
export const todoAppId = "7mwag78tv8pa";
export const todoRoleDefaultIds = {
  admin: "01v9cgqz7uuc",
} as const;

//* Calendar *//
export const calendarAppId = "rglo4zodf341";
export const calendarRoleDefaultIds = {
  admin: "6q3jsrycj0pz",
} as const;

//*  KodixCare *//
export const kodixCareAppId = "1z50i9xblo4b";
export const kodixCareRoleDefaultIds = {
  admin: "kiq5p7htma4k",
  patient: "h19p6ny82j9f",
  careGiver: "jl9lfayikjyv",
} as const;

//*   KodixCare permissions -------
export const PKodixCare_CanToggleShiftId = "t3rf70tpu02h";
export const PKodixCare_CanCreateCareTask = "rary75ox9kdi";
export const PKodixCare_CanDeleteCareTask = "9baz2op01y7k";

export type KodixAppId =
  | typeof todoAppId
  | typeof calendarAppId
  | typeof kodixCareAppId;

export type AppPermissionId =
  | typeof PKodixCare_CanToggleShiftId
  | typeof PKodixCare_CanCreateCareTask
  | typeof PKodixCare_CanDeleteCareTask;

export type AppRoleDefaultId =
  | (typeof todoRoleDefaultIds)[keyof typeof todoRoleDefaultIds]
  | (typeof calendarRoleDefaultIds)[keyof typeof calendarRoleDefaultIds]
  | (typeof kodixCareRoleDefaultIds)[keyof typeof kodixCareRoleDefaultIds];

export type AppIdsWithConfig = typeof kodixCareAppId; //? Some apps might not have config implemented
export type AppIdsWithUserAppTeamConfig = typeof kodixCareAppId; //? Some apps might not have userAppTeamConfig implemented
//-------------------------------  	Apps 	 -------------------------------//

//* Helpers *//
export const appIdToAdminRole_defaultIdMap = {
  [todoAppId]: todoRoleDefaultIds.admin,
  [calendarAppId]: calendarRoleDefaultIds.admin,
  [kodixCareAppId]: kodixCareRoleDefaultIds.admin,
} as const;

/**
 * Converts a value to a Date object using the ISO 8601 format.
 * If the value is already a Date object, it is returned as is.
 * If the value is a string, it is parsed using the dayjs library and converted to a Date object.
 * @returns A Date object representing the input value.
 */
export const dateFromISO8601 = z.preprocess(
  (value) => (value instanceof Date ? value : dayjs(value as string).toDate()),
  z.date(),
);

/**
 * @description Schema for validating kodix care config
 */
export const kodixCareConfigSchema = z.object({
  patientName: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[^\d]+$/, {
      message: "Numbers are not allowed in the patient name",
    }),
  clonedCareTasksUntil: dateFromISO8601.optional(),
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
