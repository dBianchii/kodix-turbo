import { FlatList, RefreshControl } from "react-native";
import { Cog } from "@tamagui/lucide-icons";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { H3, ListItem, Spinner, useTheme, View, XStack, YGroup } from "tamagui";

import { defaultPadding, RootSafeAreaView } from "~/components/safe-area-view";
import { api } from "~/utils/api";
import { useAuth } from "~/utils/auth";

function NotificationsHeader() {
  const theme = useTheme();
  return (
    <SafeAreaView
      style={{ backgroundColor: theme.background.val, paddingVertical: 5 }}
    >
      <XStack jc={"flex-end"} mx={defaultPadding} my={"$3"}>
        <Link href={"/home/notifications/config"} asChild>
          <Cog color={"$gray11Dark"} size={"$2"} />
        </Link>
      </XStack>
    </SafeAreaView>
  );
}

export default function NotificationsTab() {
  const { user } = useAuth();
  const router = useRouter();

  const {
    data: notifications,
    isLoading,
    isRefetching,
  } = api.user.getNotifications.useQuery(
    {
      channel: "PUSH_NOTIFICATIONS",
      teamId: user?.activeTeamId,
    },
    {
      enabled: !!user,
    },
  );

  const utils = api.useUtils();
  if (!user) return router.push("/");

  if (isLoading)
    return (
      <>
        <NotificationsHeader />
        <RootSafeAreaView jc="center" f={1} ai="center">
          <Spinner />
        </RootSafeAreaView>
      </>
    );

  return (
    <>
      <NotificationsHeader />
      <View backgroundColor={"$background"} f={1}>
        {!notifications?.data.length ? (
          <View jc="center" f={1} ai="center">
            <H3 color={"$color11"} textAlign="center">
              Nenhuma notificação no momento...
            </H3>
          </View>
        ) : (
          <YGroup alignSelf="center" bordered w={"100%"}>
            <FlatList
              keyExtractor={(item, idx) => item.id + idx}
              data={notifications.data}
              refreshControl={
                <RefreshControl
                  refreshing={isRefetching}
                  onRefresh={() => {
                    void utils.user.getNotifications.invalidate();
                  }}
                />
              }
              renderItem={({ item }) => (
                <YGroup.Item>
                  <ListItem hoverTheme title={item.message} />
                </YGroup.Item>
              )}
            />
          </YGroup>
        )}
      </View>
    </>
  );
}
