import { FlatList, RefreshControl } from "react-native";
import { useTheme, View } from "@tamagui/core";
import { YGroup } from "@tamagui/group";
import { ListItem } from "@tamagui/list-item";
import { Cog } from "@tamagui/lucide-icons";
import { XStack } from "@tamagui/stacks";
import { H3 } from "@tamagui/text";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { defaultPadding, RootSafeAreaView } from "~/components/safe-area-view";
import { Spinner } from "~/components/spinner";
import { api } from "~/utils/api";
import { useAuth } from "~/utils/auth";

function NotificationsHeader() {
  const theme = useTheme();
  return (
    <SafeAreaView
      style={{ backgroundColor: theme.background.val, paddingVertical: 5 }}
    >
      <XStack jc={"flex-end"} mx={defaultPadding} my={"$3"}>
        <Link asChild href={"/home/notifications/config"}>
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
        <RootSafeAreaView ai="center" f={1} jc="center">
          <Spinner />
        </RootSafeAreaView>
      </>
    );

  return (
    <>
      <NotificationsHeader />
      <View backgroundColor={"$background"} f={1}>
        {notifications?.data.length ? (
          <YGroup alignSelf="center" bordered w={"100%"}>
            <FlatList
              data={notifications.data}
              keyExtractor={(item, idx) => item.id + idx}
              refreshControl={
                <RefreshControl
                  onRefresh={() => {
                    void utils.user.getNotifications.invalidate();
                  }}
                  refreshing={isRefetching}
                />
              }
              renderItem={({ item }) => (
                <YGroup.Item>
                  <ListItem hoverTheme title={item.message} />
                </YGroup.Item>
              )}
            />
          </YGroup>
        ) : (
          <View ai="center" f={1} jc="center">
            <H3 color={"$color11"} textAlign="center">
              Nenhuma notificação no momento...
            </H3>
          </View>
        )}
      </View>
    </>
  );
}
