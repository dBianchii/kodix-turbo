import type { KodixAppId } from "@kodix/shared/db";

import type { IsomorficT } from "../..";
import { appIdToName } from "./internal";

export const getAppName = (t: IsomorficT, appId: KodixAppId) => {
  const name = appIdToName[appId];
  return t(`${name}`);
};
