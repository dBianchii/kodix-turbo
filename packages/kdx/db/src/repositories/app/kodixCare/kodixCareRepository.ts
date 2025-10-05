import type { z } from "zod";
import { kodixCareAppId } from "@kodix/shared/db";
import { and, eq, gt, gte, lt, lte } from "drizzle-orm";

import type { Update } from "../../_types";
import type {
  zCareShiftCreate,
  zCareShiftUpdate,
} from "../../_zodSchemas/careShiftSchemas";
import { db as _db } from "../../../client";
import { careShifts } from "../../../schema";
import { teamRepository } from "../..";

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
    user.UserTeamAppRoles.some((role) => role.role === "CAREGIVER"),
  );
}

export async function findOverlappingShifts(
  {
    teamId,
    start,
    end,
    inclusive = false,
  }: {
    teamId: string;
    start: Date;
    end: Date;
    inclusive?: boolean;
  },
  db = _db,
) {
  const startCondition = inclusive ? gte : gt;
  const endCondition = inclusive ? lte : lt;

  return db.query.careShifts.findMany({
    columns: {
      endAt: true,
      id: true,
      startAt: true,
    },
    where: (careShifts, { and }) =>
      and(
        eq(careShifts.teamId, teamId),
        startCondition(careShifts.endAt, start),
        endCondition(careShifts.startAt, end),
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
  });
}
