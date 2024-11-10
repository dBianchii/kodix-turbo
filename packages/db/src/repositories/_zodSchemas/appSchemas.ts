import { appSchema } from "../../schema";

// * ----- Exports live below this line ----- *//
export const zAppUpdate = appSchema.omit({ id: true }).deepPartial();
export const zAppCreate = appSchema;
