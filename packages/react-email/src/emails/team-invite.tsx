import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import { getI18n } from "@kdx/locales/server";

export const TeamInvite = async ({
  username = "User",
  invitedByUsername = "",
  invitedByEmail = "bukinoshita@example.com",
  teamName = "My Project",
  inviteLink = "https://kodix.com/teams/invite/foo",
  inviteFromIp = "204.13.186.218",
  inviteFromLocation = "São Paulo, Brazil",
}: {
  username?: string;
  userImage?: string;
  invitedByUsername?: string;
  invitedByEmail?: string;
  teamName?: string;
  teamImage?: string;
  inviteLink?: string;
  inviteFromIp?: string;
  inviteFromLocation?: string;
}) => {
  const t = await getI18n();
  const previewText = t("emails.Join invitedByUsername on Kodix", {
    invitedByUsername,
  });

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-[40px] w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Section className="mt-[32px]">
              <Text className="text-bold text-balance bg-gradient-to-br from-black from-30% to-black/80 bg-clip-text text-center text-xl font-semibold leading-none tracking-tighter ">
                Kodix
              </Text>
            </Section>
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              {t("emails.Join teamName on Kodix", {
                teamName: <strong>{teamName}</strong>,
                site: "Kodix",
              })}
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              {t("Hello")} {username},
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
              <strong>{invitedByUsername}</strong> (
              <Link
                href={`mailto:${invitedByEmail}`}
                className="text-blue-600 no-underline"
              >
                {invitedByEmail}
              </Link>
              ){" "}
              {t("emails.Has invited you to the teamName team on Kodix", {
                teamName: <strong>{teamName}</strong>,
                site: "Kodix",
              })}
            </Text>
            {/* <Section>
              <Row>
                <Column align="right">
                  <Img
                    className="rounded-full"
                    src={userImage}
                    width="64"
                    height="64"
                  />
                </Column>
                <Column align="center">
                  <Img
                    src={`${baseUrl}/static/kodix-arrow.png`}
                    width="12"
                    height="9"
                    alt="invited you to"
                  />
                </Column>
                <Column align="left">
                  <Img
                    className="rounded-full"
                    src={teamImage}
                    width="64"
                    height="64"
                  />
                </Column>
              </Row>
            </Section> */}
            <Section className="mb-[32px] mt-[32px] text-center">
              <Button
                className="rounded bg-[#000000] px-[20px] py-[12px] text-center text-[12px] font-semibold text-white no-underline"
                href={inviteLink}
              >
                {t("emails.Join the team")}
              </Button>
            </Section>
            <Text className="text-[14px] leading-[24px] text-black">
              {t("or copy and paste this URL into your browser:")}{" "}
              <Link href={inviteLink} className="text-blue-600 no-underline">
                {inviteLink}
              </Link>
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[12px] leading-[24px] text-[#666666]">
              {t("emails.This invitation was intended for")}{" "}
              <span className="text-black">{username} </span>.
              {t("emails.This invite was sent from")}{" "}
              <span className="text-black">{inviteFromIp}</span>{" "}
              {t("emails.located in")}{" "}
              <span className="text-black">{inviteFromLocation}</span>.{" "}
              {t(
                "emails.If you were not expecting this invitation you can ignore this email",
              )}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default TeamInvite;
