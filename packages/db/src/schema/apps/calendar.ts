import { relations } from "drizzle-orm";
import { index, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

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
  {
    id: nanoidPrimaryKey,
    rule: varchar("rule", { length: DEFAULTLENGTH }).notNull(),
    dateStart: timestamp("dateStart", { mode: "date", fsp: 3 }).notNull(),
    dateUntil: timestamp("dateUntil", { mode: "date", fsp: 3 }),
    title: varchar("title", { length: DEFAULTLENGTH }),
    description: varchar("description", { length: DEFAULTLENGTH }),
    teamId: teamIdReferenceCascadeDelete,
    type: typeEnum.notNull().default("NORMAL"),
  },
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
  {
    id: nanoidPrimaryKey,
    originalDate: timestamp("originalDate").notNull(),
    eventMasterId: varchar("eventMasterId", {
      length: NANOID_SIZE,
    })
      .notNull()
      .references(() => eventMasters.id, { onDelete: "cascade" }),
  },
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
  {
    id: nanoidPrimaryKey,
    originalDate: timestamp("originalDate").notNull(),
    newDate: timestamp("newDate", { mode: "date", fsp: 3 }).notNull(),
    title: varchar("title", { length: DEFAULTLENGTH }),
    description: varchar("description", { length: DEFAULTLENGTH }),
    eventMasterId: varchar("eventMasterId", {
      length: NANOID_SIZE,
    })
      .notNull()
      .references(() => eventMasters.id, { onDelete: "cascade" }),
    type: typeEnum,
  },
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
