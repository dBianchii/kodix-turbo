import type { CreateAbility, ForcedSubject, MongoAbility } from "@casl/ability";
import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import { z } from "zod";

import type { KodixAppId } from "@kdx/shared";

import type { User } from "./models/user";
import type { KodixCareRoles } from "./roles";
import { kodixCarePermissions } from "./permissions";
import { projectSubject } from "./subjects/project";
import { userSubject } from "./subjects/user";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const appAbilitiesSchema = z.union([
  userSubject,
  projectSubject,
  z.tuple([z.literal("manage"), z.literal("all")]),
]);

type Actions = "manage" | "invite";
type Subjects = "User" | "all";
type AppAbilities = [
  Actions,
  Subjects | ForcedSubject<Exclude<Actions, "all">>,
];

export type AppAbility = MongoAbility<AppAbilities>;
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

export function defineAbilityFor({
  user,
  appId,
  role,
}: {
  user: User;
  appId: KodixAppId;
  role: KodixCareRoles;
}) {
  const builder = new AbilityBuilder(createAppAbility);

  if (typeof kodixCarePermissions[role] !== "function")
    throw new Error(`Permissions for role '${role}' not found.`);

  kodixCarePermissions[role](user, builder);

  const ability = builder.build();

  ability.can = ability.can.bind(ability);
  ability.cannot = ability.cannot.bind(ability);

  return ability;
}
