import type { KodixAppId } from "@kdx/shared";
import {
  calendarAppId,
  chatAppId,
  kodixCareAppId,
  todoAppId,
} from "@kdx/shared";

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
    [chatAppId]: t("apps.chat.appDescription"),
  };
  return appIdToDescription[appId];
};

export const getAppRoleNames = (t: IsomorficT) => {
  const appRoleDefaultIdToName = {
    ["ADMIN"]: t("Admin"),
    ["CAREGIVER"]: t("Care Giver"),
  };

  return appRoleDefaultIdToName;
};
