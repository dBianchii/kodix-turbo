import { getTranslations } from "next-intl/server";

import type { KodixAppId } from "@kdx/shared";

import { appIdToName } from "./internal";

export const getAppName = async (appId: KodixAppId) => {
  const t = await getTranslations();
  const name = appIdToName[appId];
  return t(`${name}`);
};
