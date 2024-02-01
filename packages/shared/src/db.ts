//* Partners
export const kdxPartnerId = "clh9tiqsj000835711pg3sskn";

//**  	Apps 		 *//
//*     Todo app
export const todoAppId = "clj2117860007skypdpzj0k1u" as const;
export const todoAdminRoleId = "clqfpp3he000008l4hyyg7tdl";

//*     Calendar app
export const calendarAppId = "clohjphbm000008ju6oywfy4i" as const;
export const calendarAdminRoleId = "clqfpp77z000108l4c1je0e5z";

//*     KodixCare app
export const kodixCareAppId = "clj2117860009skyp5e613fih" as const;
export const kodixCareAdminRoleId = "clq5yvcvu000008ia3yppfnou";
export const kodixCarePatientRoleId = "clq5yvhuz000108ia55qk06ts";
export const kodixCareCareGiverRoleId = "clq5yvqdg000208ia3861eyow";

export type KodixAppId =
  | typeof todoAppId
  | typeof calendarAppId
  | typeof kodixCareAppId;

export type AllAppRoles =
  | typeof kodixCareAdminRoleId
  | typeof kodixCarePatientRoleId
  | typeof kodixCareCareGiverRoleId
  | typeof todoAdminRoleId
  | typeof calendarAdminRoleId;

//* Helpers *//
export const appIdToAdminIdMap = {
  [todoAppId]: todoAdminRoleId,
  [calendarAppId]: calendarAdminRoleId,
  [kodixCareAppId]: kodixCareAdminRoleId,
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

export const getRoleName = (roleId: AllAppRoles) => {
  const roleIdToName = {
    [todoAdminRoleId]: "Admin" as const,
    [calendarAdminRoleId]: "Admin" as const,
    [kodixCareAdminRoleId]: "Admin" as const,
    [kodixCarePatientRoleId]: "Patient" as const,
    [kodixCareCareGiverRoleId]: "CareGiver" as const,
  };
  return roleIdToName[roleId];
};
