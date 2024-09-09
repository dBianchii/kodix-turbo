import React from "react";
import { Easing } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { ArrowRight, UserCircle2 } from "@tamagui/lucide-icons";
import { MotiView } from "moti";
import {
  H4,
  Paragraph,
  SizableText,
  Spinner,
  styled,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";
import { useFormatter } from "use-intl";

import { kodixCareAppId, kodixCareRoleDefaultIds } from "@kdx/shared";
import { useRerenderForRelativeTime } from "@kdx/ui/hooks";

import type { RouterOutputs } from "~/utils/api";
import { AvatarWrapper } from "~/components/avatar-wrapper";
import { defaultPadding, RootSafeAreaView } from "~/components/safe-area-view";
import { api } from "~/utils/api";
import { useAuth } from "~/utils/auth";
import { ToggleShiftButton } from "./_components/toggle-shift-button";

export default function Tab() {
  const { user } = useAuth();

  const router = useRouter();
  if (!user) return router.replace("/");

  const myRolesQuery = api.team.appRole.getMyRoles.useQuery({
    appId: kodixCareAppId,
  });
  const getCurrentShiftQuery =
    api.app.kodixCare.getCurrentShift.useQuery(undefined);

  if (
    myRolesQuery.isLoading ||
    !myRolesQuery.data ||
    getCurrentShiftQuery.isLoading
  )
    return (
      <RootSafeAreaView f={1} jc={"center"} ai={"center"}>
        <Spinner />
      </RootSafeAreaView>
    );

  if (myRolesQuery.error) {
    return (
      <RootSafeAreaView f={1} jc={"center"} ai={"center"}>
        <Text>Something went wrong</Text>
      </RootSafeAreaView>
    );
  }

  const ROLES_ALLOWED_TO_VIEW: string[] = [
    kodixCareRoleDefaultIds.admin,
    kodixCareRoleDefaultIds.careGiver,
  ] as const;

  if (
    myRolesQuery.data.some((role) =>
      ROLES_ALLOWED_TO_VIEW.includes(role.appRoleDefaultId),
    )
  )
    return <HomeView />;

  // const allowed
  // if (
  //   myRolesQuery.data[0]?.appRoleDefaultId ===
  //     kodixCareRoleDefaultIds.careGiver ||
  //   myRolesQuery.data[0]?.appRoleDefaultId === kodixCareRoleDefaultIds.careGiver
  // ) {
  //   return <HomeView />;
  // }
}

function HomeView() {
  //se nao tiver shift é pq nao tem nenhum historico de shift.
  //Se tiver shift mas nao tiver shiftEndedAt é pq o shift ta em progresso
  //Se tiver shift e tiver shiftEndedAt é pq o shift acabou

  return (
    <View backgroundColor={"$background"} f={1} px={defaultPadding}>
      <CurrentShift />
    </View>
  );
}

function CurrentShift() {
  const query = api.app.kodixCare.getCurrentShift.useQuery(undefined);

  if (!query.data) return <NoPreviousShift />;
  if (!query.data.checkOut)
    return <ShiftInProgress currentShift={query.data} />;
  return <ShiftCheckedOut currentShift={query.data} />;
}

export function NoPreviousShift() {
  return (
    <YStack gap={"$2"}>
      <XStack>
        <H4>Turno atual</H4>
      </XStack>
      <XStack gap={"$3"}>
        <UserCircle2 />
        <Paragraph color="$gray11Dark">Nenhum turno inciado ainda</Paragraph>
      </XStack>
      <ToggleShiftButton />
    </YStack>
  );
}

const StyledMotiView = styled(MotiView, {});

export function ShiftInProgress({
  currentShift,
}: {
  currentShift: NonNullable<
    RouterOutputs["app"]["kodixCare"]["getCurrentShift"]
  >;
}) {
  function ActiveShiftIndicator() {
    return (
      <View
        theme="green"
        backgroundColor={"$green11Light"}
        borderColor={"$green10Dark"}
        borderRadius={"$3"}
        px={"$2"}
        py={0}
        jc={"center"}
        h={"$1"}
      >
        <SizableText size={"$1"} m={0} p={0}>
          Ativo
        </SizableText>
        <StyledMotiView
          position="absolute"
          alignSelf="center"
          zIndex={-1}
          theme="green"
          backgroundColor={"$green11Light"}
          borderColor={"$green10Dark"}
          borderRadius={"$3"}
          scale={1}
          from={{ opacity: 1, scale: 1, scaleX: 1 }}
          animate={{ opacity: 0, scale: 1.8, scaleX: 1.05 }}
          transition={
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            {
              loop: true,
              duration: 2000,
              easing: Easing.out(Easing.ease),
              repeatReverse: false,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any
          }
        >
          <SizableText size={"$1"} m={0} p={0} opacity={0}>
            Ativo
          </SizableText>
        </StyledMotiView>
      </View>
    );
  }
  return (
    <YStack gap={"$1"} ai={"center"}>
      <XStack gap={"$3"} jc="center" ai={"center"}>
        <H4 animate-ping>Turno atual</H4>
        <ActiveShiftIndicator />
      </XStack>
      <XStack gap={"$3"} ai={"center"} my={"$2"}>
        <AvatarWrapper
          size={"$4"}
          src={currentShift.Caregiver.image ?? undefined}
          fallback={currentShift.Caregiver.name}
        />
        <Paragraph color="$gray11Dark">{currentShift.Caregiver.name}</Paragraph>
      </XStack>
      <TimeInfo currentShift={currentShift} />
      <ToggleShiftButton />
    </YStack>
  );
}

export function ShiftCheckedOut({
  currentShift,
}: {
  currentShift: NonNullable<
    RouterOutputs["app"]["kodixCare"]["getCurrentShift"]
  >;
}) {
  return (
    <YStack gap={"$1"} ai={"center"}>
      <XStack gap={"$3"} jc="center" ai={"center"}>
        <H4 animate-ping>Turno atual</H4>
        <View
          theme="gray"
          backgroundColor={"$gray11Light"}
          borderColor={"$gray10Dark"}
          borderRadius={"$3"}
          px={"$2"}
          py={0}
          jc={"center"}
          h={"$1"}
        >
          <SizableText size={"$1"} m={0} p={0}>
            Finalizado
          </SizableText>
        </View>
      </XStack>
      <XStack gap={"$3"} ai={"center"} my={"$2"}>
        <AvatarWrapper
          size={"$4"}
          src={currentShift.Caregiver.image ?? undefined}
          fallback={currentShift.Caregiver.name}
        />
        <Paragraph color="$gray11Dark">{currentShift.Caregiver.name}</Paragraph>
      </XStack>
      <TimeInfo currentShift={currentShift} />
      <ToggleShiftButton />
    </YStack>
  );
}

function TimeInfo({
  currentShift,
}: {
  currentShift: NonNullable<
    RouterOutputs["app"]["kodixCare"]["getCurrentShift"]
  >;
}) {
  const format = useFormatter();

  useRerenderForRelativeTime([currentShift.checkIn, currentShift.checkOut]);

  return (
    <XStack gap={"$4"}>
      <YStack ai="center" jc="center" gap={"$2"}>
        <Text color={"$gray11Dark"}>Início</Text>
        <YStack
          ai="center"
          jc="center"
          backgroundColor={"$color4"}
          borderRadius={"$5"}
          p={"$1"}
        >
          <View px={"$2"} py={0} jc={"center"} h={"$1"}>
            <Text color={"$white075"}>
              {format.relativeTime(currentShift.checkIn, new Date())}
            </Text>
          </View>
        </YStack>
      </YStack>
      {currentShift.checkOut && (
        <>
          <YStack jc={"flex-end"}>
            <ArrowRight color={"$white10"} />
          </YStack>
          <YStack ai="center" jc="center" gap={"$2"}>
            <Text color={"$gray11Dark"}>Fim</Text>
            <YStack
              ai="center"
              jc="center"
              backgroundColor={"$color4"}
              borderRadius={"$5"}
              p={"$1"}
            >
              <View px={"$2"} py={0} jc={"center"} h={"$1"}>
                <Text color={"$white075"}>
                  {format.relativeTime(currentShift.checkOut, new Date())}
                </Text>
              </View>
            </YStack>
          </YStack>
        </>
      )}
    </XStack>
  );
}
