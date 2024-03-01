//* Partners
export const kdxPartnerId = "clh9tiqsj000835711pg3sskn";

//-------------------------------  	Apps 	 -------------------------------//
//* Todo *//
export const todoAppId = "clj2117860007skypdpzj0k1u" as const;
export const todoAdminRoleDefaultId = "clqfpp3he000008l4hyyg7tdl";

//* Calendar *//
export const calendarAppId = "clohjphbm000008ju6oywfy4i" as const;
export const calendarAdminRoleDefaultId = "clqfpp77z000108l4c1je0e5z";

//*  KodixCare *//
export const kodixCareAppId = "clj2117860009skyp5e613fih" as const;
export const kodixCareAdminRoleDefaultId = "clq5yvcvu000008ia3yppfnou";
export const kodixCarePatientRoleDefaultId = "clq5yvhuz000108ia55qk06ts";
export const kodixCareCareGiverRoleDefaultId = "clq5yvqdg000208ia3861eyow";
//*   KodixCare permissions -------
export const PKodixCare_CanToggleShiftId = "clsklq5vz000008li0ac3co6w";

export type KodixAppId =
  | typeof todoAppId
  | typeof calendarAppId
  | typeof kodixCareAppId;

export type AllAppRoles_defaults =
  | typeof kodixCareAdminRoleDefaultId
  | typeof kodixCarePatientRoleDefaultId
  | typeof kodixCareCareGiverRoleDefaultId
  | typeof todoAdminRoleDefaultId
  | typeof calendarAdminRoleDefaultId;

export type AppPermissionIds = typeof PKodixCare_CanToggleShiftId;
//-------------------------------  	Apps 	 -------------------------------//

//* Helpers *//
export const appIdToAdminRole_defaultIdMap = {
  [todoAppId]: todoAdminRoleDefaultId,
  [calendarAppId]: calendarAdminRoleDefaultId,
  [kodixCareAppId]: kodixCareAdminRoleDefaultId,
} as const;

export const getAppName = (appId: KodixAppId) => {
  const appIdToName = {
    [kodixCareAppId]: "Kodix Care" as const,
    [calendarAppId]: "Calendar" as const,
    [todoAppId]: "Todo" as const,
  };
  return appIdToName[appId];
};

export const getAppDescription = (appId: KodixAppId) => {
  const appIdToDescription = {
    [kodixCareAppId]: "Kodix Care is a health care app." as const,
    [calendarAppId]: "Calendar is a calendar app." as const,
    [todoAppId]: "Todo is a todo app." as const,
  };
  return appIdToDescription[appId];
};
