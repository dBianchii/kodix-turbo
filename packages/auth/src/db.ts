//? This file contains some db interactions that need to exist here instead of @kdx/api.
//? It's to avoid circular dependencies / duplicated code for db calls that need to be here in @kdx/auth

import type { Drizzle, DrizzleTransaction } from "@kdx/db/client";
import { eq } from "@kdx/db";
import { schema } from "@kdx/db/schema";

export async function createUser({
  invite,
  name,
  teamId,
  userId,
  email,
  image,
  tx,
  passwordHash,
}: {
  invite?: string;
  name: string;
  teamId: string;
  userId: string;
  email: string;
  image?: string;
  passwordHash?: string;
  tx: DrizzleTransaction;
}) {
  await tx.insert(schema.users).values({
    id: userId,
    name: name,
    activeTeamId: teamId,
    email: email,
    image: image,
    passwordHash: passwordHash,
  });
  if (invite) {
    await acceptInvite({ invite, userId, email, db: tx });
  } else {
    await tx.insert(schema.teams).values({
      id: teamId,
      ownerId: userId,
      name: `Personal Team`,
    });

    await tx.insert(schema.usersToTeams).values({
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
