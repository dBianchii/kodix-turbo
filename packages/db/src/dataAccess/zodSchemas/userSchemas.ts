import { userSchema } from "../../schema";

const zUser = userSchema.required();

const zUserMutable = zUser
  .omit({
    id: true,
  })
  .deepPartial();

const zUserRequired = zUser.pick({
  id: true,
  email: true,
  activeTeamId: true,
  name: true,
});

// * ----- Exports live below this line ----- *//
export const zUserUpdate = zUserMutable.extend({
  id: zUser.shape.id,
});
export const zUserCreate = zUserMutable.merge(zUserRequired);
