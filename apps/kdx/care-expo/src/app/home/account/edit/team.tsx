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
              <YGroup alignSelf="center" width={"100%"}>
                {data
                  ?.filter((x) => x.id === user.activeTeamId)
                  .map((team) => (
                    <MenuListItem
                      iconAfter={<ArrowRight opacity={0} />}
                      key={team.id}
                      opacity={0.5}
                      pressTheme={false}
                      py={"$3"}
                    >
                      <XStack ai="center" f={1} jc={"space-between"}>
                        <AvatarWrapper fallback={team.name} size={"$3"} />
                        <SizableText
                          fontFamily={"$silkscreen"}
                          fontWeight={"$7"}
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
                        animatePresence
                        color={"$color10"}
                        size={"$1"}
                      />
                    </ElasticSpinnerView>
                  ) : null}
                </XStack>
                <YGroup alignSelf="center" width={"100%"}>
                  <FlatList
                    data={data?.filter((x) => x.id !== user.activeTeamId)}
                    keyExtractor={(item) => item.id}
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
                        <XStack ai="center" f={1} jc={"space-between"}>
                          <AvatarWrapper fallback={team.name} size={"$3"} />
                          <SizableText
                            fontFamily={"$silkscreen"}
                            fontWeight={"$7"}
                          >
                            {team.name}
                          </SizableText>
                        </XStack>
                      </MenuListItem>
                    )}
                    scrollEnabled={(data?.length ?? 0) >= 6}
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
