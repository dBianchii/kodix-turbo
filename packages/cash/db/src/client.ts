import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Missing DATABASE_URL");
}

if (process.env.NODE_ENV === "production") {
  neonConfig.webSocketConstructor = WebSocket;
  neonConfig.poolQueryViaFetch = true;
} else {
  neonConfig.wsProxy = (host) => `${host}:5433/v1`;
  neonConfig.useSecureWebSocket = false;
  neonConfig.pipelineTLS = false;
  neonConfig.pipelineConnect = false;
}

const pool = new Pool({ connectionString });

export const db = drizzle({ client: pool, schema });

export type Drizzle = typeof db;
export type DrizzleTransaction = Parameters<
  Parameters<(typeof db)["transaction"]>[0]
>[0];
