import { teamSchema } from "../../schema";

// * ----- Exports live below this line ----- *//
export const zTeamUpdate = teamSchema.omit({ id: true }).partial();
export const zTeamCreate = teamSchema;
