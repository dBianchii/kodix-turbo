import type { AbilityBuilder, MongoAbility } from "@casl/ability";

import type { Team } from "../models/team";
import type { User } from "../models/user";
import type { UserTeamAppRole } from "./team.subjects";

type TeamAbilities = ["delete", UserTeamAppRole];

export type TeamAbility = MongoAbility<TeamAbilities>;

export const teamPermissions =
  ({ team, user }: { team: Team; user: User }) =>
  ({ can, cannot }: AbilityBuilder<TeamAbility>) => {
    if (team.ownerId === user.id) {
      can("delete", "UserTeamAppRole");
      cannot("delete", "UserTeamAppRole", {
        userId: {
          $eq: user.id,
        },
        role: { $eq: "ADMIN" },
      }).because(
        "Team owners cannot remove themselves from the Administrator role",
      );
    }
  };
