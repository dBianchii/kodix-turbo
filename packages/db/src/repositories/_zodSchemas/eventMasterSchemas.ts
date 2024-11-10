import { eventMasterSchema } from "../../schema";

// * ----- Exports live below this line ----- *//
export const zEventMasterUpdate = eventMasterSchema
  .omit({ id: true })
  .deepPartial();
export const zEventMasterCreate = eventMasterSchema;
