import type { TSignInByPasswordInputSchema } from "@kdx/validators/trpc/user";

import type { TPublicProcedureContext } from "../../procedures";
import {
  createDbSessionAndCookie,
  validateUserEmailAndPassword,
} from "./utils";

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

  const sessionId = await createDbSessionAndCookie({ userId });

  return sessionId;
};
