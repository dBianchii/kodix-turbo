import { and, eq, gte } from "drizzle-orm";

import type { Update } from "../../_types";
import type { Drizzle } from "../../../client";
import { zCareTaskUpdate } from "../../_zodSchemas/careTaskSchemas";
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
