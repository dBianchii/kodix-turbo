import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { Check as CheckIcon } from "@tamagui/lucide-icons";
import {
  Checkbox,
  ScrollView,
  Sheet,
  SizableText,
  Spinner,
  Text,
  TextArea,
  View,
  XStack,
  YStack,
} from "tamagui";
import { useFormatter } from "use-intl";

import dayjs from "@kdx/dayjs";
import { ZSaveCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare";

import type { RouterOutputs } from "~/utils/api";
import { useForm } from "~/components/form";
import { api } from "~/utils/api";
import { useIsKeyBoardVisible } from "~/utils/hooks";

export function CaretasksList() {
  const careTasksQuery = api.app.kodixCare.getCareTasks.useQuery({
    dateStart: dayjs.utc().add(2, "days").startOf("day").toDate(),
    dateEnd: dayjs.utc().add(2, "days").endOf("day").toDate(),
  });

  const [position, setPosition] = useState(1);

  const borderTopRadius = "$6";
  return (
    <Sheet
      forceRemoveScrollEnabled
      open
      snapPoints={[100, 65]}
      snapPointsMode={"percent"}
      position={position}
      onPositionChange={setPosition}
      zIndex={2}
      animation="medium"
      native
      animationConfig={{
        type: "spring",
        damping: 10,
        mass: 0.3,
      }}
    >
      <Sheet.Frame
        borderTopLeftRadius={borderTopRadius}
        borderTopRightRadius={borderTopRadius}
        ai="center"
        borderColor={"$color6"}
        backgroundColor="$color3"
        borderWidth={1}
        borderBottomWidth={0}
      >
        {careTasksQuery.isLoading || !careTasksQuery.data ? (
          <Spinner mt="$20" />
        ) : (
          <ScrollView f={1} w="100%" p={"$3"}>
            {careTasksQuery.data.map((task, i) => (
              <CareTaskItem
                key={`${task.id}${task.title}${task.description}${i}`}
                task={task}
              />
            ))}
          </ScrollView>
        )}
      </Sheet.Frame>
    </Sheet>
  );
}

function CareTaskItem({
  task,
}: {
  task: RouterOutputs["app"]["kodixCare"]["getCareTasks"][number];
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const form = useForm({
    schema: ZSaveCareTaskInputSchema,
  });
  const isKeyboardVisible = useIsKeyBoardVisible();
  const [position, setPosition] = useState(1);
  useEffect(() => {
    if (isKeyboardVisible) {
      setPosition(0);
    } else {
      setPosition(1);
    }
  }, [isKeyboardVisible]);

  const format = useFormatter();
  return (
    <>
      <Sheet
        forceRemoveScrollEnabled={sheetOpen}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        position={position}
        snapPoints={[100, 45]}
        snapPointsMode={"percent"}
        zIndex={100_000}
        dismissOnSnapToBottom
        animation="medium"
        animationConfig={{
          type: "spring",
          damping: 10,
          mass: 0.3,
        }}
        modal
        native
      >
        <Sheet.Overlay
          animation="medium"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Frame
          p={"$2"}
          ai="center"
          borderColor={"$color6"}
          backgroundColor="$color3"
          borderWidth={1}
          borderBottomWidth={0}
        >
          <TextArea
            onChange={() => {}}
            value={task.title ?? ""}
            borderWidth={0}
            backgroundColor={"$color3"}
          />
        </Sheet.Frame>
      </Sheet>
      <TouchableOpacity
        onPress={() => {
          setSheetOpen(true);
        }}
      >
        <XStack mb="$2" ai={"center"} gap="$3" maxWidth={"100%"}>
          <Checkbox
            size={"$7"}
            onCheckedChange={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Checkbox.Indicator>
              <CheckIcon />
            </Checkbox.Indicator>
          </Checkbox>
          <YStack maxWidth={"$18"}>
            <Text numberOfLines={1}>{task.title}</Text>
            <SizableText numberOfLines={1} size="$2" color="$gray11Dark">
              {task.description}
            </SizableText>
          </YStack>
          <View ml="auto">
            <SizableText size="$2" color="$gray11Dark" textAlign="center">
              {format.dateTime(task.date, {
                day: "numeric",
                month: "short",
              })}
            </SizableText>
            <SizableText size="$2" color="$gray11Dark" textAlign="center">
              {format.dateTime(task.date, {
                hour: "numeric",
                minute: "numeric",
              })}
            </SizableText>
          </View>
        </XStack>
      </TouchableOpacity>
    </>
  );
}
