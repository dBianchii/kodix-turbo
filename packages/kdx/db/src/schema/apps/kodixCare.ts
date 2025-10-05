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
import { eventMasters } from "./calendar";

export const careShifts = mysqlTable(
  "careShift",
  (t) => ({
    caregiverId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => users.id),
    checkIn: t.timestamp(),
    checkOut: t.timestamp(),
    createdById: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => users.id),
    endAt: t.timestamp().notNull(),
    finishedByUserId: t.varchar({ length: NANOID_SIZE }).references(
      () => users.id,
      { onDelete: "restrict" }, //Restrict because we have to keep logs somehow
    ),
    id: nanoidPrimaryKey(t),
    notes: t.varchar({ length: DEFAULTLENGTH }),
    startAt: t.timestamp().notNull(),
    teamId: teamIdReferenceCascadeDelete(t),
  }),
  (table) => [
    index("caregiverId_idx").on(table.caregiverId),
    index("teamId_idx").on(table.teamId),
  ],
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
export const careShiftSchema = createInsertSchema(careShifts);

export const careTasks = mysqlTable(
  "careTask",
  (t) => ({
    createdBy: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => users.id),
    createdFromCalendar: t.boolean().notNull(),
    date: t.timestamp().notNull(),
    description: t.varchar({ length: DEFAULTLENGTH }),
    details: t.varchar({ length: DEFAULTLENGTH }),
    doneAt: t.timestamp(),
    doneByUserId: t.varchar({ length: NANOID_SIZE }).references(
      () => users.id,
      { onDelete: "restrict" }, //Restrict because we have to keep logs somehow
    ),
    eventMasterId: t.varchar({
      length: NANOID_SIZE,
    }),
    id: nanoidPrimaryKey(t),
    teamId: teamIdReferenceCascadeDelete(t),
    //.references(() => eventMasters.id), //TODO: should we have foreignKey????????????????????????????????????????????????????????????????
    title: t.varchar({ length: DEFAULTLENGTH }),
    type: typeEnum(t).notNull().default("NORMAL"),
    updatedAt: t.timestamp().onUpdateNow(),
  }),
  (table) => [
    index("doneByUserId_idx").on(table.doneByUserId),
    index("eventMasterId_Idx").on(table.eventMasterId),
    index("teamId_idx").on(table.teamId),
  ],
);
export const careTasksRelations = relations(careTasks, ({ one }) => ({
  DoneByUser: one(users, {
    fields: [careTasks.doneByUserId],
    references: [users.id],
  }),
  EventMaster: one(eventMasters, {
    fields: [careTasks.eventMasterId],
    references: [eventMasters.id],
  }),
  Team: one(teams, {
    fields: [careTasks.teamId],
    references: [teams.id],
  }),
}));
export const careTaskSchema = createInsertSchema(careTasks);
