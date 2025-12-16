import { connection } from "next/server";
import { captureException } from "@kodix/posthog";

export async function GET() {
  await connection();
  try {
    throw new Error("This is a test error in the test route");
  } catch (error) {
    await captureException(error);
  }
}
