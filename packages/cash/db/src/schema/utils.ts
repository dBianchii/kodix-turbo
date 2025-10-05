import type { pgTable } from "drizzle-orm/pg-core";
import { NANOID_SIZE, nanoid } from "@kodix/shared/utils";

type THelper = Parameters<Parameters<typeof pgTable>["1"]>["0"];

/** Most of the time, our primary keys always will be the same. This centralizes our PK standard */
export const nanoidPrimaryKey = (t: THelper) =>
  t
    .varchar({ length: NANOID_SIZE })
    .notNull()
    .$default(() => nanoid())
    .primaryKey();

export const DEFAULTLENGTH = 255;
