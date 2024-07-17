import { verify } from "@node-rs/argon2";
import { TRPCError } from "@trpc/server";

import type { Drizzle } from "@kdx/db/client";
import { eq } from "@kdx/db";
import { db as _db } from "@kdx/db/client";
import { schema } from "@kdx/db/schema";

export const argon2Config = {
  // recommended minimum parameters
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

/**
 * Validates a user's email and password. Returns the user's ID if successful.
 */
export async function validateUserEmailAndPassword({
  db = _db,
  email,
  password,
}: {
  db: Drizzle;
  email: string;
  password: string;
}) {
  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
    columns: {
      id: true,
      activeTeamId: true,
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
    password,
    argon2Config,
  );
  if (!validPassword)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Incorrect email or password",
    });

  /**Returns an object representing the validated user */
  return { id: existingUser.id, activeTeamId: existingUser.activeTeamId };
}

export async function switchActiveTeamForUser({
  db = _db,
  userId,
  teamId,
}: {
  db: Drizzle;
  userId: string;
  teamId: string;
}) {
  await db.update(schema.users).set({ activeTeamId: teamId }).where(
    eq(schema.users.id, userId),
    //TODO: Make sure they are part of the team!!
  );
}
