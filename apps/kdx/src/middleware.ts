import { withAuth } from "./middlewares/auth";
import { chainMiddleware } from "./middlewares/chain-middleware";
import { withI18n } from "./middlewares/i18n";

//TODO: csrf protection https://lucia-auth.com/sessions/cookies/nextjs
export default chainMiddleware([withI18n, withAuth]);

export const config = {
  // matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)"],
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    "/((?!api|_next|_vercel|.*\\..*).*)",

    // Match all pathnames within `/users`, optionally with a locale prefix
    // "/(.+)?/users/(.+)",
  ],
};
