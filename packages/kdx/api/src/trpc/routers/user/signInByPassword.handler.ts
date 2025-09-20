import type { TSignInByPasswordInputSchema } from "@kdx/validators/trpc/user";
import { validateUserEmailAndPassword } from "@kdx/auth";
import { createDbSessionAndCookie } from "@kdx/auth/utils";

import type { TPublicProcedureContext } from "../../procedures";

interface SignInByPasswordOptions {
  ctx: TPublicProcedureContext;
  input: TSignInByPasswordInputSchema;
}

export const signInByPasswordHandler = async ({
  input,
}: SignInByPasswordOptions) => {
  const { id: userId } = await validateUserEmailAndPassword({
    email: input.email,
    password: input.password,
  });

  const sessionId = await createDbSessionAndCookie({ userId });

  return sessionId;
};
