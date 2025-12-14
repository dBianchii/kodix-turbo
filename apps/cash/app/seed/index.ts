import { db } from "@cash/db/client";
import * as schema from "@cash/db/schema";
import { runSeed } from "@kodix/testing/seed-utils";

import { seedCash } from "./seed";

const { caTokens: _, accounts: __, sessions: ___, ...schemaToReset } = schema;

await runSeed({
  db,
  name: "Cash",
  schemaToReset,
  seedFn: seedCash,
});
