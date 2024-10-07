//? This file is used to create common values that can be used in the schema files.

import type { mysqlTable } from "drizzle-orm/mysql-core";
import { decimal } from "drizzle-orm/mysql-core";

import { nanoid, NANOID_SIZE } from "../nanoid";
import { teams } from "./teams";

export const DEFAULTLENGTH = 255;

export const moneyDecimal = decimal;

type THelper = Parameters<Parameters<typeof mysqlTable>["1"]>["0"];

/** Most of the time, we want to delete a record when the associated team is deleted. This centralizes the reference */
export const teamIdReferenceCascadeDelete = (t: THelper) =>
  t
    .varchar({
      length: NANOID_SIZE,
    })
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" });

/** Most of the time, our primary keys always will be the same. This centralizes our PK standard */
export const nanoidPrimaryKey = (t: THelper) =>
  t
    .varchar({ length: NANOID_SIZE })
    .notNull()
    .$default(() => nanoid())
    .primaryKey();
