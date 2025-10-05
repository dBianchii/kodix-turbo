import { nanoid } from "@kodix/shared/utils";
import { TRPCError } from "@trpc/server";

import type { TSignupWithPasswordInputSchema } from "@kdx/validators/trpc/user";
import { createDbSessionAndCookie, generatePasswordHash } from "@kdx/auth";
import { createUser } from "@kdx/auth/utils";
import { db } from "@kdx/db/client";
import { userRepository } from "@kdx/db/repositories";

import type { TPublicProcedureContext } from "../../procedures";
import { captureProductAnalytic } from "../../../services/productAnalytics.service";

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
      name: input.name,
      teamId: nanoid(),
      userId: userId,
      email: input.email,
      invite: input.invite,
      passwordHash: passwordHash,
      tx,
    });
  });

  const sessionId = createDbSessionAndCookie({ userId });
  captureProductAnalytic({
    event: "signup",
    userId,
    properties: { email: input.email },
  });

  return sessionId;
};
