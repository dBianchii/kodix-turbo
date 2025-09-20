import type { KodixAppId } from "@kodix/shared/db";
import { calendarAppId, kodixCareAppId, todoAppId } from "@kodix/shared/db";

import type { ClientSideT, IsomorficT } from "../..";
import { appIdToName } from "./internal";

export const getAppName = (appId: KodixAppId | undefined, t: ClientSideT) => {
  if (!appId) return "";
  return t(`${appIdToName[appId]}`);
};

export const getAppDescription = (appId: KodixAppId, t: IsomorficT) => {
  const appIdToDescription = {
    [todoAppId]: t("apps.todo.appDescription"),
    [calendarAppId]: t("apps.calendar.appDescription"),
    [kodixCareAppId]: t("apps.kodixCare.appDescription"),
  };
  return appIdToDescription[appId];
};

export const getAppRoleNames = (t: IsomorficT) => {
  const appRoleDefaultIdToName = {
    ADMIN: t("Admin"),
    CAREGIVER: t("Care Giver"),
  };

  return appRoleDefaultIdToName;
};
