import type { Theme } from "@auth/core/types";
import type { EmailConfig } from "next-auth/providers";
import { Resend } from "resend";

import VerificationRequestEmail from "@kdx/react-email/verification-request";
import { kodixNotificationFromEmail } from "@kdx/shared";

import { env } from "../../env";

export const resend = new Resend(env.RESEND_API_KEY);

const EXPO_COOKIE_NAME = /__kdx-expo-redirect-state=([^;]+)/;

export const sendVerificationRequest = async (params: {
  identifier: string;
  url: string;
  expires: Date;
  provider: EmailConfig;
  token: string;
  theme: Theme;
  request: Request;
}) => {
  const isExpoCallback = params.request.headers
    .get("cookie")
    ?.match(EXPO_COOKIE_NAME)?.[1];

  if (isExpoCallback) {
    const newExpoRedirectUrl = new URL(decodeURIComponent(isExpoCallback));

    newExpoRedirectUrl.searchParams.set("session_token", params.token);
    params.url = newExpoRedirectUrl.toString();
  }

  console.log("params.url", params.url);
  try {
    await resend.emails.send({
      from: kodixNotificationFromEmail,
      to: params.identifier,
      subject: "Kodix login verification",
      react: VerificationRequestEmail({
        magicLink: params.url,
      }),
    });
  } catch (error) {
    throw new Error(`Error sending verification email`);
  }
};
