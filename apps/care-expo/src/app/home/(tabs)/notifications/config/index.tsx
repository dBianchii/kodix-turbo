import { useState } from "react";
import { Stack } from "expo-router";
import { AlertCircle } from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import {
  H2,
  ListItem,
  SizableText,
  Spinner,
  Switch,
  useTheme,
  View,
  YGroup,
} from "tamagui";

import { getErrorMessage, kodixCareAppId } from "@kdx/shared";

import { defaultPadding } from "~/components/safe-area-view";
import { api } from "~/utils/api";

export default function Config() {
  const theme = useTheme();

  const getUserAppTeamConfigQuery = api.app.getUserAppTeamConfig.useQuery(
    {
      appId: kodixCareAppId,
    },
    {
      staleTime: Infinity,
    },
  );

  if (!getUserAppTeamConfigQuery.data)
    return (
      <View backgroundColor={"$background"} f={1} jc="center" ai="center">
        <Spinner />
      </View>
    );

  return (
    <View backgroundColor={"$background"} f={1} p={defaultPadding}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "",
          headerTintColor: theme.color.val,
          headerStyle: {
            backgroundColor: theme.background.val,
          },
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
        message: getErrorMessage(err),
        variant: "error",
        customData: {
          variant: "error",
        },
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
          title={"Tarefas críticas"}
          onPress={handleSave}
          subTitle={
            <SizableText size={"$2"} color={"$gray11Dark"} lineHeight={"$1"}>
              Receber notificações de tarefas críticas que estão atrasadas.
            </SizableText>
          }
          iconAfter={
            <View>
              <Switch
                defaultChecked={initialSendNotificationsForDelayedTasks}
                checked={sendNotificationsForDelayedTasks}
                onCheckedChange={handleSave}
              >
                <Switch.Thumb animation="quicker" />
              </Switch>
            </View>
          }
        />
      </YGroup.Item>
    </YGroup>
  );
}
