//? This file contains some db interactions that need to exist here instead of @kdx/api.
//? It's to avoid circular dependencies / duplicated code for db calls that need to be here in @kdx/auth

import type { Drizzle, DrizzleTransaction } from "@kdx/db/client";
import type {
  public_teamRepositoryFactory,
  public_userRepositoryFactory,
} from "@kdx/db/repositories";

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
  publicUserRepository,
  publicTeamRepository,
  passwordHash,
}: {
  invite?: string;
  name: string;
  teamId: string;
  userId: string;
  email: string;
  image?: string;
  passwordHash?: string;
  publicUserRepository: ReturnType<typeof public_userRepositoryFactory>;
  publicTeamRepository: ReturnType<typeof public_teamRepositoryFactory>;
  tx: DrizzleTransaction;
}) {
  await publicUserRepository.createUser(
    {
      id: userId,
      name: name,
      activeTeamId: teamId,
      email: email,
      image: image,
      passwordHash: passwordHash,
    },
    tx,
  );

  if (invite) {
    await acceptInvite({
      invite,
      userId,
      email,
      db: tx,
      publicUserRepository,
    });
    return;
  }

  await publicTeamRepository.createTeamAndAssociateUser(
    userId,
    {
      id: teamId,
      ownerId: userId,
      name: `Personal Team`,
    },
    tx,
  );
}

export async function acceptInvite({
  invite,
  userId,
  email,
  db,
  publicUserRepository,
}: {
  invite: string;
  userId: string;
  email: string;
  db: Drizzle;
  publicUserRepository: ReturnType<typeof public_userRepositoryFactory>;
}) {
  const invitation = await publicUserRepository.findInvitationByIdAndEmail({
    id: invite,
    email,
  });

  if (!invitation) throw new Error("No invitation found");

  await db.transaction(async (tx) => {
    await Promise.allSettled([
      publicUserRepository.moveUserToTeamAndAssociateToTeam(
        {
          userId,
          teamId: invitation.Team.id,
        },
        tx,
      ),
      publicUserRepository.deleteInvitationById(invite, tx),
    ]);
  });
}

export async function createDbSessionAndCookie({ userId }: { userId: string }) {
  const token = generateSessionToken();
  const session = await createSession(token, userId);
  await setSessionTokenCookie(token, session.expiresAt);

  return session.id;
}
