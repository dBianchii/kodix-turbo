import type { PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless";

import type { schema } from "./index";
import { db, sql } from "./index";

async function emptyDBTables(db: PlanetScaleDatabase<typeof schema>) {
  console.log("🗑️ Emptying the entire database");

  const tablesSchema = db._.schema;
  if (!tablesSchema) throw new Error("Schema not loaded");

  const queries = Object.values(tablesSchema).map((table) => {
    console.log(`🧨 Preparing delete query for table: ${table.dbName}`);
    return sql.raw(`DELETE FROM ${table.dbName};`);
  });

  console.log("🛜 Sending delete queries");

  await db.transaction(async (trx) => {
    for (const query of queries) await trx.execute(query);
  });
}

emptyDBTables(db)
  .then(() => {
    console.log("✅ Database emptied");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    // void db.$disconnect();
  });
