import { appPermissionToTeamAppRoleSchema } from "../../schema";

// * ----- Exports live below this line ----- *//
export const zAppPermissionToTeamAppRoleCreate =
  appPermissionToTeamAppRoleSchema;
export const zAppPermissionToTeamAppRoleCreateMany =
  zAppPermissionToTeamAppRoleCreate.array();
