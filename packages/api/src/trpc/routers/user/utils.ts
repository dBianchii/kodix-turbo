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
  await userRepository.moveUserToTeam(db, {
    userId,
    newTeamId: teamId,
  });
}
