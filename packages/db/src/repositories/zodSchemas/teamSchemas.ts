import { teamSchema } from "../../schema";

const zTeam = teamSchema.required();

const zTeamMutable = zTeam
  .omit({
    id: true,
  })
  .deepPartial();
const zTeamRequired = zTeam.pick({
  id: true,
  name: true,
  ownerId: true,
});

// * ----- Exports live below this line ----- *//
export const zTeamUpdate = zTeamMutable.extend({
  id: zTeam.shape.id,
});
export const zTeamCreate = zTeamMutable.merge(zTeamRequired);
