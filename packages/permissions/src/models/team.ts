import type { teams } from "@kdx/db/schema";

type Team = Pick<typeof teams.$inferSelect, "ownerId">;

export type { Team };
