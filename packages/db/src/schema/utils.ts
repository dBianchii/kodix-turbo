//? This file is used to create common values that can be used in the schema files.
import { decimal, varchar } from "drizzle-orm/mysql-core";

import { NANOID_SIZE } from "@kdx/shared";

import { teams } from "./teams";

export const DEFAULTLENGTH = 255;

export const moneyDecimal = decimal;

/** Most of the time, we want to delete a record when the associated team is deleted. This centralizes the reference */
export const teamIdReference = varchar("teamId", { length: NANOID_SIZE })
  .notNull()
  .references(() => teams.id, { onDelete: "cascade" });
