import type {
  AppPermissionId,
  AppRoleDefaultId,
  KodixAppId,
} from "@kdx/shared";
import {
  calendarAppId,
  calendarRoleDefaultIds,
  kodixCareAppId,
  kodixCareRoleDefaultIds,
  PKodixCare_CanCreateCareTask,
  PKodixCare_CanToggleShiftId,
  todoAppId,
  todoRoleDefaultIds,
} from "@kdx/shared";

type appRoles_defaultTree = Record<
  KodixAppId,
  {
    appPermissions?: { id: AppPermissionId; editable?: boolean }[];
    appRoleDefaults: {
      id: AppRoleDefaultId;
      AppPermissions: AppPermissionId[];
    }[];
  }
>;
export const appRoles_defaultTree: appRoles_defaultTree = {
  [kodixCareAppId]: {
    appPermissions: [
      {
        id: PKodixCare_CanToggleShiftId,
      },
      {
        id: PKodixCare_CanCreateCareTask,
        editable: false,
      },
    ],
    appRoleDefaults: [
      {
        id: kodixCareRoleDefaultIds.admin,
        AppPermissions: [
          PKodixCare_CanToggleShiftId,
          PKodixCare_CanCreateCareTask,
        ],
      },
      {
        id: kodixCareRoleDefaultIds.careGiver,
        AppPermissions: [
          PKodixCare_CanToggleShiftId,
          PKodixCare_CanCreateCareTask,
        ],
      },
      {
        id: kodixCareRoleDefaultIds.patient,
        AppPermissions: [],
      },
    ],
  },
  [todoAppId]: {
    appRoleDefaults: [
      {
        id: todoRoleDefaultIds.admin,
        AppPermissions: [],
      },
    ],
  },
  [calendarAppId]: {
    appRoleDefaults: [
      {
        id: calendarRoleDefaultIds.admin,
        AppPermissions: [],
      },
    ],
  },
};
