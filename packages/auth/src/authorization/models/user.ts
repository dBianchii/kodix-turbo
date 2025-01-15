import type { User as AuthUser } from "../../config";

type User = Pick<AuthUser, "id">;

export type { User };
