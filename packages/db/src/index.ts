import { Client } from "@planetscale/database";
import { PrismaPlanetScale } from "@prisma/adapter-planetscale";
import { PrismaClient } from "@prisma/client";
import { fetch as undiciFetch } from "undici";

//* START PLANETSCALE ADAPTER SECTION
const client = new Client({
  url: `${process.env.DATABASE_URL}`,
  fetch: undiciFetch,
});
const adapter = new PrismaPlanetScale(client);
const isPlanetScaleConnection = `${process.env.DATABASE_URL}`.includes("psdb");
//* END PLANETSCALE ADAPTER SECTION

const prismaClientSingleton = () => {
  return new PrismaClient({
    adapter: isPlanetScaleConnection ? adapter : null, //?  Only use Planetscale adapter if we are connecting to Planetscale
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  }).$extends({});
};

const globalForPrisma = globalThis as {
  prisma?: ReturnType<typeof prismaClientSingleton>;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "@prisma/client";
export * from "./getSafeTeamPrisma";
export * from "./seed/constants";
export * from "./seed/appConfigSchemas";
