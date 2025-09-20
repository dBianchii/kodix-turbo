import type { AbilityBuilder, MongoAbility } from "@casl/ability";

import type { IsomorficT } from "@kdx/locales";

import type { Delete } from "../actions";
import type { Team } from "../models/team";
import type { User } from "../models/user";
import type { RemoveFromTeam } from "./team.actions";
import type { User as UserSubj, UserTeamAppRole } from "./team.subjects";

type TeamAbilitiesSet = [Delete, UserTeamAppRole] | [RemoveFromTeam, UserSubj];

export type TeamAbility = MongoAbility<TeamAbilitiesSet>;

export const teamPermissionsFactory =
  ({ team, user, t }: { team: Team; user: User; t: IsomorficT }) =>
  ({ can, cannot }: AbilityBuilder<TeamAbility>) => {
    if (team.ownerId === user.id) {
      can("Delete", "UserTeamAppRole");
      cannot("Delete", "UserTeamAppRole", {
        userId: {
          $eq: user.id,
        },
        role: { $eq: "ADMIN" },
      }).because(
        t("api.You cannot remove yourself from the Administrator role")
      );

      can("RemoveFromTeam", "User");
      cannot("RemoveFromTeam", "User", {
        id: { $eq: user.id },
      }).because(
        t(
          "api.You cannot remove yourself from a team you are an owner of Delete this team instead"
        )
      );
    }
  };
