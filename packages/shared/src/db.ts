//* Partners
export const kdxPartnerId = "bf77d19a-60e3-4585-82d2-90488433116a";

//-------------------------------  	Apps 	 -------------------------------//
//* Todo *//
export const todoAppId = "288a81ff-264c-4983-87ed-e3c8b51bb675" as const;
export const todoAdminRoleDefaultId = "3dd58804-ea58-4d13-863e-c07e7a7fd5be";

//* Calendar *//
export const calendarAppId = "5a231085-4d69-4aab-bc5e-9aaaaea1d773" as const;
export const calendarAdminRoleDefaultId =
  "7e762d33-cc96-4a6e-b3cc-81899e3419da";

//*  KodixCare *//
export const kodixCareAppId = "b68852cc-cc65-42bd-8ed8-12fea20d1d93" as const;
export const kodixCareAdminRoleDefaultId =
  "24482255-a3df-469b-a7a6-043af64ebc09";
export const kodixCarePatientRoleDefaultId =
  "938c92db-58ea-4673-9a21-25718da2de9c";
export const kodixCareCareGiverRoleDefaultId =
  "540f027e-c70b-4047-93d4-2336f7b0734d";
//*   KodixCare permissions -------
export const PKodixCare_CanToggleShiftId =
  "974e44c9-104a-498c-8cbe-ad2c3adb6deb";

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

export const getAppRole_defaultRoleName = (roleId: AllAppRoles_defaults) => {
  //TODO: Maybe store this in memory from db?
  const roleIdToName = {
    [todoAdminRoleDefaultId]: "Admin" as const,
    [calendarAdminRoleDefaultId]: "Admin" as const,
    [kodixCareAdminRoleDefaultId]: "Admin" as const,
    [kodixCarePatientRoleDefaultId]: "Patient" as const,
    [kodixCareCareGiverRoleDefaultId]: "CareGiver" as const,
  };
  return roleIdToName[roleId];
};
