import { userSchema } from "../../schema";

// const zUserRequired = careShiftSchema.required();

// * ----- Exports live below this line ----- *//
export const zUserUpdate = userSchema.omit({ id: true }).deepPartial();
export const zUserCreate = userSchema;