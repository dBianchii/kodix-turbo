///
import { Client, Client as DrizzleClient } from "@planetscale/database";
import { PrismaPlanetScale } from "@prisma/adapter-planetscale";
import { PrismaClient } from "@prisma/client";
import { drizzle } from "drizzle-orm/planetscale-serverless";
import { fetch as undiciFetch } from "undici";

import * as schema from "./schema/schema";

//* START PLANETSCALE ADAPTER SECTION
const client = new Client({
  url: `${process.env.DATABASE_URL}`,
  fetch: undiciFetch,
});
const adapter = new PrismaPlanetScale(client);
const isPlanetScaleConnection = `${process.env.DATABASE_URL}`.includes("psdb");
//* END PLANETSCALE ADAPTER SECTION

const globalForPrisma = globalThis as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: isPlanetScaleConnection ? adapter : null, //?  Only use Planetscale adapter if we are connecting to Planetscale
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "@prisma/client";

//DRIZZLE ORM
export { mySqlTable as tableCreator } from "./schema/_table";

export * from "drizzle-orm";

const psClient = new DrizzleClient({
  host: process.env.DB_HOST!,
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
});

export const db = drizzle(psClient, { schema });
