import { nanoid } from "@kodix/shared/utils";
import { TRPCError } from "@trpc/server";

import type { TSignupWithPasswordInputSchema } from "@kdx/validators/trpc/user";
import { createDbSessionAndCookie, generatePasswordHash } from "@kdx/auth";
import { createUser } from "@kdx/auth/utils";
import { db } from "@kdx/db/client";
import { userRepository } from "@kdx/db/repositories";

import type { TPublicProcedureContext } from "../../procedures";

interface SignupWithPasswordOptions {
  ctx: TPublicProcedureContext;
  input: TSignupWithPasswordInputSchema;
}

export const signupWithPasswordHandler = async ({
  ctx,
  input,
}: SignupWithPasswordOptions) => {
  const registered = await userRepository.findUserByEmail(input.email);

  if (registered) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: ctx.t("api.Email already registered"),
    });
  }

  const passwordHash = await generatePasswordHash(input.password);
  const userId = nanoid();

  await db.transaction(async (tx) => {
    await createUser({
      email: input.email,
      invite: input.invite,
      name: input.name,
      passwordHash,
      teamId: nanoid(),
      tx,
      userId,
    });
  });

  const sessionId = createDbSessionAndCookie({ userId });

  return sessionId;
};
