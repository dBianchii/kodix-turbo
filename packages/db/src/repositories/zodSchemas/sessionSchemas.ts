import { sessionSchema } from "../../schema";

const zSession = sessionSchema.required();

const zSessionMutable = zSession
  .omit({
    id: true,
  })
  .deepPartial();
const zSessionRequired = zSession.pick({
  id: true,
  expiresAt: true,
  userId: true,
});

// * ----- Exports live below this line ----- *//
export const zSessionUpdate = zSessionMutable.extend({
  id: zSession.shape.id,
});
export const zSessionCreate = zSessionMutable.merge(zSessionRequired);
