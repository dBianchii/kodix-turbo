import { TsRestResponseError } from "@ts-rest/core";
import { createLambdaHandler } from "@ts-rest/serverless/aws";
import { NextHandlerOptions, tsr } from "@ts-rest/serverless/next";

import { auth } from "@kdx/auth";
import { db } from "@kdx/db/client";
import { appIdToAppTeamConfigSchema } from "@kdx/validators";

import { contract } from "../../contract";

export const tsappRouter = tsr.router(contract.app, {
  getConfig: async ({ query }) => {
    const session = await auth();

    if (!session)
      throw new TsRestResponseError(contract.app, {
        status: 401,
        body: { message: "Unauthorized" },
      });

    const result = await db.query.appTeamConfigs.findFirst({
      where: (appteamConfig, { eq, and }) =>
        and(
          eq(appteamConfig.appId, query.appId),
          eq(appteamConfig.teamId, session.user.activeTeamId),
        ),
      columns: {
        config: true,
      },
    });

    if (!result)
      throw new TsRestResponseError(contract.app, {
        status: 404,
        body: undefined,
      });

    const schema = appIdToAppTeamConfigSchema[query.appId];

    return {
      status: 200,
      body: schema.parse(result.config),
    };
  },
});
