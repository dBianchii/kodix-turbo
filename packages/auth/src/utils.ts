//? This file contains some db interactions that need to exist here instead of @kdx/api.
//? It's to avoid circular dependencies / duplicated code for db calls that need to be here in @kdx/auth

import type { Drizzle, DrizzleTransaction } from "@kdx/db/client";
import {
  createUser as dbCreateUser,
  moveUserToTeamAndAssociateToTeam,
} from "@kdx/db/auth";
import {
  createTeamAndAssociateUser,
  deleteInvitationById,
  findInvitationByIdAndEmail,
} from "@kdx/db/team";

import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from "./config";

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
  await dbCreateUser(tx, {
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
    await createTeamAndAssociateUser(tx, userId, {
      id: teamId,
      ownerId: userId,
      name: `Personal Team`,
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
  const invitation = await findInvitationByIdAndEmail({ id: invite, email });

  if (!invitation) throw new Error("No invitation found");

  await moveUserToTeamAndAssociateToTeam(db, {
    userId,
    teamId: invitation.Team.id,
  });

  await deleteInvitationById(db, invite);
}

export async function createDbSessionAndCookie({ userId }: { userId: string }) {
  const token = generateSessionToken();
  const session = await createSession(token, userId);
  setSessionTokenCookie(token, session.expiresAt);

  return session.id;
}
