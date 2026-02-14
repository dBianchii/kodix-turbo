import { useState } from "react";
import { kodixCareAppId } from "@kodix/shared/db";
import { getErrorMessage } from "@kodix/shared/utils";
import { useTheme, View } from "@tamagui/core";
import { YGroup } from "@tamagui/group";
import { ListItem } from "@tamagui/list-item";
import { AlertCircle } from "@tamagui/lucide-icons";
import { Switch } from "@tamagui/switch";
import { H2, SizableText } from "@tamagui/text";
import { useToastController } from "@tamagui/toast";
import { Stack } from "expo-router";

import { defaultPadding } from "~/components/safe-area-view";
import { Spinner } from "~/components/spinner";
import { api } from "~/utils/api";

export default function Config() {
  const theme = useTheme();

  const getUserAppTeamConfigQuery = api.app.getUserAppTeamConfig.useQuery(
    {
      appId: kodixCareAppId,
    },
    {
      staleTime: Number.POSITIVE_INFINITY,
    },
  );

  if (!getUserAppTeamConfigQuery.data)
    return (
      <View ai="center" backgroundColor={"$background"} f={1} jc="center">
        <Spinner />
      </View>
    );

  return (
    <View backgroundColor={"$background"} f={1} p={defaultPadding}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.background.val,
          },
          headerTintColor: theme.color.val,
          headerTitle: "",
        }}
      />

      <H2 pb={"$4"}>Notificações</H2>

      <NotificationSettingsForm
        initialSendNotificationsForDelayedTasks={
          !!getUserAppTeamConfigQuery.data.sendNotificationsForDelayedTasks
        }
      />
    </View>
  );
}

function NotificationSettingsForm({
  initialSendNotificationsForDelayedTasks,
}: {
  initialSendNotificationsForDelayedTasks: boolean;
}) {
  const toast = useToastController();
  const mutation = api.app.saveUserAppTeamConfig.useMutation({
    onError: (err) => {
      toast.show("Um erro ocorreu", {
        customData: {
          variant: "error",
        },
        message: getErrorMessage(err),
        variant: "error",
      });
    },
  });
  const [
    sendNotificationsForDelayedTasks,
    setSendNotificationsForDelayedTasks,
  ] = useState(initialSendNotificationsForDelayedTasks);

  const handleSave = () => {
    setSendNotificationsForDelayedTasks((prev) => !prev);
    mutation.mutate({
      appId: kodixCareAppId,
      config: {
        sendNotificationsForDelayedTasks: !sendNotificationsForDelayedTasks,
      },
    });
  };

  return (
    <YGroup alignSelf="center" bordered size="$4">
      <YGroup.Item>
        <ListItem
          icon={
            <AlertCircle
              color={
                sendNotificationsForDelayedTasks ? "orange" : "$gray11Dark"
              }
              size={"$2"}
            />
          }
          iconAfter={
            <View>
              <Switch
                checked={sendNotificationsForDelayedTasks}
                defaultChecked={initialSendNotificationsForDelayedTasks}
                onCheckedChange={handleSave}
              >
                <Switch.Thumb animation="quicker" />
              </Switch>
            </View>
          }
          onPress={handleSave}
          subTitle={
            <SizableText color={"$gray11Dark"} lineHeight={"$1"} size={"$2"}>
              Receber notificações de tarefas críticas que estão atrasadas.
            </SizableText>
          }
          title={"Tarefas críticas"}
        />
      </YGroup.Item>
    </YGroup>
  );
}
