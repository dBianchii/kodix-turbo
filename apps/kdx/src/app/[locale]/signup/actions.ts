"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hash } from "@node-rs/argon2";
import { z } from "zod";

import { lucia } from "@kdx/auth";
import { eq } from "@kdx/db";
import { db } from "@kdx/db/client";
import { schema } from "@kdx/db/schema";
import { nanoid } from "@kdx/shared";

import { action } from "~/helpers/safe-action/safe-action";

export const signupAction = action(
  z.object({
    name: z
      .string()
      .min(3)
      .max(31)
      .regex(/^[a-z0-9_-]+$/),
    email: z.string().email(),
    password: z.string().min(6).max(255),
  }),
  async (input) => {
    const registered = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, input.email))
      .then((res) => res[0]);

    if (registered) {
      return {
        error: "Email already registered",
      };
    }

    const passwordHash = await hash(input.password, {
      // recommended minimum parameters
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
    // const userId = generateIdFromEntropySize(10); // 16 characters long
    const userId = nanoid();
    const teamId = nanoid();

    await db.transaction(async (tx) => {
      await tx.insert(schema.users).values({
        id: userId,
        name: input.name,
        passwordHash: passwordHash,
        activeTeamId: teamId,
        email: input.email,
      });
      await tx.insert(schema.teams).values({
        id: teamId,
        ownerId: userId,
        name: `Personal Team`,
      });
      await tx.insert(schema.usersToTeams).values({
        userId: teamId,
        teamId: teamId,
      });
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
    return redirect("/team");
  },
);
