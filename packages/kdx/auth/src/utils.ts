//? This file contains some db interactions that need to exist here instead of @kdx/api.
//? It's to avoid circular dependencies / duplicated code for db calls that need to be here in @kdx/auth

import type { Drizzle, DrizzleTransaction } from "@kdx/db/client";
import { teamRepository, userRepository } from "@kdx/db/repositories";

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
  await userRepository.createUser(tx, {
    activeTeamId: teamId,
    email,
    id: userId,
    image,
    name,
    passwordHash,
  });
  if (invite) {
    await acceptInvite({ db: tx, email, invite, userId });
  } else {
    await teamRepository.createTeamAndAssociateUser(tx, userId, {
      id: teamId,
      name: "Personal Team",
      ownerId: userId,
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
  const invitation = await teamRepository.findInvitationByIdAndEmail({
    email,
    id: invite,
  });

  if (!invitation) throw new Error("No invitation found");

  await userRepository.moveUserToTeamAndAssociateToTeam(db, {
    teamId: invitation.Team.id,
    userId,
  });

  await teamRepository.deleteInvitationById(db, invite);
}
