import type { AppRole, KodixAppId } from "@kodix/shared/db";
import { allRoles } from "@kodix/shared/db";
import z from "zod";

import { ZNanoId } from "../../..";

export const ZGetUsersWithRolesInputSchema = z.object({
  appId: z.custom<KodixAppId>(),
});
export type TGetUsersWithRolesInputSchema = z.infer<
  typeof ZGetUsersWithRolesInputSchema
>;

const rolesSchema = z.object(
  allRoles.reduce(
    (acc, role) => {
      acc[role] = z.boolean().optional();
      return acc;
    },
    {} as Record<AppRole<KodixAppId>, z.ZodOptional<z.ZodBoolean>>,
  ),
);
export const ZUpdateUserAssociationInputSchema = z.object({
  appId: z.custom<KodixAppId>(), //Which app teamAppRoleIds belong to.
  roles: rolesSchema,
  userId: ZNanoId, //User to update
});
export type TUpdateUserAssociationInputSchema = z.infer<
  typeof ZUpdateUserAssociationInputSchema
>;

export const ZGetMyRolesInputSchema = z.object({
  appId: z.custom<KodixAppId>(),
});
export type TGetMyRolesInputSchema = z.infer<typeof ZGetMyRolesInputSchema>;
