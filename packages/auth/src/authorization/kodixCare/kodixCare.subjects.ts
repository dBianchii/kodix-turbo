import type { InferSubjects } from "@casl/ability";

import type { careTasks } from "@kdx/db/schema";

export type CareTask = InferSubjects<{
  __typename: "CareTask";
  createdFromCalendar: typeof careTasks.$inferInsert.createdFromCalendar;
  createdBy: typeof careTasks.$inferInsert.createdBy;
}>;
