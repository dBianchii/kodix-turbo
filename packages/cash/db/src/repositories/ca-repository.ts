import { desc, eq, sql } from "drizzle-orm";
import { buildConflictUpdateAllColumns } from "..";

import { db as _db, type Drizzle, type DrizzleTransaction } from "../client";
import { caTokens, clients, sales } from "../schema";

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
  db: Drizzle = _db,
) {
  const [newToken] = await db.insert(caTokens).values(token).returning();
  return newToken;
}

export async function updateCAToken(
  id: string,
  data: Partial<typeof caTokens.$inferInsert>,
  db: Drizzle = _db,
) {
  const [updatedToken] = await db
    .update(caTokens)
    .set(data)
    .where(eq(caTokens.id, id))
    .returning();
  return updatedToken;
}

export function findClientByCpf(cpf: string, db: Drizzle = _db) {
  return db.query.clients.findFirst({
    columns: {
      email: true,
      name: true,
      phone: true,
    },
    where: eq(clients.document, cpf),
  });
}

export function findClientByCaId(caId: string, db: Drizzle = _db) {
  return db.query.clients.findFirst({
    where: eq(clients.caId, caId),
  });
}

export function updateClientByCaId(
  caId: string,
  data: Partial<typeof clients.$inferInsert>,
  db: Drizzle | DrizzleTransaction = _db,
) {
  return db.update(clients).set(data).where(eq(clients.caId, caId));
}

export function createClient(
  data: typeof clients.$inferInsert,
  db: Drizzle | DrizzleTransaction = _db,
) {
  return db.insert(clients).values(data);
}

export function upsertClientsByCaId(
  input: (typeof clients.$inferInsert)[],
  db: Drizzle | DrizzleTransaction = _db,
) {
  return db
    .insert(clients)
    .values(input)
    .onConflictDoUpdate({
      set: buildConflictUpdateAllColumns(clients, ["id"]),
      target: clients.caId,
    })
    .returning({
      caId: clients.caId,
      id: clients.id,
      inserted: sql<boolean>`xmax = 0`, // true if inserted, false if updated
    });
}

export function upsertSalesByCaId(
  input: (typeof sales.$inferInsert)[],
  db: Drizzle | DrizzleTransaction = _db,
) {
  return db
    .insert(sales)
    .values(input)
    .onConflictDoUpdate({
      set: buildConflictUpdateAllColumns(sales, ["id"]),
      target: sales.caId,
    })
    .returning({
      caId: sales.caId,
      clientId: sales.clientId,
      id: sales.id,
      inserted: sql<boolean>`xmax = 0`, // true if inserted, false if updated
    });
}
