export interface BaseUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  passwordHash: string | null;
}

export interface BaseSession {
  id: string;
  userId: string;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string | null;
}

export type AuthResponse<
  TUser extends Omit<BaseUser, "passwordHash">,
  TSession extends BaseSession,
> =
  | {
      user: TUser;
      session: TSession;
    }
  | { user: null; session: null };
