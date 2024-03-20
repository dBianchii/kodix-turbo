import { db, sql } from "./index";

async function emptyDBTables() {
  console.log("🗑️ Dropping the entire database");
  await db.execute(sql.raw(`DROP DATABASE railway`));
  await db.execute(sql.raw(`CREATE DATABASE railway`));
}

emptyDBTables()
  .then(() => {
    console.log("✅ Database dropped");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    //  db();
  });
