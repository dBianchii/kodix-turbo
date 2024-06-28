"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { hash } from "@node-rs/argon2";
import { z } from "zod";

import { lucia } from "@kdx/auth";
import { eq } from "@kdx/db";
import { db } from "@kdx/db/client";
import { schema } from "@kdx/db/schema";
import { nanoid } from "@kdx/shared";

import { action } from "~/helpers/safe-action/safe-action";
import { argon2Config } from "../utils";

export const signupAction = action(
  z.object({
    name: z.string().min(3).max(31),
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

    const passwordHash = await hash(input.password, argon2Config);
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
        userId: userId,
        teamId: teamId,
      });
    });

    const heads = headers();

    const session = await lucia.createSession(userId, {
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
    redirect("/team");
  },
);
