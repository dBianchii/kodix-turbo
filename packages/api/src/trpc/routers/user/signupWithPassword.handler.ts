import { hash } from "@node-rs/argon2";
import { TRPCError } from "@trpc/server";

import type { TSignupWithPasswordInputSchema } from "@kdx/validators/trpc/user";
import { argon2Config } from "@kdx/auth";
import { createDbSessionAndCookie, createUser } from "@kdx/auth/utils";
import { db } from "@kdx/db/client";
import { nanoid } from "@kdx/db/nanoid";

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
  const { publicUserRepository, publicTeamRepository } = ctx.publicRepositories;
  const registered = await publicUserRepository.findUserByEmail(input.email);

  if (registered) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: ctx.t("api.Email already registered"),
    });
  }

  const passwordHash = await hash(input.password, argon2Config);
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
      publicUserRepository,
      publicTeamRepository,
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
