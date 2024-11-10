import { sql } from "drizzle-orm/sql";

import { db } from "../src/client";

if (!process.env.MYSQL_URL) throw new Error("MYSQL_URL is not set");

const url = new URL(process.env.MYSQL_URL);

async function emptyDBTables() {
  console.log("🗑️ Dropping the entire database");
  await db.execute(sql.raw(`DROP DATABASE ${url.pathname.slice(1)}`));
  await db.execute(sql.raw(`CREATE DATABASE ${url.pathname.slice(1)}`));
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
