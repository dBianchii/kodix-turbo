import type { KodixAppId } from "@kdx/shared";

import { getTranslations } from "../server";
import { appIdToName } from "./internal";

export const getAppName = async (appId: KodixAppId) => {
  const t = await getTranslations();
  const name = appIdToName[appId];
  return t(`${name}`);
};
