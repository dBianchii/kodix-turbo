import type { KodixAppId } from "@kdx/shared";

import { appIdToName } from "../internal";
import { getTranslations } from "../server";

export const getAppName = async (appId: KodixAppId) => {
  const t = await getTranslations();
  return appIdToName(t)[appId];
};
