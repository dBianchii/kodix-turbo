import { careTaskSchema } from "../../schema";

// * ----- Exports live below this line ----- *//
export const zCareTaskUpdate = careTaskSchema.omit({ id: true }).deepPartial();
export const zCareTaskCreate = careTaskSchema;
export const zCareTaskCreateMany = zCareTaskCreate.array();
