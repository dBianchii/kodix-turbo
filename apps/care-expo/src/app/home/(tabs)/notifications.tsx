import { FlatList } from "react-native";
import { Stack } from "expo-router";
import { H3, ListItem, Spinner, View, YGroup } from "tamagui";

import { RootSafeAreaView } from "~/components/safe-area-view";
import { api } from "~/utils/api";

export default function NotificationsTab() {
  const { data: notifications, isLoading } = api.user.getNotifications.useQuery(
    {},
  );

  if (isLoading)
    return (
      <RootSafeAreaView jc="center" f={1} ai="center">
        <Spinner />
      </RootSafeAreaView>
    );

  return (
    <RootSafeAreaView>
      <Stack.Screen options={{ headerShown: false }} />
      {notifications?.data.length === 0 ? (
        <View jc="center" f={1} ai="center">
          <H3 color={"$color11"} textAlign="center">
            Nenhuma notificação no momento...
          </H3>
        </View>
      ) : (
        <YGroup alignSelf="center" bordered width={240} size="$4">
          <FlatList
            data={notifications?.data ?? []}
            renderItem={({ item: notification }) => (
              <YGroup.Item>
                <ListItem hoverTheme title="Star" subTitle="Twinkles" />
              </YGroup.Item>
            )}
            keyExtractor={(item) => item.id}
          />
        </YGroup>
      )}
    </RootSafeAreaView>
  );
}
