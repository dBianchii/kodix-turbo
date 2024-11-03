import { TRPCError } from "@trpc/server";

import { findTeamsByUserId } from "@kdx/db/team";

import type { TProtectedProcedureContext } from "../../procedures";

export const assertCanUserDeleteAccount = async (
  ctx: TProtectedProcedureContext,
) => {
  const teams = await findTeamsByUserId(ctx.auth.user.id);
  if (!teams[0]) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR", //should never happen
    });
  }

  if (teams.length > 1) {
    return new TRPCError({
      code: "FORBIDDEN",
      message: ctx.t(
        "api.To delete you account you must have only one team left",
      ),
    });
  }

  if (teams[0].UsersToTeams.length > 1) {
    return new TRPCError({
      code: "FORBIDDEN",
      message: ctx.t(
        "api.To delete your account first remove all other users from your team",
      ),
    });
  }
};
