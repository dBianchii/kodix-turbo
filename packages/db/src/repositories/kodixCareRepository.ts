import type { z } from "zod";
import { desc, eq } from "drizzle-orm";

import type { Drizzle } from "../client";
import { db } from "../client";
import { careShifts } from "../schema";
import { zCareShiftUpdate } from "./zodSchemas/careShiftSchemas";

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
  careShift: z.infer<typeof zCareShiftUpdate>,
) {
  await db
    .update(careShifts)
    .set(zCareShiftUpdate.parse(careShift))
    .where(eq(careShifts.id, careShift.id));
}
