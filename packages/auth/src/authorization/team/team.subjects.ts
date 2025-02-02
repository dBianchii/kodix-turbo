import type { InferSubjects } from "@casl/ability";

import type { userTeamAppRoles } from "@kdx/db/schema";

export type UserTeamAppRole = InferSubjects<{
  __typename: "UserTeamAppRole";
  role: typeof userTeamAppRoles.$inferInsert.role;
  userId: typeof userTeamAppRoles.$inferInsert.userId;
}>;
