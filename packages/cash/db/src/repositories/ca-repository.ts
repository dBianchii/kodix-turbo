import { desc, eq } from "drizzle-orm";

import { db as _db, type Drizzle } from "../client";
import { upsertMany } from "../operations";
import { caSales, caTokens } from "../schema";

export async function getCAToken(db = _db) {
  const token = await db.query.caTokens.findFirst({
    orderBy: [desc(caTokens.createdAt)],
  });
  if (!token) {
    throw new Error("No token found in db");
  }
  return token;
}

export async function createCAToken(
  token: typeof caTokens.$inferInsert,
  db: Drizzle = _db
) {
  const [newToken] = await db.insert(caTokens).values(token).returning();
  return newToken;
}

export async function updateCAToken(
  id: string,
  data: Partial<typeof caTokens.$inferInsert>,
  db: Drizzle = _db
) {
  const [updatedToken] = await db
    .update(caTokens)
    .set(data)
    .where(eq(caTokens.id, id))
    .returning();
  return updatedToken;
}

export function upsertCASales(
  sales: (typeof caSales.$inferInsert)[],
  db: Drizzle = _db
) {
  return upsertMany({
    create: (salesToCreate) =>
      db.insert(caSales).values(salesToCreate).returning(),
    find: () => db.query.caSales.findMany(),
    getFetchedDataId: (sale) => sale.caId,
    getInputId: (sale) => sale.caId,
    input: sales,
    update: async (salesToUpdate) => {
      const results = await Promise.all(
        salesToUpdate.map(async (sale) => {
          const [updated] = await db
            .update(caSales)
            .set({
              clienteEmail: sale.clienteEmail,
              clienteId: sale.clienteId,
              clienteNome: sale.clienteNome,
              criadoEm: sale.criadoEm,
              numero: sale.numero,
              total: sale.total,
            })
            .where(eq(caSales.caId, sale.caId))
            .returning();
          return updated;
        })
      );
      return results.filter(Boolean);
    },
  });
}
