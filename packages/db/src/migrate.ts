import {
  kodixCareRoleDefaultIds,
  PKodixCare_CanCreateCareTask,
} from "@kdx/shared";

import { db } from "./client";
import { appPermissionsToTeamAppRoles } from "./schema";

(async () => {
  const teamAppRolesToMigrate = await db.query.teamAppRoles.findMany({
    where: (teamAppRoles, { inArray }) =>
      inArray(teamAppRoles.appRoleDefaultId, [
        (kodixCareRoleDefaultIds.admin, kodixCareRoleDefaultIds.careGiver),
      ]),
  });
  const toInsert = teamAppRolesToMigrate.map((teamAppRole) => ({
    appPermissionId: PKodixCare_CanCreateCareTask,
    teamAppRoleId: teamAppRole.id,
  }));

  await db.insert(appPermissionsToTeamAppRoles).values(toInsert);
})()
  .then(() => {
    console.log(" Complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  });
