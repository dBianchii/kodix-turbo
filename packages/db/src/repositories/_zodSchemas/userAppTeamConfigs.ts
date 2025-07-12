import { z } from "zod";

import {
  aiStudioAppId,
  aiStudioUserAppTeamConfigSchema,
  chatAppId,
  chatUserAppTeamConfigSchema,
  kodixCareAppId,
  kodixCareUserAppTeamConfigSchema,
} from "@kdx/shared";

export const appIdToUserAppTeamConfigSchema = {
  [kodixCareAppId]: kodixCareUserAppTeamConfigSchema,
  [chatAppId]: chatUserAppTeamConfigSchema,
  [aiStudioAppId]: aiStudioUserAppTeamConfigSchema,
};

export const appIdToUserAppTeamConfigSchemaUpdate = {
  [kodixCareAppId]: kodixCareUserAppTeamConfigSchema.deepPartial(),
  [chatAppId]: chatUserAppTeamConfigSchema.deepPartial(),
  [aiStudioAppId]: aiStudioUserAppTeamConfigSchema.deepPartial(),
};
