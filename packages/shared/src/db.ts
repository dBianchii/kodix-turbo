//* Partners
export const kdxPartnerId = "p8bmvvk3cy3l";

//-------------------------------  	Apps 	 -------------------------------//
//* Todo *//
export const todoAppId = "7mwag78tv8pa";
export const todoAdminRoleDefaultId = "01v9cgqz7uuc";

//* Calendar *//
export const calendarAppId = "rglo4zodf341";
export const calendarAdminRoleDefaultId = "6q3jsrycj0pz";

//*  KodixCare *//
export const kodixCareAppId = "1z50i9xblo4b";
export const kodixCareAdminRoleDefaultId = "kiq5p7htma4k";
export const kodixCarePatientRoleDefaultId = "h19p6ny82j9f";
export const kodixCareCareGiverRoleDefaultId = "jl9lfayikjyv";

//*   KodixCare permissions -------
export const PKodixCare_CanToggleShiftId = "t3rf70tpu02h";

export type KodixAppId =
  | typeof todoAppId
  | typeof calendarAppId
  | typeof kodixCareAppId;

export type AppPermissionIds = typeof PKodixCare_CanToggleShiftId;
//-------------------------------  	Apps 	 -------------------------------//

//* Helpers *//
export const appIdToAdminRole_defaultIdMap = {
  [todoAppId]: todoAdminRoleDefaultId,
  [calendarAppId]: calendarAdminRoleDefaultId,
  [kodixCareAppId]: kodixCareAdminRoleDefaultId,
} as const;
