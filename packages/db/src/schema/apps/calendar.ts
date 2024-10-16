import { relations } from "drizzle-orm";
import { index, mysqlTable } from "drizzle-orm/mysql-core";

import { NANOID_SIZE } from "../../nanoid";
import { teams } from "../teams";
import {
  DEFAULTLENGTH,
  nanoidPrimaryKey,
  teamIdReferenceCascadeDelete,
  typeEnum,
} from "../utils";
import { careTasks } from "./kodixCare";

export const eventMasters = mysqlTable(
  "eventMaster",
  (t) => ({
    id: nanoidPrimaryKey(t),
    rule: t.varchar({ length: DEFAULTLENGTH }).notNull(),
    dateStart: t.timestamp({ mode: "date", fsp: 3 }).notNull(),
    dateUntil: t.timestamp({ mode: "date", fsp: 3 }),
    title: t.varchar({ length: DEFAULTLENGTH }),
    description: t.varchar({ length: DEFAULTLENGTH }),
    teamId: teamIdReferenceCascadeDelete(t),
    type: typeEnum(t).notNull().default("NORMAL"),
  }),
  (table) => {
    return {
      teamIdIdx: index("teamId_idx").on(table.teamId),
    };
  },
);
export const eventMastersRelations = relations(
  eventMasters,
  ({ many, one }) => ({
    Team: one(teams, {
      fields: [eventMasters.teamId],
      references: [teams.id],
    }),
    CareTasks: many(careTasks),
    EventExceptions: many(eventExceptions),
    EventCancellations: many(eventCancellations),
  }),
);

export const eventCancellations = mysqlTable(
  "eventCancellation",
  (t) => ({
    id: nanoidPrimaryKey(t),
    originalDate: t.timestamp({ mode: "date", fsp: 3 }).notNull(),
    eventMasterId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => eventMasters.id, { onDelete: "cascade" }),
  }),
  (table) => {
    return {
      eventMasterIdIdx: index("eventMasterId_idx").on(table.eventMasterId),
    };
  },
);
export const eventCancellationsRelations = relations(
  eventCancellations,
  ({ one }) => ({
    EventMaster: one(eventMasters, {
      fields: [eventCancellations.eventMasterId],
      references: [eventMasters.id],
    }),
  }),
);

export const eventExceptions = mysqlTable(
  "eventException",
  (t) => ({
    id: nanoidPrimaryKey(t),
    originalDate: t.timestamp({ mode: "date", fsp: 3 }).notNull(),
    newDate: t.timestamp({ mode: "date", fsp: 3 }).notNull(),
    title: t.varchar({ length: DEFAULTLENGTH }),
    description: t.varchar({ length: DEFAULTLENGTH }),
    eventMasterId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => eventMasters.id, { onDelete: "cascade" }),
    type: typeEnum(t),
  }),
  (table) => {
    return {
      eventMasterIdIdx: index("eventMasterId_idx").on(table.eventMasterId),
    };
  },
);
export const eventExceptionsRelations = relations(
  eventExceptions,
  ({ one }) => ({
    EventMaster: one(eventMasters, {
      fields: [eventExceptions.eventMasterId],
      references: [eventMasters.id],
    }),
  }),
);
