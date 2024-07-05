import * as React from "react";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import { getBaseUrl } from "@kdx/shared";

export default function ResetPassword({ token }: { token: string }) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Tailwind>
        <React.Fragment>
          <Body className="mx-auto my-auto bg-white font-sans">
            <Container className="mx-auto my-[40px] w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
              <Section className="mt-[32px]">
                <Img
                  src={`${getBaseUrl()}/group.jpeg`}
                  width="160"
                  height="48"
                  alt="StarterKit"
                  className="mx-auto my-0"
                />
              </Section>

              <Section className="mb-[32px] mt-[32px] text-center">
                <Text className="mb-8 text-[14px] font-medium leading-[24px] text-black">
                  Click the following link to reset your password
                </Text>

                <Text className="text-[14px] font-medium leading-[24px] text-black">
                  <Link
                    href={`${getBaseUrl()}/signin/reset-password?token=${token}`}
                    target="_blank"
                    className="text-[#2754C5] underline"
                  >
                    Reset Password
                  </Link>
                </Text>
              </Section>

              <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />

              <Text className="flex items-center justify-center text-[12px] leading-[24px] text-[rgb(102,102,102)]">
                © 2024 Kodix. All rights reserved.
              </Text>
            </Container>
          </Body>
        </React.Fragment>
      </Tailwind>
    </Html>
  );
}
