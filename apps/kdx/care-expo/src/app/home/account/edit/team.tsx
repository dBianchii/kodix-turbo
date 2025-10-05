import { FlatList, Pressable } from "react-native";
import { ArrowRight, ChevronLeft, RefreshCw } from "@tamagui/lucide-icons";
import { router, Stack } from "expo-router";
import {
  H4,
  SizableText,
  Spinner,
  useTheme,
  View,
  XStack,
  YGroup,
  YStack,
} from "tamagui";

import { AvatarWrapper } from "~/components/avatar-wrapper";
import { ElasticSpinnerView } from "~/components/loading-spinner";
import { MenuListItem } from "~/components/menu-list-item";
import { defaultPadding } from "~/components/safe-area-view";
import { api } from "~/utils/api";
import { useAuth } from "~/utils/auth";

export default function EditTeamPage() {
  const utils = api.useUtils();
  const { data, isLoading } = api.team.getAll.useQuery();
  const mutation = api.user.switchActiveTeam.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      router.back();
    },
  });

  const theme = useTheme();
  const { user } = useAuth();
  if (!user) return null;

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable
              onPress={() => {
                router.back();
              }}
            >
              <ChevronLeft size={"$2"} />
            </Pressable>
          ),
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.background.val,
          },
          headerTitleStyle: {
            color: theme.color.val,
          },
          title: "Alterar time",
        }}
      />

      <View bg={"$background"} f={1}>
        <View mx={defaultPadding} py={"$4"}>
          {isLoading ? (
            <Spinner />
          ) : (
            <YStack>
              <H4>Time atual</H4>
              <YGroup width={"100%"} alignSelf="center">
                {data
                  ?.filter((x) => x.id === user.activeTeamId)
                  .map((team) => (
                    <MenuListItem
                      pressTheme={false}
                      opacity={0.5}
                      key={team.id}
                      iconAfter={<ArrowRight opacity={0} />}
                      py={"$3"}
                    >
                      <XStack jc={"space-between"} f={1} ai="center">
                        <AvatarWrapper fallback={team.name} size={"$3"} />
                        <SizableText
                          fontWeight={"$7"}
                          fontFamily={"$silkscreen"}
                        >
                          {team.name}
                        </SizableText>
                      </XStack>
                    </MenuListItem>
                  ))}
              </YGroup>

              <View mt={"$5"}>
                <XStack ai={"center"} gap={"$3"}>
                  <H4>Alterar time</H4>
                  {mutation.isPending ? (
                    <ElasticSpinnerView>
                      <RefreshCw
                        size={"$1"}
                        color={"$color10"}
                        animatePresence
                      />
                    </ElasticSpinnerView>
                  ) : null}
                </XStack>
                <YGroup width={"100%"} alignSelf="center">
                  <FlatList
                    scrollEnabled={(data?.length ?? 0) >= 6}
                    data={data?.filter((x) => x.id !== user.activeTeamId)}
                    renderItem={({ item: team }) => (
                      <MenuListItem
                        iconAfter={ArrowRight}
                        onPress={() => {
                          mutation.mutate({
                            teamId: team.id,
                          });
                        }}
                        py={"$3"}
                      >
                        <XStack jc={"space-between"} f={1} ai="center">
                          <AvatarWrapper fallback={team.name} size={"$3"} />
                          <SizableText
                            fontWeight={"$7"}
                            fontFamily={"$silkscreen"}
                          >
                            {team.name}
                          </SizableText>
                        </XStack>
                      </MenuListItem>
                    )}
                    keyExtractor={(item) => item.id}
                  />
                </YGroup>
              </View>
            </YStack>
          )}
        </View>
      </View>
    </>
  );
}
