import type { Session, User } from "lucia";
import { cookies } from "next/headers";
import { Lucia } from "lucia";

import type { sessions, users } from "@kdx/db/schema";

import { env } from "../env";
import { adapter } from "./lucia-custom-adapter";
import * as discordProvider from "./providers/discord";
import * as googleProvider from "./providers/google";

export const isSecureContext = env.NODE_ENV !== "development";

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: env.NODE_ENV === "production",
    },
  },

  getSessionAttributes(databaseSessionAttributes) {
    return {
      userAgent: databaseSessionAttributes.userAgent,
      ipAddress: databaseSessionAttributes.ipAddress,
    };
  },

  getUserAttributes: (attributes) => {
    return {
      name: attributes.name,
      email: attributes.email,
      activeTeamId: attributes.activeTeamId,
      activeTeamName: attributes.activeTeamName,
      kodixAdmin: attributes.kodixAdmin,
      image: attributes.image,
    };
  },
});

export const auth = async (): Promise<AuthResponse> => {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return {
      user: null,
      session: null,
    };
  }

  const result = await lucia.validateSession(sessionId);
  // next.js throws when you attempt to set cookie when rendering page
  try {
    if (result.session?.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
  } catch {
    /* empty */
  }
  return result;
};

export const providers = {
  discord: discordProvider,
  google: googleProvider,
} as const;

export type Providers = keyof typeof providers;

export type AuthResponse =
  | { user: User; session: Session }
  | { user: null; session: null };

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Omit<typeof users.$inferSelect, "id"> &
      ExtendedDatabaseUserAttributes;
    DatabaseSessionAttributes: Pick<
      typeof sessions.$inferSelect,
      "ipAddress" | "userAgent"
    >;
  }
}
interface ExtendedDatabaseUserAttributes {
  activeTeamName: string; //"Virtual" field from the team table
}
