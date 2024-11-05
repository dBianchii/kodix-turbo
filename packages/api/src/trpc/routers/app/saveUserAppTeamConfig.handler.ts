import type { TSaveUserAppTeamConfigInputSchema } from "@kdx/validators/trpc/app";
import { appRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../procedures";

interface SaveUserAppTeamConfigOptions {
  ctx: TProtectedProcedureContext;
  input: TSaveUserAppTeamConfigInputSchema;
}

export const saveUserAppTeamConfigHandler = async ({
  ctx,
  input,
}: SaveUserAppTeamConfigOptions) => {
  await appRepository.upsertAppTeamConfig({
    appId: input.appId,
    teamId: ctx.auth.user.activeTeamId,
    config: input.config,
  });
};
