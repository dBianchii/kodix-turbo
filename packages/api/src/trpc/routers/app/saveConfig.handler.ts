import type { TSaveConfigInput } from "@kdx/validators/trpc/app";
import { appRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../procedures";

interface SaveConfigOptions {
  ctx: TProtectedProcedureContext;
  input: TSaveConfigInput;
}

export const saveConfigHandler = async ({ ctx, input }: SaveConfigOptions) => {
  await appRepository.upsertAppTeamConfig({
    appId: input.appId,
    teamId: ctx.auth.user.activeTeamId,
    config: input.config,
  });
};
