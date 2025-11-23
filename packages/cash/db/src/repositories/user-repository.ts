import { eq } from "drizzle-orm";

import { db as _db, type Drizzle, type DrizzleTransaction } from "../client";
import { users } from "../schema";

export function findUserByEmail(email: string, db = _db) {
  return db.query.users.findFirst({
    where: eq(users.email, email),
  });
}

export async function createUser(
  user: typeof users.$inferInsert,
  db: Drizzle | DrizzleTransaction = _db,
) {
  return await db.insert(users).values(user).returning({ id: users.id });
}
