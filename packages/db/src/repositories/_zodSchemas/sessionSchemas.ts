import { sessionSchema } from "../../schema";

// * ----- Exports live below this line ----- *//
export const zSessionUpdate = sessionSchema.omit({ id: true }).partial();
export const zSessionCreate = sessionSchema;
