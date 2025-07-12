import { count } from "drizzle-orm";

import { db } from "../src/client";
import { appsToTeams, invitations } from "../src/schema";

async function run() {
  console.log("🔍 Counting records...");

  const [invitationsCount] = await db
    .select({ value: count() })
    .from(invitations);
  const [appsToTeamsCount] = await db
    .select({ value: count() })
    .from(appsToTeams);

  console.log(
    `- Invitations table has ${invitationsCount?.value ?? 0} records.`,
  );
  console.log(
    `- AppsToTeams table has ${appsToTeamsCount?.value ?? 0} records.`,
  );

  process.exit(0);
}

run().catch((err) => {
  console.error("❌ An error occurred:", err);
  process.exit(1);
});
