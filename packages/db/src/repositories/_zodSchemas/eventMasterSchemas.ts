import { eventMasterSchema } from "../../schema";

// * ----- Exports live below this line ----- *//
export const zEventMasterUpdate = eventMasterSchema
  .omit({ id: true })
  .partial();
export const zEventMasterCreate = eventMasterSchema;
