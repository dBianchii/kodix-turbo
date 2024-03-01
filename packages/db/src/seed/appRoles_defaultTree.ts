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

type AppRole_defaultTree = Record<
  string,
  {
    appPermissions?: { id: string; name: string }[];
    appRole_defaults: {
      id: string;
      name: string;
      minUsers: number;
      maxUsers: number;
      AppPermissions: string[];
    }[];
  }
>;

export const appRoles_defaultTree: AppRole_defaultTree = {
  [kodixCareAppId]: {
    appPermissions: [
      {
        id: PKodixCare_CanToggleShiftId,
        name: "CanToggleShift",
      },
    ],
    appRole_defaults: [
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
    appRole_defaults: [
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
    appRole_defaults: [
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
