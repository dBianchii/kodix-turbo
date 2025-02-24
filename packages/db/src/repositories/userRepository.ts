import { db as _db } from "../client";

export async function findManyUsersByIds(ids: string[], db = _db) {
  return await db.query.users.findMany({
    where: (users, { inArray }) => inArray(users.id, ids),
    columns: {
      name: true,
    },
  });
}
