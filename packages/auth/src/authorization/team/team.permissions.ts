import type { AbilityBuilder, MongoAbility } from "@casl/ability";

import type { Team } from "../models/team";
import type { User } from "../models/user";
import type { UserTeamAppRole } from "./team.subjects";

type TeamAbilities = ["update", UserTeamAppRole];

export type TeamAbility = MongoAbility<TeamAbilities>;

export const teamPermissions =
  ({ team, user }: { team: Team; user: User }) =>
  ({ can, cannot }: AbilityBuilder<TeamAbility>) => {
    can("update", "UserTeamAppRole");
    if (team.ownerId === user.id) {
      cannot("update", "UserTeamAppRole", {
        role: { $eq: "ADMIN" },
      }).because(
        "Team owners cannot remove themselves from the Administrator role",
      );
    }
  };
