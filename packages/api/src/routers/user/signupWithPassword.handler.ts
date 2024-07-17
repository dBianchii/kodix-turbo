import { hash } from "@node-rs/argon2";
import { TRPCError } from "@trpc/server";

import type { TSignupWithPasswordInputSchema } from "@kdx/validators/trpc/user";
import { createUser } from "@kdx/auth/db";
import { eq } from "@kdx/db";
import { db } from "@kdx/db/client";
import { nanoid } from "@kdx/db/nanoid";
import { schema } from "@kdx/db/schema";

import type { TPublicProcedureContext } from "../../procedures";
import { argon2Config, createDbSessionAndCookie } from "./utils";

interface SignupWithPasswordOptions {
  ctx: TPublicProcedureContext;
  input: TSignupWithPasswordInputSchema;
}

export const signupWithPasswordHandler = async ({
  ctx,
  input,
}: SignupWithPasswordOptions) => {
  const registered = await ctx.db
    .select({
      id: schema.users.id,
    })
    .from(schema.users)
    .where(eq(schema.users.email, input.email))
    .then((res) => !!res[0]);

  if (registered)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Email already registered",
    });

  const passwordHash = await hash(input.password, argon2Config);
  const userId = nanoid();
  const teamId = nanoid();

  await db.transaction(async (tx) => {
    await createUser({
      name: input.name,
      teamId: teamId,
      userId: userId,
      email: input.email,
      invite: input.invite,
      passwordHash: passwordHash,
      db: tx,
    });
  });

  const sessionId = createDbSessionAndCookie({ userId });
  return sessionId;
};
