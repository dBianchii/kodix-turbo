import { eventExceptionSchema } from "../../schema";

// * ----- Exports live below this line ----- *//
export const zEventExceptionUpdate = eventExceptionSchema
  .omit({ id: true })
  .partial();
export const zEventExceptionCreate = eventExceptionSchema;
