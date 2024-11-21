import { eventCancellationSchema } from "../../schema";

// * ----- Exports live below this line ----- *//
export const zEventCancellationUpdate = eventCancellationSchema
  .omit({ id: true })
  .deepPartial();
export const zEventCancellationCreate = eventCancellationSchema;