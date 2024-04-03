import type { KodixAppId } from "@kdx/shared";

import { appIdToName } from "./internal";
import { getI18n } from "./server";

export const getAppName = async (appId: KodixAppId) => {
  const t = await getI18n();
  return appIdToName(t)[appId];
};
