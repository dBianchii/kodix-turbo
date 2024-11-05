import type { z } from "zod";
import { and, desc, eq, isNotNull } from "drizzle-orm";

import type { Update } from "../../_types";
import type { Drizzle } from "../../../client";
import {
  zCareShiftCreate,
  zCareShiftUpdate,
} from "../../_zodSchemas/careShiftSchemas";
import { db } from "../../../client";
import { careShifts } from "../../../schema";

export async function getCurrentCareShiftByTeamId(teamId: string) {
  const shift = await db.query.careShifts.findFirst({
    orderBy: desc(careShifts.checkIn),
    where: (careShift, { eq, and, isNull }) =>
      and(eq(careShift.teamId, teamId), isNull(careShift.shiftEndedAt)),
    with: {
      Caregiver: {
        columns: {
          email: true,
          id: true,
          image: true,
          name: true,
        },
      },
    },
    columns: {
      shiftEndedAt: true,
      checkIn: true,
      checkOut: true,
      id: true,
    },
  });
  return shift ?? null;
}

export async function updateCareShift(
  db: Drizzle,
  { id, input }: Update<typeof zCareShiftUpdate>,
) {
  await db
    .update(careShifts)
    .set(zCareShiftUpdate.parse(input))
    .where(eq(careShifts.id, id));
}

export async function createCareShift(
  db: Drizzle,
  careShift: z.infer<typeof zCareShiftCreate>,
) {
  return db
    .insert(careShifts)
    .values(zCareShiftCreate.parse(careShift))
    .$returningId();
}

export async function getPreviousShiftByTeamId(teamId: string) {
  return await db.query.careShifts.findFirst({
    orderBy: desc(careShifts.checkIn),
    where: and(
      eq(careShifts.teamId, teamId),
      isNotNull(careShifts.shiftEndedAt),
    ),
    columns: { id: true },
  });
}
