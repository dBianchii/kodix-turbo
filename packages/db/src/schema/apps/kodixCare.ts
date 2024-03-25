import { relations, sql } from "drizzle-orm";
import { index, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

import { NANOID_SIZE } from "@kdx/shared";

import { users } from "../auth";
import { teams } from "../teams";
import { DEFAULTLENGTH } from "../utils";
import { eventMasters } from "./calendar";

export const careShifts = mysqlTable(
  "careShift",
  {
    id: varchar("id", { length: NANOID_SIZE }).notNull().primaryKey(),
    caregiverId: varchar("caregiverId", { length: NANOID_SIZE })
      .notNull()
      .references(() => users.id),
    teamId: varchar("teamId", { length: NANOID_SIZE })
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    checkIn: timestamp("checkIn")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    checkOut: timestamp("checkOut"),
    shiftEndedAt: timestamp("shiftEndedAt"),
    notes: varchar("notes", { length: DEFAULTLENGTH }),
  },
  (table) => {
    return {
      caregiverIdIdx: index("caregiverId_idx").on(table.caregiverId),
      teamIdIdx: index("teamId_idx").on(table.teamId),
    };
  },
);
export const careShiftsRelations = relations(careShifts, ({ one }) => ({
  Caregiver: one(users, {
    fields: [careShifts.caregiverId],
    references: [users.id],
  }),
  Team: one(teams, {
    fields: [careShifts.teamId],
    references: [teams.id],
  }),
}));

export const careTasks = mysqlTable(
  "careTask",
  {
    id: varchar("id", { length: NANOID_SIZE }).notNull().primaryKey(),
    eventDate: timestamp("eventDate").notNull(),
    doneAt: timestamp("doneAt"),
    doneByUserId: varchar("doneByUserId", { length: NANOID_SIZE }).references(
      () => users.id,
      { onDelete: "restrict" }, //Restrict because we have to keep logs somehow
    ),
    teamId: varchar("teamId", { length: NANOID_SIZE })
      .notNull()
      .references(() => teams.id),
    eventMasterId: varchar("eventMasterId", {
      length: NANOID_SIZE,
    }).references(() => eventMasters.id),
    idCareShift: varchar("idCareShift", { length: NANOID_SIZE })
      .notNull()
      .references(() => careShifts.id),
    title: varchar("title", { length: DEFAULTLENGTH }),
    description: varchar("description", { length: DEFAULTLENGTH }),
    details: varchar("details", { length: DEFAULTLENGTH }),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (table) => {
    return {
      doneByUserIdIdx: index("doneByUserId_idx").on(table.doneByUserId),
      eventMasterIdIdx: index("eventMasterId_Idx").on(table.eventMasterId),
      idCareShiftIdx: index("idCareShift_idx").on(table.idCareShift),
      teamIdIdx: index("teamId_idx").on(table.teamId),
    };
  },
);
export const careTasksRelations = relations(careTasks, ({ one }) => ({
  DoneByUser: one(users, {
    fields: [careTasks.doneByUserId],
    references: [users.id],
  }),
  Team: one(teams, {
    fields: [careTasks.teamId],
    references: [teams.id],
  }),
  CareShift: one(careShifts, {
    fields: [careTasks.idCareShift],
    references: [careShifts.id],
  }),
  EventMaster: one(eventMasters, {
    fields: [careTasks.eventMasterId],
    references: [eventMasters.id],
  }),
}));
