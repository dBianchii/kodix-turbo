import { sessionSchema } from "../../schema";

// * ----- Exports live below this line ----- *//
export const zSessionUpdate = sessionSchema.omit({ id: true }).deepPartial();
export const zSessionCreate = sessionSchema;
