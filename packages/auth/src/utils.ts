//? This file contains some db interactions that need to exist here instead of @kdx/api.
//? It's to avoid circular dependencies / duplicated code for db calls that need to be here in @kdx/auth

import { cookies, headers } from "next/headers";

import type { Drizzle } from "@kdx/db/client";
import { lucia } from "@kdx/auth";
import { eq } from "@kdx/db";
import { schema } from "@kdx/db/schema";

export async function createUser({
  invite,
  name,
  teamId,
  userId,
  email,
  image,
  db,
  passwordHash,
}: {
  invite?: string;
  name: string;
  teamId: string;
  userId: string;
  email: string;
  image?: string;
  passwordHash?: string;
  db: Drizzle;
}) {
  await db.insert(schema.users).values({
    id: userId,
    name: name,
    activeTeamId: teamId,
    email: email,
    image: image,
    passwordHash: passwordHash,
  });
  if (invite) {
    await acceptInvite({ invite, userId, email, db });
  } else {
    await db.insert(schema.teams).values({
      id: teamId,
      ownerId: userId,
      name: `Personal Team`,
    });

    await db.insert(schema.usersToTeams).values({
      userId: userId,
      teamId: teamId,
    });
  }
}

export async function acceptInvite({
  invite,
  userId,
  email,
  db,
}: {
  invite: string;
  userId: string;
  email: string;
  db: Drizzle;
}) {
  const invitation = await db.query.invitations.findFirst({
    where: (invitation, { and, eq }) =>
      and(eq(invitation.id, invite), eq(invitation.email, email)),
    with: {
      Team: {
        columns: {
          id: true,
        },
      },
    },
  });

  if (!invitation) throw new Error("No invitation found");

  await db
    .update(schema.users)
    .set({
      activeTeamId: invitation.Team.id,
    })
    .where(eq(schema.users.id, userId));
  await db.insert(schema.usersToTeams).values({
    userId: userId,
    teamId: invitation.Team.id,
  });
  await db.delete(schema.invitations).where(eq(schema.invitations.id, invite));
}

export async function createDbSessionAndCookie({ userId }: { userId: string }) {
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
  return session.id;
}
