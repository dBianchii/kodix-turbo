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
    id: nanoidPrimaryKey(t),
    title: t.varchar({ length: DEFAULTLENGTH }).notNull(),
    description: t.varchar({ length: DEFAULTLENGTH }),
    dueDate: t.timestamp(),
    priority: t.smallint(),
    status: t.mysqlEnum(["TODO", "INPROGRESS", "INREVIEW", "DONE", "CANCELED"]),
    assignedToUserId: t
      .varchar({ length: DEFAULTLENGTH })
      .references(() => users.id),
    teamId: teamIdReferenceCascadeDelete(t),
  }),
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
