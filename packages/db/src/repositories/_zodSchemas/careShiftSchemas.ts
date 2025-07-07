import { careShiftSchema } from "../../schema";

// * ----- Exports live below this line ----- *//
export const zCareShiftUpdate = careShiftSchema
  .omit({ id: true })
  .partial();
export const zCareShiftCreate = careShiftSchema;
