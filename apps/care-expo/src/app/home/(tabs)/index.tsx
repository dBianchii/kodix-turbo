import React from "react";
import { RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { H3, ScrollView, Spinner, Text, View } from "tamagui";

import { kodixCareAppId, kodixCareRoleDefaultIds } from "@kdx/shared";

import { defaultPadding, RootSafeAreaView } from "~/components/safe-area-view";
import { api } from "~/utils/api";
import { useAuth } from "~/utils/auth";
import { usePushNotifications } from "~/utils/usePushNotifications";
import { CareTasksLists } from "./_components/care-tasks-list";
import { CurrentShift } from "./_components/shifts";

export default function Tab() {
  const { user } = useAuth();

  const router = useRouter();
  if (!user) {
    router.replace("/");
    return null;
  }

  const myRolesQuery = api.team.appRole.getMyRoles.useQuery({
    appId: kodixCareAppId,
  });
  // const getCurrentShiftQuery =
  //   api.app.kodixCare.getCurrentShift.useQuery(undefined);

  if (
    myRolesQuery.isLoading ||
    !myRolesQuery.data
    // getCurrentShiftQuery.isLoading
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
    !myRolesQuery.data.some((role) =>
      ROLES_ALLOWED_TO_VIEW.includes(role.appRoleDefaultId),
    )
  )
    return (
      <View
        backgroundColor={"$background"}
        f={1}
        px={defaultPadding}
        jc={"center"}
      >
        <H3 textAlign="center" color={"$color11"}>
          Você não é um administrador ou cuidador. Não é possível visualizar
          esta página sem essas permissões ainda
        </H3>
      </View>
    );

  return <HomeView />;
}

function HomeView() {
  const [refreshing, setRefreshing] = React.useState(false);
  const utils = api.useUtils();

  usePushNotifications();

  const onRefresh = async () => {
    setRefreshing(true);
    await utils.app.kodixCare.invalidate();
    setRefreshing(false);
  };

  const kodixCareQueryKey = getQueryKey(api.app.kodixCare);
  const isFetching = useIsFetching({
    queryKey: kodixCareQueryKey,
  });
  const isMutating = useIsMutating({
    mutationKey: kodixCareQueryKey,
  });

  return (
    <View backgroundColor={"$background"} f={1} gap="$4">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <CurrentShift />
        <View mt={"$6"}>{isFetching || isMutating ? <Spinner /> : null}</View>
      </ScrollView>
      <CareTasksLists />
    </View>
  );
}
