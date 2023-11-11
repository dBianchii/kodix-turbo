import { Auth } from "@auth/core";
import EmailProvider from "@auth/core/providers/email";
import Google from "@auth/core/providers/google";
import { eventHandler, toWebRequest } from "h3";

export default eventHandler(async (event) =>
  Auth(toWebRequest(event), {
    secret: process.env.AUTH_SECRET,
    trustHost: !!process.env.VERCEL,
    redirectProxyUrl: process.env.AUTH_REDIRECT_PROXY_URL,
    providers: [
      Google({
        clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
        clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
      }),
      EmailProvider({
        server: {
          host: process.env.AUTH_EMAIL_SERVER_HOST,
          port: process.env.AUTH_EMAIL_SERVER_PORT,
          auth: {
            user: process.env.AUTH_EMAIL_SERVER_USER,
            pass: process.env.AUTH_EMAIL_SERVER_PASSWORD,
          },
        },
        from: process.env.AUTH_EMAIL_FROM,
        type: "email",
        sendVerificationRequest: () => {
          throw new Error("Not implemented");
        },
        id: "",
        name: "",
      }),
    ],
  }),
);
