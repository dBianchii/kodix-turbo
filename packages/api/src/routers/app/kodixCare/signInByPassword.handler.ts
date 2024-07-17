import { TRPCError } from "@trpc/server";

import type { TSignInByPasswordInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import { kodixCareAppId } from "@kdx/shared";

import type { TPublicProcedureContext } from "../../../procedures";
import {
  createDbSessionAndCookie,
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
  const userId = await validateUserEmailAndPassword({
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

  const sessionId = await createDbSessionAndCookie({ userId });
  return sessionId;
};
