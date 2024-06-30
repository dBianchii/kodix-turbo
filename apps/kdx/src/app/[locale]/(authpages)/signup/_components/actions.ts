"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { hash } from "@node-rs/argon2";

import { lucia } from "@kdx/auth";
import { createUser } from "@kdx/auth/db";
import { eq } from "@kdx/db";
import { db } from "@kdx/db/client";
import { schema } from "@kdx/db/schema";
import { nanoid } from "@kdx/shared";

import { action } from "~/helpers/safe-action/safe-action";
import { argon2Config } from "../../utils";
import { ZSignUpActionSchema } from "./schema";

export const signupAction = action(ZSignUpActionSchema, async (input) => {
  const registered = await db
    .select({
      id: schema.users.id,
    })
    .from(schema.users)
    .where(eq(schema.users.email, input.email))
    .then((res) => !!res[0]);

  if (registered) throw new Error("Email already registered");

  const passwordHash = await hash(input.password, argon2Config);
  const userId = nanoid();
  const teamId = nanoid();

  await createUser({
    name: input.name,
    teamId: teamId,
    userId: userId,
    email: input.email,
    invite: input.invite,
    passwordHash: passwordHash,
    db: db,
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
});
