import { z } from "zod";

import type { KodixAppId } from "@kdx/shared";

import { ZNanoId } from "../../..";

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

export const ZUpdateUserAssociationInputSchema = z.object({
  userId: ZNanoId, //User to update
  appId: z.custom<KodixAppId>(), //Which app teamAppRoleIds belong to.
  teamAppRoleIds: z.array(ZNanoId), //teamAppRoleIds to connect
});
export type TUpdateUserAssociationInputSchema = z.infer<
  typeof ZUpdateUserAssociationInputSchema
>;

export const ZGetMyRolesInputSchema = z.object({
  appId: z.custom<KodixAppId>(),
});
export type TGetMyRolesInputSchema = z.infer<typeof ZGetMyRolesInputSchema>;
