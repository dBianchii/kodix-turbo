import type { InferSubjects } from "@casl/ability";

import type { users, userTeamAppRoles } from "@kdx/db/schema";

export type UserTeamAppRole = InferSubjects<{
  __typename: "UserTeamAppRole";
  role: typeof userTeamAppRoles.$inferSelect.role;
  userId: typeof userTeamAppRoles.$inferSelect.userId;
}>;

export type User = InferSubjects<{
  __typename: "User";
  id: typeof users.$inferSelect.id;
}>;
