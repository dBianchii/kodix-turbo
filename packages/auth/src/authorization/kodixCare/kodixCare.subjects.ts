import type { InferSubjects } from "@casl/ability";

export type CareTask = InferSubjects<{
  __typename: "CareTask";
  cameFromCalendar: boolean;
  createdBy: string;
}>;
