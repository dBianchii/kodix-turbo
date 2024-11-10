import type { TUpdateInputSchema } from "@kdx/validators/trpc/team";
import { db } from "@kdx/db/client";
import { teamRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../procedures";

interface CreateHandler {
  ctx: TProtectedProcedureContext;
  input: TUpdateInputSchema;
}

export const updateHandler = async ({ input }: CreateHandler) => {
  const team = await teamRepository.updateTeamById(db, {
    id: input.teamId,
    input: {
      name: input.teamName,
    },
  });

  return team;
};
