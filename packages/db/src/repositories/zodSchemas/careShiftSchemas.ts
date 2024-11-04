import { careShiftSchema } from "../../schema";

const zCareShift = careShiftSchema.required();

const zCareShiftMutable = zCareShift
  .omit({
    id: true,
  })
  .deepPartial();

const zCareShiftRequired = zCareShift.pick({
  checkIn: true,
  caregiverId: true,
});

// * ----- Exports live below this line ----- *//
export const zCareShiftUpdate = zCareShiftMutable.extend({
  id: zCareShift.shape.id,
});
export const zCareShiftCreate = zCareShiftMutable.merge(zCareShiftRequired);
