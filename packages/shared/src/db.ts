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

export type KodixAppId =
  | typeof todoAppId
  | typeof calendarAppId
  | typeof kodixCareAppId;

export type AppPermissionId = typeof PKodixCare_CanToggleShiftId;

export type AppRoleDefaultId =
  | (typeof todoRoleDefaultIds)[keyof typeof todoRoleDefaultIds]
  | (typeof calendarRoleDefaultIds)[keyof typeof calendarRoleDefaultIds]
  | (typeof kodixCareRoleDefaultIds)[keyof typeof kodixCareRoleDefaultIds];
//-------------------------------  	Apps 	 -------------------------------//

//* Helpers *//
export const appIdToAdminRole_defaultIdMap = {
  [todoAppId]: todoRoleDefaultIds.admin,
  [calendarAppId]: calendarRoleDefaultIds.admin,
  [kodixCareAppId]: kodixCareRoleDefaultIds.admin,
} as const;
