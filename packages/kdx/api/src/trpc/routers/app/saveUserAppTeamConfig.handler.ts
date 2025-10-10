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
  await appRepository.upsertUserAppTeamConfigs({
    appId: input.appId,
    input: input.config,
    teamId: ctx.auth.user.activeTeamId,
    userId: ctx.auth.user.id,
  });
};
