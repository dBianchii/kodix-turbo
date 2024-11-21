import type { appActivityLogs } from "@kdx/db/schema";
import { appRepository } from "@kdx/db/repositories";

export async function logActivity(input: typeof appActivityLogs.$inferInsert) {
  await appRepository.createAppActivityLog(input);
}
