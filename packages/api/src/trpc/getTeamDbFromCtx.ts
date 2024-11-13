import type { DrizzleTeam } from "@kdx/db/client";
import { getTeamDb } from "@kdx/db/client";

import type { TProtectedProcedureContext } from "./procedures";

export const getTeamDbFromCtx = (
  ctx: TProtectedProcedureContext,
): DrizzleTeam =>
  getTeamDb({
    ids: [ctx.auth.user.activeTeamId],
  });
