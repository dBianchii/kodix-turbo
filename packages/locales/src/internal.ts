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

import type { useI18n } from "./client";

export const appIdToName = (t: ReturnType<typeof useI18n>) => ({
  [kodixCareAppId]: t("Kodix Care"),
  [calendarAppId]: t("Calendar"),
  [todoAppId]: t("Todo"),
});

export const appRoleDefaultIdToName = (t: ReturnType<typeof useI18n>) => ({
  [todoAdminRoleDefaultId]: t("Admin"),

  [calendarAdminRoleDefaultId]: t("Admin"),

  [kodixCareAdminRoleDefaultId]: t("Admin"),
  [kodixCarePatientRoleDefaultId]: t("Patient"),
  [kodixCareCareGiverRoleDefaultId]: t("Care Giver"),
});

export const appPermissionIdToName = (t: ReturnType<typeof useI18n>) => ({
  [PKodixCare_CanToggleShiftId]: t("Can toggle shift"),
});
