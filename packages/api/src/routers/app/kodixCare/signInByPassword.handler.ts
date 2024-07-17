import { TRPCError } from "@trpc/server";

import type { TSignInByPasswordInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import { createDbSessionAndCookie } from "@kdx/auth/utils";
import { kodixCareAppId } from "@kdx/shared";

import type { TPublicProcedureContext } from "../../../procedures";
import {
  switchActiveTeamForUser,
  validateUserEmailAndPassword,
} from "../../user/utils";
import { getUserTeamsWithAppInstalled } from "./utils";

interface SignInByPasswordOptions {
  ctx: TPublicProcedureContext;
  input: TSignInByPasswordInputSchema;
}

export const signInByPasswordHandler = async ({
  ctx,
  input,
}: SignInByPasswordOptions) => {
  const { id: userId, activeTeamId } = await validateUserEmailAndPassword({
    db: ctx.db,
    email: input.email,
    password: input.password,
  });

  const teams = await getUserTeamsWithAppInstalled({
    userId,
    appId: kodixCareAppId,
    db: ctx.db,
  });
  if (!teams.length)
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "Você não tem o Kodix Care liberado para uso. Entre pelo website e solicite o acesso",
    });

  if (!teams.some((team) => team.id === activeTeamId)) {
    //If none of the KodixCare teams are the active team, we need to switch the active team
    await switchActiveTeamForUser({
      db: ctx.db,
      userId,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      teamId: teams[0]!.id,
    });
  }

  const sessionId = await createDbSessionAndCookie({ userId });
  return sessionId;
};
