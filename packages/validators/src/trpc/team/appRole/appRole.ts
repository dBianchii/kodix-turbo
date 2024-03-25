import { z } from "zod";

import type { KodixAppId } from "@kdx/shared";

import { zNanoId } from "../../..";

export const ZGetUsersWithRolesInputSchema = z.object({
  appId: z.custom<KodixAppId>(),
});
export type TGetUsersWithRolesInputSchema = z.infer<
  typeof ZGetUsersWithRolesInputSchema
>;

export const ZGetAllInputSchema = z.object({
  appId: z.custom<KodixAppId>(),
});
export type TGetAllInputSchema = z.infer<typeof ZGetAllInputSchema>;

export const ZGetPermissionsInputSchema = z.object({
  appId: z.custom<KodixAppId>(),
});
export type TGetPermissionsInputSchema = z.infer<
  typeof ZGetPermissionsInputSchema
>;

export const ZUpdatePermissionAssociationInputSchema = z.object({
  permissionId: zNanoId, //Permission to update
  appId: z.custom<KodixAppId>(), //Which app the permission belongs to.
  teamAppRoleIds: z.array(zNanoId), //teamAppRoleIds to connect
});
export type TUpdatePermissionAssociationInputSchema = z.infer<
  typeof ZUpdatePermissionAssociationInputSchema
>;

export const ZUpdateUserAssociationInputSchema = z.object({
  userId: zNanoId, //User to update
  appId: z.custom<KodixAppId>(), //Which app teamAppRoleIds belong to.
  teamAppRoleIds: z.array(zNanoId), //teamAppRoleIds to connect
});
export type TUpdateUserAssociationInputSchema = z.infer<
  typeof ZUpdateUserAssociationInputSchema
>;
