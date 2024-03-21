import {
  calendarAdminRoleDefaultId,
  calendarAppId,
  kodixCareAdminRoleDefaultId,
  kodixCareAppId,
  kodixCareCareGiverRoleDefaultId,
  kodixCarePatientRoleDefaultId,
  PKodixCare_CanToggleShiftId,
  todoAdminRoleDefaultId,
  todoAppId,
} from "@kdx/shared";

type appRoles_defaultTree = Record<
  string,
  {
    appPermissions?: { id: string; name: string }[];
    appRoleDefaults: {
      id: string;
      name: string;
      minUsers: number;
      maxUsers: number;
      AppPermissions: string[];
    }[];
  }
>;
export const appRoles_defaultTree: appRoles_defaultTree = {
  [kodixCareAppId]: {
    appPermissions: [
      {
        id: PKodixCare_CanToggleShiftId,
        name: "CanToggleShift",
      },
    ],
    appRoleDefaults: [
      {
        id: kodixCareAdminRoleDefaultId,
        name: "Admin",
        minUsers: 1,
        maxUsers: 0,
        AppPermissions: [PKodixCare_CanToggleShiftId],
      },
      {
        id: kodixCareCareGiverRoleDefaultId,
        name: "Care Giver",
        minUsers: 1,
        maxUsers: 0,
        AppPermissions: [PKodixCare_CanToggleShiftId],
      },
      {
        id: kodixCarePatientRoleDefaultId,
        name: "Patient",
        minUsers: 1,
        maxUsers: 0,
        AppPermissions: [],
      },
    ],
  },
  [todoAppId]: {
    appRoleDefaults: [
      {
        id: todoAdminRoleDefaultId,
        name: "Admin",
        minUsers: 1,
        maxUsers: 0,
        AppPermissions: [],
      },
    ],
  },
  [calendarAppId]: {
    appRoleDefaults: [
      {
        id: calendarAdminRoleDefaultId,
        name: "Admin",
        minUsers: 1,
        maxUsers: 0,
        AppPermissions: [],
      },
    ],
  },
};
