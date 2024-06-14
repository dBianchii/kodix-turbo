import { Auth } from "@auth/core";
import Google from "@auth/core/providers/google";
import resend from "@auth/core/providers/resend";
import { eventHandler, toWebRequest } from "h3";

import { kodixNotificationFromEmail } from "@kdx/shared";

export default eventHandler(async (event) =>
  Auth(toWebRequest(event), {
    basePath: "/r",
    secret: process.env.AUTH_SECRET,
    trustHost: !!process.env.VERCEL,
    redirectProxyUrl: process.env.AUTH_REDIRECT_PROXY_URL,
    providers: [
      Google({
        clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
        clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
      }),
      resend({
        apiKey: process.env.RESEND_API_KEY,
        from: kodixNotificationFromEmail,
      }),
    ],
  }),
);
