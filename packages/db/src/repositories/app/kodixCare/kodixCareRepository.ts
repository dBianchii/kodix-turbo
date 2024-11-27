import type { z } from "zod";
import { and, eq } from "drizzle-orm";

import { kodixCareAppId, kodixCareRoleDefaultIds } from "@kdx/shared";

import type { Update } from "../../_types";
import type {
  zCareShiftCreate,
  zCareShiftUpdate,
} from "../../_zodSchemas/careShiftSchemas";
import { teamRepository } from "../..";
import { db as _db } from "../../../client";
import { careShifts } from "../../../schema";

export async function updateCareShift(
  { id, input }: Update<typeof zCareShiftUpdate>,
  db = _db,
) {
  return db.update(careShifts).set(input).where(eq(careShifts.id, id));
}
export async function getCareShiftById(
  {
    id,
    teamId,
  }: {
    id: string;
    teamId: string;
  },
  db = _db,
) {
  return db.query.careShifts.findFirst({
    where: and(eq(careShifts.id, id), eq(careShifts.teamId, teamId)),
  });
}

export async function createCareShift(
  careShift: z.infer<typeof zCareShiftCreate>,
  db = _db,
) {
  return db.insert(careShifts).values(careShift).$returningId();
}

export async function deleteCareShiftById(
  { id, teamId }: { id: string; teamId: string },
  db = _db,
) {
  return db
    .delete(careShifts)
    .where(and(eq(careShifts.teamId, teamId), eq(careShifts.id, id)));
}

export async function getAllCareGivers(teamId: string, db = _db) {
  const users = await teamRepository.getUsersWithRoles(
    {
      appId: kodixCareAppId,
      teamId,
    },
    db,
  );

  return users.filter((user) =>
    user.TeamAppRolesToUsers.some(
      (relation) =>
        relation.TeamAppRole.appRoleDefaultId ===
        kodixCareRoleDefaultIds.careGiver,
    ),
  );
}

export async function findOverlappingShifts(
  {
    teamId,
    start,
    end,
  }: {
    teamId: string;
    start: Date;
    end: Date;
  },
  db = _db,
) {
  return db.query.careShifts.findMany({
    where: (careShifts, { and, gte, lte }) =>
      and(
        eq(careShifts.teamId, teamId),
        lte(careShifts.startAt, end),
        gte(careShifts.endAt, start),
      ),
    with: {
      Caregiver: {
        columns: {
          id: true,
          image: true,
          name: true,
        },
      },
    },
    columns: {
      id: true,
      startAt: true,
      endAt: true,
    },
  });
}
