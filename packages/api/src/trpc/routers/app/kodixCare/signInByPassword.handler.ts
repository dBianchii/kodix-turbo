import { TRPCError } from "@trpc/server";

import type { TSignInByPasswordInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import { validateUserEmailAndPassword } from "@kdx/auth";
import { createDbSessionAndCookie } from "@kdx/auth/utils";
import { and, eq } from "@kdx/db";
import { db } from "@kdx/db/client";
import { userRepository } from "@kdx/db/repositories";
import { appsToTeams, teams, usersToTeams } from "@kdx/db/schema";
import { kodixCareAppId } from "@kdx/shared";

import type { TPublicProcedureContext } from "../../../procedures";

interface SignInByPasswordOptions {
  ctx: TPublicProcedureContext;
  input: TSignInByPasswordInputSchema;
}

export const signInByPasswordHandler = async ({
  input,
}: SignInByPasswordOptions) => {
  const { id: userId, activeTeamId } = await validateUserEmailAndPassword({
    email: input.email,
    password: input.password,
  });

  const _teams = await db
    .select({
      id: teams.id,
    })
    .from(teams)
    .where(
      and(
        eq(usersToTeams.userId, userId),
        eq(appsToTeams.appId, kodixCareAppId),
      ),
    )
    .innerJoin(appsToTeams, eq(appsToTeams.teamId, teams.id))
    .innerJoin(usersToTeams, eq(usersToTeams.teamId, teams.id));

  if (!_teams.length)
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "Você não tem o Kodix Care liberado para uso. Entre pelo website e solicite o acesso",
    });

  if (!_teams.some((team) => team.id === activeTeamId)) {
    //If none of the KodixCare teams are the active team, we need to switch the active team
    await userRepository.moveUserToTeam(db, {
      userId,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      newTeamId: _teams[0]!.id,
    });
  }

  const sessionId = await createDbSessionAndCookie({ userId });
  return sessionId;
};
