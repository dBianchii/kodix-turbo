import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as schema from "@cash/db/schema";
import { runSeed } from "@kodix/testing/seed-utils";

import { seedCash } from "./seed";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { caTokens: _, accounts: __, sessions: ___, ...schemaToReset } = schema;

await runSeed({
  appRoot: resolve(__dirname, ".."),
  createDb: () => import("@cash/db/client").then(({ db }) => db),
  name: "Cash",
  schemaToReset,
  seedFn: seedCash,
});
