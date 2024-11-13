import type { TSaveConfigInput } from "@kdx/validators/trpc/app";
import { appRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../procedures";
import { getTeamDbFromCtx } from "../../getTeamDbFromCtx";

interface SaveConfigOptions {
  ctx: TProtectedProcedureContext;
  input: TSaveConfigInput;
}

export const saveConfigHandler = async ({ ctx, input }: SaveConfigOptions) => {
  const teamDb = getTeamDbFromCtx(ctx);

  await appRepository.upsertAppTeamConfig(
    {
      appId: input.appId,
      config: input.config,
    },
    teamDb,
  );
};
