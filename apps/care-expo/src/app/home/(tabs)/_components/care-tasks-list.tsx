import React, { useMemo, useState } from "react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  useForm,
} from "~/components/form";
import { SheetModal } from "~/components/sheet-modal";
import { api } from "~/utils/api";

type CareTaskOrCalendarTask =
  RouterOutputs["app"]["kodixCare"]["getCareTasks"][number];

export function CaretasksList() {
  const careTasksQuery = api.app.kodixCare.getCareTasks.useQuery({
    dateStart: dayjs.utc().add(2, "days").startOf("day").toDate(),
    dateEnd: dayjs.utc().add(2, "days").endOf("day").toDate(),
  });
  const saveCareTaskMutation = api.app.kodixCare.saveCareTask.useMutation();

  const [position, setPosition] = useState(1);
  const [editCareTaskSheetOpen, setEditCareTaskSheetOpen] = useState(false);

  const [currentlyEditing, setCurrentlyEditing] =
    useState<CareTaskOrCalendarTask["id"]>(null);
  const currentlyEditingCareTask = useMemo(() => {
    if (!careTasksQuery.data?.length) return undefined;
    return careTasksQuery.data.find((x) => x.id === currentlyEditing);
  }, [currentlyEditing, careTasksQuery.data]);

  const borderTopRadius = "$6";
  return (
    <>
      {currentlyEditingCareTask && (
        <EditCareTaskSheet
          task={currentlyEditingCareTask}
          mutation={saveCareTaskMutation}
          open={editCareTaskSheetOpen}
          setOpen={setEditCareTaskSheetOpen}
        />
      )}
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
                  setCurrentlyEditing={setCurrentlyEditing}
                  setEditCareTaskSheetOpen={setEditCareTaskSheetOpen}
                />
              ))}
            </ScrollView>
          )}
        </Sheet.Frame>
      </Sheet>
    </>
  );
}

function EditCareTaskSheet({
  task,
  mutation,
  open,
  setOpen,
}: {
  task: CareTaskOrCalendarTask;
  mutation: ReturnType<typeof api.app.kodixCare.saveCareTask.useMutation>;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const form = useForm({
    schema: ZSaveCareTaskInputSchema.pick({
      id: true,
      details: true,
      doneAt: true,
    }),
  });

  return (
    <SheetModal open={open} setOpen={setOpen}>
      <Form {...form}>
        <FormField
          control={form.control}
          name="details"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TextArea
                  id={Math.random().toString()}
                  {...field}
                  onChange={field.onChange}
                  value={field.value ?? undefined}
                  borderWidth={0}
                  backgroundColor={"$color3"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>
    </SheetModal>
  );
}

function CareTaskItem({
  task,
  setEditCareTaskSheetOpen,
  setCurrentlyEditing,
}: {
  task: RouterOutputs["app"]["kodixCare"]["getCareTasks"][number];
  setEditCareTaskSheetOpen: (open: boolean) => void;
  setCurrentlyEditing: (id: string) => void;
}) {
  const format = useFormatter();
  return (
    <>
      <TouchableOpacity
        onPress={() => {
          setCurrentlyEditing(task.id);
          setEditCareTaskSheetOpen(true);
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
