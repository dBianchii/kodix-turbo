import type { CareTask } from "node_modules/@kdx/api/dist/api/src/routers/app/kodixCare/getCareTasks.handler";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Keyboard, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import {
  ArrowRightLeft,
  Check as CheckIcon,
  Lock,
  Plus,
  Text as TextIcon,
} from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import {
  Button,
  Checkbox,
  H4,
  Input,
  Paragraph,
  ScrollView,
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
import { getErrorMessage } from "@kdx/shared";
import {
  ZCreateCareTaskInputSchema,
  ZSaveCareTaskInputSchema,
} from "@kdx/validators/trpc/app/kodixCare";

import type { RouterOutputs } from "~/utils/api";
import { DateTimePicker } from "~/components/date-time-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "~/components/form";
import { defaultPadding } from "~/components/safe-area-view";
import { SheetModal } from "~/components/sheet-modal";
import { api } from "~/utils/api";

type CareTaskOrCalendarTask =
  RouterOutputs["app"]["kodixCare"]["getCareTasks"][number];

export function CaretasksList() {
  const input = {
    dateStart: dayjs.utc().add(0, "days").startOf("day").toDate(),
    dateEnd: dayjs.utc().add(0, "days").endOf("day").toDate(),
  };
  const utils = api.useUtils();

  const careTasksQuery = api.app.kodixCare.getCareTasks.useQuery(input);
  const currentShift = api.app.kodixCare.getCurrentShift.useQuery();
  const syncCareTasksFromCalendarMutation =
    api.app.kodixCare.syncCareTasksFromCalendar.useMutation({
      onSettled: () => {
        void utils.app.kodixCare.invalidate();
      },
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

  const toast = useToastController();
  const saveCareTaskMutation = api.app.kodixCare.saveCareTask.useMutation({
    onMutate: async (savedCareTask) => {
      // Snapshot the previous value
      const previousCareTasks = utils.app.kodixCare.getCareTasks.getData();

      const previousTask = previousCareTasks?.find(
        (x) => x.id === savedCareTask.id,
      );
      if (!previousTask?.doneAt && savedCareTask.doneAt) {
        const { sound } = await Audio.Sound.createAsync(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-require-imports
          require("../../../../../assets/taskDone.mp3"),
        );
        void sound.playAsync();
      }

      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await utils.app.kodixCare.getCareTasks.cancel();

      // Optimistically update to the new value
      utils.app.kodixCare.getCareTasks.setData(input, (prev) => {
        return prev?.map((x) => {
          if (x.id === savedCareTask.id) {
            if (savedCareTask.doneAt !== undefined)
              x.doneAt = savedCareTask.doneAt;
            if (savedCareTask.doneByUserId !== undefined)
              x.doneByUserId = savedCareTask.doneByUserId;
            if (savedCareTask.details !== undefined)
              x.details = savedCareTask.details;
          }

          return x;
        });
      });

      // Return a context object with the snapshotted value
      return { previousCareTasks };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, __, context) => {
      utils.app.kodixCare.getCareTasks.setData(
        input,
        context?.previousCareTasks,
      );
      toast.show("Um erro ocorreu", {
        message: getErrorMessage(err),
        variant: "error",
        customData: {
          variant: "error",
        },
      });
    },
    // Always refetch after error or success:
    onSettled: () => {
      void utils.app.kodixCare.invalidate();
    },
  });

  const [position, setPosition] = useState(1);

  const [editCareTaskSheetOpen, setEditCareTaskSheetOpen] = useState(false);
  const [createCareTaskSheetOpen, setCreateCareTaskSheetOpen] = useState(false);
  const [currentlyEditing, setCurrentlyEditing] =
    useState<CareTaskOrCalendarTask["id"]>(null);
  const currentlyEditingCareTask = useMemo(() => {
    if (!careTasksQuery.data?.length) return undefined;
    return careTasksQuery.data.find(
      (x) => x.id === currentlyEditing,
    ) as CareTask;
  }, [currentlyEditing, careTasksQuery.data]);

  const canSyncShift = !currentShift.data?.checkOut;

  return (
    <>
      <Button
        zIndex={100000}
        position="absolute"
        bottom={"$5"}
        right={"$5"}
        theme={"orange_active"}
        circular
        size={"$6"}
        icon={<Plus size={"$2"} />}
        onPress={() => {
          void Haptics.selectionAsync();
          setCreateCareTaskSheetOpen(true);
        }}
      />
      <CreateCareTaskSheet
        open={createCareTaskSheetOpen}
        setOpen={setCreateCareTaskSheetOpen}
      />
      {currentlyEditingCareTask && (
        <>
          <EditCareTaskSheet
            task={currentlyEditingCareTask}
            mutation={saveCareTaskMutation}
            open={editCareTaskSheetOpen}
            setOpen={setEditCareTaskSheetOpen}
          />
        </>
      )}
      <SheetModal
        dismissOnSnapToBottom={false}
        open
        zIndex={9999}
        modal={false}
        snapPoints={[100, 65]}
        onPositionChange={setPosition}
        position={position}
        withOverlay={false}
        withHandle={false}
        sheetFrameProps={{
          p: "$2",
          ai: "center",
          borderColor: "$color6",
          backgroundColor: "$color3",
          borderWidth: 1,
          borderBottomWidth: 0,
        }}
      >
        {careTasksQuery.isLoading || !careTasksQuery.data ? (
          <Spinner mt="$20" />
        ) : (
          <>
            <XStack
              justifyContent="flex-end"
              w="100%"
              px={defaultPadding}
              py={"$2"}
            >
              {canSyncShift ? (
                <TouchableOpacity
                  onPress={() => {
                    void Haptics.selectionAsync();
                    Alert.alert(
                      "Sincronizar tarefas",
                      "Substituir os dados do seu turno pelo calendário de planejamento?",
                      [
                        {
                          text: "Cancelar",
                        },
                        {
                          text: "Ok",
                          onPress: () =>
                            syncCareTasksFromCalendarMutation.mutate(),
                        },
                      ],
                    );
                  }}
                >
                  <ArrowRightLeft size={"$2"} />
                </TouchableOpacity>
              ) : null}
            </XStack>
            <ScrollView f={1} w="100%" p={"$3"}>
              {careTasksQuery.data.map((task, i) => (
                <CareTaskOrCalendarTaskItem
                  key={`${task.id}${task.title}${task.description}${i}`}
                  task={task}
                  mutation={saveCareTaskMutation}
                  setCurrentlyEditing={setCurrentlyEditing}
                  setEditCareTaskSheetOpen={setEditCareTaskSheetOpen}
                />
              ))}
            </ScrollView>
          </>
        )}
      </SheetModal>
    </>
  );
}

function CreateCareTaskSheet({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const form = useForm({
    schema: ZCreateCareTaskInputSchema,
  });
  const utils = api.useUtils();
  const toast = useToastController();
  const createCareTaskMutation = api.app.kodixCare.createCareTask.useMutation({
    onSuccess: () => {
      setOpen(false);
    },
    onError: (err) => {
      toast.show("Um erro ocorreu", {
        message: getErrorMessage(err),
        variant: "error",
        customData: {
          variant: "error",
        },
      });
    },
    onSettled: () => {
      void utils.app.kodixCare.invalidate();
    },
  });

  useEffect(() => {
    form.reset();
  }, [form, open]);

  return (
    <SheetModal
      open={open}
      setOpen={setOpen}
      snapPoints={[50]}
      withHandle={false}
    >
      <Form {...form}>
        <View mt="$4" gap="$4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} onChangeText={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <XStack gap="$2" ai="center" alignContent="center">
                  <FormLabel>Data</FormLabel>
                </XStack>
                <FormControl>
                  <XStack gap={"$3"}>
                    <DateTimePicker
                      {...field}
                      type="date"
                      date={field.value}
                      onConfirm={field.onChange}
                      minimumDate={new Date()}
                    />
                    <DateTimePicker
                      {...field}
                      type="time"
                      date={field.value}
                      onConfirm={field.onChange}
                      minimumDate={new Date()}
                    />
                  </XStack>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            onPress={form.handleSubmit((values) => {
              createCareTaskMutation.mutate(values);
            })}
            disabled={createCareTaskMutation.isPending}
          >
            {createCareTaskMutation.isPending ? (
              <Spinner />
            ) : (
              "Adicionar tarefa"
            )}
          </Button>
        </View>
      </Form>
    </SheetModal>
  );
}

function CareTaskOrCalendarTaskItem(props: {
  task: RouterOutputs["app"]["kodixCare"]["getCareTasks"][number];
  mutation: ReturnType<typeof api.app.kodixCare.saveCareTask.useMutation>;
  setEditCareTaskSheetOpen: (open: boolean) => void;
  setCurrentlyEditing: (id: string) => void;
}) {
  const format = useFormatter();
  const isCareTaskItem = !!props.task.id;

  return (
    <TouchableOpacity
      activeOpacity={isCareTaskItem ? 0.2 : 1}
      onPress={() => {
        if (!props.task.id) return;
        void Haptics.selectionAsync();
        props.setCurrentlyEditing(props.task.id);
        props.setEditCareTaskSheetOpen(true);
      }}
    >
      <XStack mb="$2" ai={"center"} gap="$3" maxWidth={"100%"}>
        {isCareTaskItem ? (
          <Checkbox
            onCheckedChange={() => {
              void Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
              if (!props.task.id) return; //Will never happen. its just to make ts happy
              props.setCurrentlyEditing(props.task.id);

              props.mutation.mutate({
                id: props.task.id,
                doneAt: props.task.doneAt ? null : new Date(),
              });
            }}
            checked={!!props.task.doneAt}
            size={"$7"}
          >
            <Checkbox.Indicator>
              <CheckIcon />
            </Checkbox.Indicator>
          </Checkbox>
        ) : (
          <Lock />
        )}
        <YStack maxWidth={"$18"}>
          <Text numberOfLines={1}>{props.task.title}</Text>
          <SizableText numberOfLines={1} size="$2" color="$gray11Dark">
            {props.task.description}
          </SizableText>
        </YStack>

        <XStack ml="auto" ai="center">
          <YStack mr={"$2"}>
            {props.task.details && (
              <TextIcon size={16} color={"$orange11Dark"} />
            )}
          </YStack>
          <YStack>
            <SizableText size="$2" color="$gray11Dark" textAlign="right">
              {format.dateTime(props.task.date, {
                day: "numeric",
                month: "short",
              })}
            </SizableText>
            <SizableText size="$2" color="$gray11Dark" textAlign="right">
              {format.dateTime(props.task.date, {
                hour: "numeric",
                minute: "numeric",
              })}
            </SizableText>
          </YStack>
        </XStack>
      </XStack>
    </TouchableOpacity>
  );
}

function EditCareTaskSheet(props: {
  task: CareTask;
  mutation: ReturnType<typeof api.app.kodixCare.saveCareTask.useMutation>;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const positionDefault = 1;
  const [position, setPosition] = useState(positionDefault);

  const defaultValues = useMemo(
    () => ({
      id: props.task.id,
      details: props.task.details,
      doneAt: props.task.doneAt,
    }),
    [props.task],
  );

  const form = useForm({
    schema: ZSaveCareTaskInputSchema.pick({
      id: true,
      details: true,
      doneAt: true,
    }),
    defaultValues: {
      id: props.task.id,
      details: props.task.details,
      doneAt: props.task.doneAt,
    },
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form, props.open]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setPosition(0);
    });

    return () => {
      showSubscription.remove();
    };
  }, []);

  return (
    <SheetModal
      open={props.open}
      setOpen={(open) => {
        setPosition(positionDefault);
        props.setOpen(open);
      }}
      position={position}
      onPositionChange={setPosition}
      snapPoints={[100, 50]}
      withHandle={false}
    >
      <SafeAreaView>
        <View>
          <H4>{props.task.title}</H4>
          <Paragraph>{props.task.description}</Paragraph>
        </View>
        <Form {...form}>
          <View mt="$4" gap="$4">
            <FormField
              control={form.control}
              name="doneAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feito em</FormLabel>
                  <FormControl>
                    <XStack gap={"$3"}>
                      <DateTimePicker
                        {...field}
                        type="date"
                        date={field.value ?? undefined}
                        onConfirm={field.onChange}
                        minimumDate={new Date()}
                      />
                      <DateTimePicker
                        {...field}
                        type="time"
                        date={field.value ?? undefined}
                        onConfirm={field.onChange}
                        minimumDate={new Date()}
                      />
                    </XStack>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <XStack gap="$2" ai="center" alignContent="center">
                    <FormLabel>Detalhes</FormLabel>
                    <TextIcon size={16} color={"$orange11Dark"} />
                  </XStack>
                  <FormControl>
                    <TextArea
                      {...field}
                      verticalAlign="top"
                      onChangeText={field.onChange}
                      value={field.value ?? undefined}
                      placeholder={"Alguma informação adicional?"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              onPress={form.handleSubmit((values) => {
                props.mutation.mutate(values);
                props.setOpen(false);
              })}
            >
              Salvar
            </Button>
          </View>
        </Form>
      </SafeAreaView>
    </SheetModal>
  );
}
