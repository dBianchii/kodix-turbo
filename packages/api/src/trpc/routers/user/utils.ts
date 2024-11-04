import type { Drizzle } from "@kdx/db/client";
import { db as _db } from "@kdx/db/client";
import { userRepository } from "@kdx/db/repositories";

export async function switchActiveTeamForUser({
  db = _db,
  userId,
  teamId,
}: {
  db: Drizzle;
  userId: string;
  teamId: string;
}) {
  await userRepository.updateUser(db, {
    id: userId,
    activeTeamId: teamId,
    //TODO: Make sure they are part of the team!!
  });
}
