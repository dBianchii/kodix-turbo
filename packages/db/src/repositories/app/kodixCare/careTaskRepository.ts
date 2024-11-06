import type { z } from "zod";
import { and, eq, gte } from "drizzle-orm";

import type { Update } from "../../_types";
import type { Drizzle } from "../../../client";
import {
  zCareTaskCreate,
  zCareTaskUpdate,
} from "../../_zodSchemas/careTaskSchemas";
import { careTasks } from "../../../schema";

export async function updateCareTask(
  db: Drizzle,
  { id, input }: Update<typeof zCareTaskUpdate>,
) {
  await db
    .update(careTasks)
    .set(zCareTaskUpdate.parse(input))
    .where(eq(careTasks.id, id));
}

export async function createCareTask(
  db: Drizzle,
  careTask: z.infer<typeof zCareTaskCreate>,
) {
  await db.insert(careTasks).values(zCareTaskCreate.parse(careTask));
}

export async function reassignCareTasksFromDateToShift(
  db: Drizzle,
  {
    previousCareShiftId,
    newCareShiftId,
    date,
  }: { previousCareShiftId: string; newCareShiftId: string; date: Date },
) {
  await db
    .update(careTasks)
    .set({
      careShiftId: newCareShiftId,
    })
    .where(
      and(
        gte(careTasks.date, date),
        eq(careTasks.careShiftId, previousCareShiftId),
      ),
    );
}
