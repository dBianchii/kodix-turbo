import type { AuthResponse } from "@kodix/auth/types";

import type { sessions, users } from "@kdx/db/schema";

type ExtraUserProps = {
  activeTeamName: string;
};

export type User = typeof users.$inferSelect & ExtraUserProps;
export type Session = typeof sessions.$inferSelect;

export type KdxAuthResponse = AuthResponse<User, Session>;
