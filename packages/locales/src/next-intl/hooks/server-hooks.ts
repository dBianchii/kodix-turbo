import type { KodixAppId } from "@kdx/shared";

import type { IsomorficT } from "../..";
import { appIdToName } from "./internal";

export const getAppName = (t: IsomorficT, appId: KodixAppId) => {
  const name = appIdToName[appId];
  return t(`${name}`);
};
