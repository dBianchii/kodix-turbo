import { NANOID_SIZE } from "@kodix/shared/utils";
import { relations } from "drizzle-orm";
import { index, mysqlTable } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";

import { teams } from "../teams";
import { users } from "../users";
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
    createdBy: t
      .varchar({ length: DEFAULTLENGTH })
      .notNull()
      .references(() => users.id),
    dateStart: t.timestamp({ fsp: 3, mode: "date" }).notNull(),
    dateUntil: t.timestamp({ fsp: 3, mode: "date" }),
    description: t.varchar({ length: DEFAULTLENGTH }),
    id: nanoidPrimaryKey(t),
    rule: t.varchar({ length: DEFAULTLENGTH }).notNull(),
    teamId: teamIdReferenceCascadeDelete(t),
    title: t.varchar({ length: DEFAULTLENGTH }),
    type: typeEnum(t).notNull().default("NORMAL"),
  }),
  (table) => [index("teamId_idx").on(table.teamId)],
);
export const eventMastersRelations = relations(
  eventMasters,
  ({ many, one }) => ({
    CareTasks: many(careTasks),
    EventCancellations: many(eventCancellations),
    EventExceptions: many(eventExceptions),
    Team: one(teams, {
      fields: [eventMasters.teamId],
      references: [teams.id],
    }),
  }),
);
export const eventMasterSchema = createInsertSchema(eventMasters);

export const eventCancellations = mysqlTable(
  "eventCancellation",
  (t) => ({
    eventMasterId: t
      .varchar({
        length: NANOID_SIZE,
      })
      .notNull()
      .references(() => eventMasters.id, { onDelete: "cascade" }),
    id: nanoidPrimaryKey(t),
    originalDate: t.timestamp().notNull(),
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
export const eventCancellationSchema = createInsertSchema(eventCancellations);

export const eventExceptions = mysqlTable(
  "eventException",
  (t) => ({
    description: t.varchar({ length: DEFAULTLENGTH }),
    eventMasterId: t
      .varchar({
        length: NANOID_SIZE,
      })
      .notNull()
      .references(() => eventMasters.id, { onDelete: "cascade" }),
    id: nanoidPrimaryKey(t),
    newDate: t.timestamp({ fsp: 3, mode: "date" }).notNull(),
    originalDate: t.timestamp().notNull(),
    title: t.varchar({ length: DEFAULTLENGTH }),
    type: typeEnum(t),
  }),
  (table) => [index("eventMasterId_idx").on(table.eventMasterId)],
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
export const eventExceptionSchema = createInsertSchema(eventExceptions);
