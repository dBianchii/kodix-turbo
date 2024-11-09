import type { z } from "zod";
import { and, desc, eq, isNotNull } from "drizzle-orm";

import type { Update } from "../../_types";
import type {
  zCareShiftCreate,
  zCareShiftUpdate,
} from "../../_zodSchemas/careShiftSchemas";
import type { Drizzle } from "../../../client";
import { db } from "../../../client";
import { careShifts } from "../../../schema";

export async function getCurrentCareShiftByTeamId(teamId: string) {
  const shift = await db.query.careShifts.findFirst({
    orderBy: desc(careShifts.checkIn),
    where: (careShift, { eq }) => eq(careShift.teamId, teamId),
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
  await db.update(careShifts).set(input).where(eq(careShifts.id, id));
}

export async function createCareShift(
  db: Drizzle,
  careShift: z.infer<typeof zCareShiftCreate>,
) {
  return db.insert(careShifts).values(careShift).$returningId();
}

export async function getPreviousShiftByTeamId(db: Drizzle, teamId: string) {
  return await db.query.careShifts.findFirst({
    orderBy: desc(careShifts.checkIn),
    where: and(
      eq(careShifts.teamId, teamId),
      isNotNull(careShifts.shiftEndedAt),
    ),
    columns: { id: true },
  });
}
