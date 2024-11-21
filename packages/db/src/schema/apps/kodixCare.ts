import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";

import { NANOID_SIZE } from "../../nanoid";
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
  {
    id: nanoidPrimaryKey,
    caregiverId: varchar("caregiverId", { length: NANOID_SIZE })
      .notNull()
      .references(() => users.id),
    teamId: teamIdReferenceCascadeDelete,
    startAt: timestamp("startAt").notNull(),
    endAt: timestamp("endAt").notNull(),
    checkIn: timestamp("checkIn"),
    checkOut: timestamp("checkOut"),
    notes: varchar("notes", { length: DEFAULTLENGTH }),
    finished: boolean("finished").default(false).notNull(),
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
export const careShiftSchema = createInsertSchema(careShifts);

export const careTasks = mysqlTable(
  "careTask",
  {
    id: nanoidPrimaryKey,
    date: timestamp("date").notNull(),
    doneAt: timestamp("doneAt"),
    doneByUserId: varchar("doneByUserId", { length: NANOID_SIZE }).references(
      () => users.id,
      { onDelete: "restrict" }, //Restrict because we have to keep logs somehow
    ),
    teamId: teamIdReferenceCascadeDelete,
    eventMasterId: varchar("eventMasterId", {
      length: NANOID_SIZE,
    }),
    //.references(() => eventMasters.id), //TODO: should we have foreignKey????????????????????????????????????????????????????????????????
    title: varchar("title", { length: DEFAULTLENGTH }),
    description: varchar("description", { length: DEFAULTLENGTH }),
    details: varchar("details", { length: DEFAULTLENGTH }),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
    type: typeEnum.notNull().default("NORMAL"),
    createdBy: varchar("createdBy", { length: NANOID_SIZE })
      .notNull()
      .references(() => users.id),
    createdFromCalendar: boolean("createdFromCalendar").notNull(),
  },
  (table) => {
    return {
      doneByUserIdIdx: index("doneByUserId_idx").on(table.doneByUserId),
      eventMasterIdIdx: index("eventMasterId_Idx").on(table.eventMasterId),
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
  EventMaster: one(eventMasters, {
    fields: [careTasks.eventMasterId],
    references: [eventMasters.id],
  }),
}));
export const careTaskSchema = createInsertSchema(careTasks);
