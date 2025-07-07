import { careTaskSchema } from "../../schema";

// * ----- Exports live below this line ----- *//
export const zCareTaskUpdate = careTaskSchema.omit({ id: true }).partial();
export const zCareTaskCreate = careTaskSchema;
export const zCareTaskCreateMany = zCareTaskCreate.array();
