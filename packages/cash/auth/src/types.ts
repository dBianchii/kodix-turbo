import type { sessions, users } from "@cash/db/schema";
import type { AuthResponse } from "@kodix/auth/types";

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;

export type CashAuthResponse = AuthResponse<User, Session>;
