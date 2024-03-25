import { createInsertSchema } from "drizzle-zod";

import { schema } from ".";

export * from "zod";

export const ZInsertTodosSchema = createInsertSchema(schema.todos);
export const ZInsertCareTaskSchema = createInsertSchema(schema.careTasks);
