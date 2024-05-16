import { sql } from "drizzle-orm/sql";

import { db } from "../client";

if (!process.env.DB_NAME) throw new Error("DB_NAME is not set");

async function emptyDBTables() {
  console.log("🗑️ Dropping the entire database");
  await db.execute(sql.raw(`DROP DATABASE ${process.env.DB_NAME}`));
  await db.execute(sql.raw(`CREATE DATABASE ${process.env.DB_NAME}`));
}

emptyDBTables()
  .then(() => {
    console.log("✅ Database dropped");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    //  db();
  });
