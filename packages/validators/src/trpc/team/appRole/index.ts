import { z } from "zod";

import type { KodixAppId } from "@kdx/shared";
import { allRoles } from "@kdx/shared";

import { ZNanoId } from "../../..";

export const ZGetUsersWithRolesInputSchema = z.object({
  appId: z.custom<KodixAppId>(),
});
export type TGetUsersWithRolesInputSchema = z.infer<
  typeof ZGetUsersWithRolesInputSchema
>;

const literals = allRoles.map((x) => z.literal(x)) as [
  z.ZodLiteral<"ADMIN">,
  z.ZodLiteral<"CAREGIVER">, //TODO: This looks alwful
];
export const ZUpdateUserAssociationInputSchema = z.object({
  userId: ZNanoId, //User to update
  appId: z.custom<KodixAppId>(), //Which app teamAppRoleIds belong to.
  roles: z.array(z.union(literals)), //teamAppRoleIds to connect
});
export type TUpdateUserAssociationInputSchema = z.infer<
  typeof ZUpdateUserAssociationInputSchema
>;

export const ZGetMyRolesInputSchema = z.object({
  appId: z.custom<KodixAppId>(),
});
export type TGetMyRolesInputSchema = z.infer<typeof ZGetMyRolesInputSchema>;
