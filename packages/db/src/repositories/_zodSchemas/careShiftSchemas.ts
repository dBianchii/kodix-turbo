import { careShiftSchema } from "../../schema";

// * ----- Exports live below this line ----- *//
export const zCareShiftUpdate = careShiftSchema
  .omit({ id: true })
  .deepPartial();
export const zCareShiftCreate = careShiftSchema;
