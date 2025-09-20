import { useRouter } from "expo-router";
import { H3, Spinner, Text, View } from "tamagui";

import { kodixCareAppId } from "@kdx/shared/db";

import { defaultPadding, RootSafeAreaView } from "~/components/safe-area-view";
import { api } from "~/utils/api";
import { useAuth } from "~/utils/auth";

export default function Tab() {
  const { user } = useAuth();

  const router = useRouter();

  const myRolesQuery = api.team.appRole.getMyRoles.useQuery({
    appId: kodixCareAppId,
  });
  if (!user) {
    router.replace("/");
    return null;
  }
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

  return (
    <View
      backgroundColor={"$background"}
      f={1}
      px={defaultPadding}
      jc={"center"}
    >
      <H3 textAlign="center" color={"$color11"}>
        Você não é um administrador ou cuidador. Não é possível visualizar esta
        página sem essas permissões ainda
      </H3>
    </View>
  );

  // return <HomeView />;
}

// function HomeView() {
//   const [refreshing, setRefreshing] = React.useState(false);
//   const utils = api.useUtils();

//   usePushNotifications();

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await utils.app.kodixCare.invalidate();
//     setRefreshing(false);
//   };

//   const kodixCareQueryKey = getQueryKey(api.app.kodixCare);
//   const isFetching = useIsFetching({
//     queryKey: kodixCareQueryKey,
//   });
//   const isMutating = useIsMutating({
//     mutationKey: kodixCareQueryKey,
//   });

//   return (
//     <View backgroundColor={"$background"} f={1} gap="$4">
//       <ScrollView
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//       >
//         <CurrentShift />
//         <View mt={"$6"}>{isFetching || isMutating ? <Spinner /> : null}</View>
//       </ScrollView>
//       <CareTasksLists />
//     </View>
//   );
// }
