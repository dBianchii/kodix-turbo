import type { User as AuthUser } from "@kdx/auth";

type User = Pick<AuthUser, "id">;

export type { User };
