import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL");
}
const url = new URL(process.env.DATABASE_URL);
const connectionString = url.toString();

if (url.hostname === "localhost") {
  neonConfig.wsProxy = (host) => `${host}:5433/v1`;
  neonConfig.useSecureWebSocket = false;
  neonConfig.pipelineTLS = false;
  neonConfig.pipelineConnect = false;
} else {
  neonConfig.webSocketConstructor = WebSocket;
  neonConfig.poolQueryViaFetch = true;
}

const pool = new Pool({ connectionString });

export const db = drizzle({ client: pool, schema });

export type Drizzle = typeof db;
export type DrizzleTransaction = Parameters<
  Parameters<(typeof db)["transaction"]>[0]
>[0];
