import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
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
    id: nanoidPrimaryKey(t),
    caregiverId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => users.id),
    teamId: teamIdReferenceCascadeDelete(t),
    checkIn: t.timestamp().defaultNow().notNull(),
    checkOut: t.timestamp(),
    shiftEndedAt: t.timestamp(),
    notes: t.varchar({ length: DEFAULTLENGTH }),
  }),
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
export const careShiftSchema = createInsertSchema(careShifts);

export const careTasks = mysqlTable(
  "careTask",
  (t) => ({
    id: nanoidPrimaryKey(t),
    date: t.timestamp().notNull(),
    doneAt: t.timestamp(),
    doneByUserId: t.varchar({ length: NANOID_SIZE }).references(
      () => users.id,
      { onDelete: "restrict" }, //Restrict because we have to keep logs somehow
    ),
    teamId: teamIdReferenceCascadeDelete(t),
    eventMasterId: t.varchar({
      length: NANOID_SIZE,
    }),
    //.references(() => eventMasters.id), //TODO: should we have foreignKey????????????????????????????????????????????????????????????????
    careShiftId: t
      .varchar({ length: NANOID_SIZE })
      .references(() => careShifts.id),
    title: t.varchar({ length: DEFAULTLENGTH }),
    description: t.varchar({ length: DEFAULTLENGTH }),
    details: t.varchar({ length: DEFAULTLENGTH }),
    updatedAt: t.timestamp().onUpdateNow(),
    type: typeEnum(t).notNull().default("NORMAL"),
    createdBy: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => users.id),
    createdFromCalendar: boolean("createdFromCalendar").notNull(),
  },
  (table) => {
    return {
      doneByUserIdIdx: index("doneByUserId_idx").on(table.doneByUserId),
      eventMasterIdIdx: index("eventMasterId_Idx").on(table.eventMasterId),
      careShiftIdIdx: index("careShiftId_idx").on(table.careShiftId),
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
    fields: [careTasks.careShiftId],
    references: [careShifts.id],
  }),
  EventMaster: one(eventMasters, {
    fields: [careTasks.eventMasterId],
    references: [eventMasters.id],
  }),
}));
export const careTaskSchema = createInsertSchema(careTasks);
