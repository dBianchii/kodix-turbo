import type { TSaveConfigInput } from "@kdx/validators/trpc/app";

import type { TProtectedProcedureContext } from "../../procedures";

interface SaveConfigOptions {
  ctx: TProtectedProcedureContext;
  input: TSaveConfigInput;
}

export const saveConfigHandler = async ({ ctx, input }: SaveConfigOptions) => {
  await ctx.repositories.appRepository.upsertAppTeamConfig({
    appId: input.appId,
    config: input.config,
  });
};
