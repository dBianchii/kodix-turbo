import { z } from "zod";

import {
  chatAppId,
  chatUserAppTeamConfigSchema,
  kodixCareAppId,
  kodixCareUserAppTeamConfigSchema,
} from "@kdx/shared";

export const appIdToUserAppTeamConfigSchema = {
  [kodixCareAppId]: kodixCareUserAppTeamConfigSchema,
  [chatAppId]: chatUserAppTeamConfigSchema,
};

export const appIdToUserAppTeamConfigSchemaUpdate = {
  [kodixCareAppId]: kodixCareUserAppTeamConfigSchema.deepPartial(),
  [chatAppId]: chatUserAppTeamConfigSchema.deepPartial(),
};
