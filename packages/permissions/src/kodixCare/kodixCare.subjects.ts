import type { InferSubjects } from "@casl/ability";

import type { careShifts, careTasks } from "@kdx/db/schema";

export type CareTask = InferSubjects<{
  __typename: "CareTask";
  createdFromCalendar: typeof careTasks.$inferInsert.createdFromCalendar;
  createdBy: typeof careTasks.$inferInsert.createdBy;
}>;

export type CareShift = InferSubjects<{
  __typename: "CareShift";
  caregiverId: typeof careShifts.$inferInsert.caregiverId;
  createdById: typeof careShifts.$inferInsert.createdById;
}>;
