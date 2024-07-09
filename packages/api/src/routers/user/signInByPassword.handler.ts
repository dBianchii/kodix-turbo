import { cookies, headers } from "next/headers";
import { verify } from "@node-rs/argon2";
import { TRPCError } from "@trpc/server";

import type { TSignInByPasswordInputSchema } from "@kdx/validators/trpc/user";
import { lucia } from "@kdx/auth";

import type { TPublicProcedureContext } from "../../procedures";
import { argon2Config } from "./utils";

interface SignInByPasswordOptions {
  ctx: TPublicProcedureContext;
  input: TSignInByPasswordInputSchema;
}

export const signInHandler = async ({
  ctx,
  input,
}: SignInByPasswordOptions) => {
  const existingUser = await ctx.db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, input.email),
    columns: {
      id: true,
      passwordHash: true,
    },
  });
  if (!existingUser) {
    // NOTE:
    // Returning immediately allows malicious actors to figure out valid usernames from response times,
    // allowing them to only focus on guessing passwords in brute-force attacks.
    // As a preventive measure, you may want to hash passwords even for invalid usernames.
    // However, valid usernames can be already be revealed with the signup page among other methods.
    // It will also be much more resource intensive.
    // Since protecting against this is non-trivial,
    // it is crucial your implementation is protected against brute-force attacks with login throttling etc.
    // If usernames are public, you may outright tell the user that the username is invalid.
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Incorrect email or password",
    });
  }
  if (!existingUser.passwordHash)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Incorrect email or password",
    });

  const validPassword = await verify(
    existingUser.passwordHash,
    input.password,
    argon2Config,
  );
  if (!validPassword)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Incorrect email or password",
    });

  const heads = headers();
  const session = await lucia.createSession(existingUser.id, {
    ipAddress:
      heads.get("X-Forwarded-For") ??
      heads.get("X-Forwarded-For") ??
      "127.0.0.1",
    userAgent: heads.get("user-agent"),
  });
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return session.id;
};
