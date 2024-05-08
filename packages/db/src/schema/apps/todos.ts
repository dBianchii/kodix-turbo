import { relations } from "drizzle-orm";
import {
  index,
  mysqlEnum,
  mysqlTable,
  smallint,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

import { NANOID_SIZE } from "@kdx/shared";

import { users } from "../auth";
import { teams } from "../teams";
import { DEFAULTLENGTH } from "../utils";

export const todos = mysqlTable(
  "todo",
  {
    id: varchar("id", { length: NANOID_SIZE }).notNull().primaryKey(),
    title: varchar("title", { length: DEFAULTLENGTH }).notNull(),
    description: varchar("description", { length: DEFAULTLENGTH }),
    dueDate: timestamp("dueDate"),
    priority: smallint("priority"),
    status: mysqlEnum("status", [
      "TODO",
      "INPROGRESS",
      "INREVIEW",
      "DONE",
      "CANCELED",
    ]),
    assignedToUserId: varchar("assignedToUserId", {
      length: DEFAULTLENGTH,
    }).references(() => users.id),
    teamId: varchar("teamId", { length: NANOID_SIZE })
      .notNull()
      .references(() => teams.id),
  },
  (table) => {
    return {
      assignedToUserIdIdx: index("assignedToUserId_idx").on(
        table.assignedToUserId,
      ),
      teamIdIdx: index("teamId_idx").on(table.teamId),
    };
  },
);
export const todosRelations = relations(todos, ({ one }) => ({
  AssignedToUser: one(users, {
    fields: [todos.assignedToUserId],
    references: [users.id],
  }),
  Team: one(teams, {
    fields: [todos.teamId],
    references: [teams.id],
  }),
}));
