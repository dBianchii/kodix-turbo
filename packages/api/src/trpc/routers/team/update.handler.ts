import type { TUpdateInputSchema } from "@kdx/validators/trpc/team";

import type { TProtectedProcedureContext } from "../../procedures";

interface UpdateHandlerOptions {
  ctx: TProtectedProcedureContext;
  input: TUpdateInputSchema;
}

export const updateHandler = async ({ input, ctx }: UpdateHandlerOptions) => {
  const { teamRepository } = ctx.repositories;
  const team = await teamRepository.updateTeamById({
    id: input.teamId,
    input: {
      name: input.teamName,
    },
  });

  return team;
};
