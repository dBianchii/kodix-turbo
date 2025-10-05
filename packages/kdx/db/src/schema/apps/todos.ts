import { relations } from "drizzle-orm";
import { index, mysqlTable } from "drizzle-orm/mysql-core";

import { teams } from "../teams";
import { users } from "../users";
import {
  DEFAULTLENGTH,
  nanoidPrimaryKey,
  teamIdReferenceCascadeDelete,
} from "../utils";

export const todos = mysqlTable(
  "todo",
  (t) => ({
    assignedToUserId: t
      .varchar({ length: DEFAULTLENGTH })
      .references(() => users.id),
    description: t.varchar({ length: DEFAULTLENGTH }),
    dueDate: t.timestamp(),
    id: nanoidPrimaryKey(t),
    priority: t.smallint(),
    status: t.mysqlEnum(["TODO", "INPROGRESS", "INREVIEW", "DONE", "CANCELED"]),
    teamId: teamIdReferenceCascadeDelete(t),
    title: t.varchar({ length: DEFAULTLENGTH }).notNull(),
  }),
  (table) => [
    index("assignedToUserId_idx").on(table.assignedToUserId),
    index("teamId_idx").on(table.teamId),
  ],
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
