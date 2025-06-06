import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import type { IsomorficT } from "@kdx/locales";
import { getBaseUrl } from "@kdx/shared";

import type { TMock } from "./utils";
import { tMock } from "./utils";

const baseUrl = getBaseUrl();

export const TeamInvite = ({
  username = "User",
  // userImage = `${baseUrl}/static/kodix-user.png`,
  invitedByUsername = "",
  invitedByEmail = "bukinoshita@example.com",
  teamName = "My Project",
  // teamImage = `${baseUrl}/static/kodix-team.png`,
  inviteLink = "https://kodix.com/teams/invite/foo",
  inviteFromIp = "204.13.186.218",
  // inviteFromLocation = "São Paulo, Brazil",
  t = tMock,
}: {
  username: string;
  // userImage: string;
  invitedByUsername: string;
  invitedByEmail?: string;
  teamName: string;
  // teamImage: string;
  inviteLink: string;
  inviteFromIp: string;
  // inviteFromLocation: string;
  t: IsomorficT | TMock;
}) => {
  const previewText = t("api.emails.Join invitedByUsername on Kodix", {
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
              <Img
                src={`${baseUrl}/kodix-logo.svg`}
                width="200"
                alt="Kodix"
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              {t.rich("api.emails.Join teamName on Kodix", {
                teamName: () => <strong>{teamName}</strong>,
                site: "Kodix",
              })}
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              {t("api.emails.Hello")} {username},
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
              {t.rich(
                "api.emails.Has invited you to the teamName team on Kodix",
                {
                  teamName: () => <strong>{teamName}</strong>,
                  site: "Kodix",
                },
              )}
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
            <Section className="mt-[32px] mb-[32px] text-center">
              <Button
                className="rounded bg-[#000000] px-[20px] py-[12px] text-center text-[12px] font-semibold text-white no-underline"
                href={inviteLink}
              >
                {t("api.emails.Join the team")}
              </Button>
            </Section>
            <Text className="text-[14px] leading-[24px] text-black">
              {t("api.emails.or copy and paste this URL into your browser:")}{" "}
              <Link href={inviteLink} className="text-blue-600 no-underline">
                {inviteLink}
              </Link>
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[12px] leading-[24px] text-[#666666]">
              {t("api.emails.This invitation was intended for")}{" "}
              <span className="text-black">{username} </span>.
              {t("api.emails.This invite was sent from")}{" "}
              <span className="text-black">{inviteFromIp}</span>{" "}
              {/* {t("api.emails.located in")}{" "}
              <span className="text-black">{inviteFromLocation}</span>.{" "} */}
              {t(
                "api.emails.If you were not expecting this invitation you can ignore this email",
              )}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default TeamInvite;
