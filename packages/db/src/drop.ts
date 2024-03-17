import type { PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless";

import type { schema } from "./index";
import { db, sql } from "./index";

async function emptyDBTables(db: PlanetScaleDatabase<typeof schema>) {
  console.log("🗑️ Dropping the entire database");

  const tablesSchema = db._.schema;
  if (!tablesSchema) throw new Error("Schema not loaded");

  const queries = Object.values(tablesSchema).map((table) => {
    console.log(`🧨 Preparing drop query for table: ${table.dbName}`);
    return sql.raw(`DROP TABLE IF EXISTS ${table.dbName};`);
  });

  console.log("🛜 Sending drop queries");

  await db.transaction(async (trx) => {
    for (const query of queries) await trx.execute(query);
  });
}

emptyDBTables(db)
  .then(() => {
    console.log("✅ Database dropped");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    // void db.$disconnect();
  });
