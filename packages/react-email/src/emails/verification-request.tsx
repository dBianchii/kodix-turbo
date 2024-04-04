import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import { getI18n } from "@kdx/locales/server";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

export const VerificationRequestEmail = async ({
  magicLink,
}: {
  magicLink?: string;
}) => {
  const t = await getI18n();
  return (
    <Html>
      <Head />
      <Preview>{t("Login with magic link")}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`${baseUrl}/static/kodix-logo.png`}
            width={48}
            height={48}
            alt="kodix"
          />
          <Heading style={heading}>🪄 Your magic link</Heading>
          <Section style={body}>
            <Text style={paragraph}>
              <Link style={link} href={magicLink}>
                👉 {t("Click here to sign in")} 👈
              </Link>
            </Text>
            <Text style={paragraph}>
              {t("If you didnt request this please ignore this email")}
            </Text>
          </Section>
          <Text style={paragraph}>
            {t("Best regards Kodix team custom", {
              custom: (
                <>
                  <br />- Kodix Team
                </>
              ),
            })}
            ,
          </Text>
          <Hr style={hr} />
          <Img
            src={`${baseUrl}/static/kodix-logo.png`}
            width={32}
            height={32}
            style={{
              WebkitFilter: "grayscale(100%)",
              filter: "grayscale(100%)",
              margin: "20px 0",
            }}
          />
          {/* <Text style={footer}>kodix Technologies Inc.</Text>
          <Text style={footer}>
            2093 Philadelphia Pike #3222, Claymont, DE 19703
          </Text> */}
        </Container>
      </Body>
    </Html>
  );
};

export default VerificationRequestEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 25px 48px",
  backgroundImage: 'url("/assets/kodix-bg.png")',
  backgroundPosition: "bottom",
  backgroundRepeat: "no-repeat, no-repeat",
};

const heading = {
  fontSize: "28px",
  fontWeight: "bold",
  marginTop: "48px",
};

const body = {
  margin: "24px 0",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
};

const link = {
  color: "#FF6363",
};

const hr = {
  borderColor: "#dddddd",
  marginTop: "48px",
};

// const footer = {
//   color: "#8898aa",
//   fontSize: "12px",
//   marginLeft: "4px",
// };
