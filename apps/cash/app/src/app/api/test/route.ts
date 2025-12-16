import { connection } from "next/server";

export async function GET() {
  await connection();

  throw new Error("This is a test error without a try/catch!!");
}
