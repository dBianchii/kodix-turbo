import type { CareTask } from "node_modules/@kdx/api/src/internal/calendar-and-care-task-central";
import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Keyboard, TouchableOpacity } from "react-native";
import dayjs from "@kodix/dayjs";
import { getErrorMessage } from "@kodix/shared/utils";
import { Button } from "@tamagui/button";
import { Checkbox } from "@tamagui/checkbox";
import { Text, useTheme, View } from "@tamagui/core";
import { Input, TextArea } from "@tamagui/input";
import {
  AlertCircle,
  ArrowRightLeft,
  Calendar,
  Check as CheckIcon,
  Lock,
  Plus,
  Text as TextIcon,
  Trash2,
} from "@tamagui/lucide-icons";
import { XStack, YStack } from "@tamagui/stacks";
import { H4, Paragraph, SizableText } from "@tamagui/text";
import { useToastController } from "@tamagui/toast";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFormatter, useTranslations } from "use-intl";

import {
  ZCreateCareTaskInputSchema,
  ZEditCareTaskInputSchema,
} from "@kdx/validators/trpc/app/kodixCare/careTask";

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
import { Spinner } from "~/components/spinner";
import { api } from "~/utils/api";

type CareTaskOrCalendarTask =
  RouterOutputs["app"]["kodixCare"]["careTask"]["getCareTasks"][number];

export function CareTasksLists() {
  const input = {
    dateEnd: dayjs().endOf("day").toDate(),
    dateStart: dayjs().startOf("day").toDate(),
  };
  const utils = api.useUtils();

  const careTasksQuery =
    api.app.kodixCare.careTask.getCareTasks.useQuery(input);
  // const currentShift = api.app.kodixCare.getCurrentShift.useQuery();
  const syncCareTasksFromCalendarMutation =
    api.app.kodixCare.careTask.syncCareTasksFromCalendar.useMutation({
      onError: (err) => {
        toast.show("Um erro ocorreu", {
          customData: {
            variant: "error",
          },
          message: getErrorMessage(err),
          variant: "error",
        });
      },
      onSettled: () => {
        void utils.app.kodixCare.invalidate();
      },
    });

  const toast = useToastController();
  const editCareTaskMutation =
    // biome-ignore assist/source/useSortedKeys: Known TS limitation in tanstack
    api.app.kodixCare.careTask.editCareTask.useMutation({
      onMutate: async (editedCareTask) => {
        // Snapshot the previous value
        const previousCareTasks =
          utils.app.kodixCare.careTask.getCareTasks.getData();

        const previousTask = previousCareTasks?.find(
          (x) => x.id === editedCareTask.id,
        );
        if (!previousTask?.doneAt && editedCareTask.doneAt) {
          const { sound } = await Audio.Sound.createAsync(
            require("../../../../../assets/taskDone.mp3"),
          );
          void sound.playAsync();
        }

        // Cancel any outgoing refetches
        // (so they don't overwrite our optimistic update)
        await utils.app.kodixCare.careTask.getCareTasks.cancel();

        // Optimistically update to the new value
        utils.app.kodixCare.careTask.getCareTasks.setData(input, (prev) =>
          prev?.map((x) => {
            if (x.id === editedCareTask.id) {
              if (editedCareTask.doneAt !== undefined)
                x.doneAt = editedCareTask.doneAt;
              if (editedCareTask.details !== undefined)
                x.details = editedCareTask.details;
            }

            return x;
          }),
        );

        // Return a context object with the snapshotted value
        return { previousCareTasks };
      },
      // Always refetch after error or success:
      onSettled: () => {
        void utils.app.kodixCare.invalidate();
      },
      // If the mutation fails,
      // use the context returned from onMutate to roll back
      onError: (err, __, context) => {
        utils.app.kodixCare.careTask.getCareTasks.setData(
          input,
          context?.previousCareTasks,
        );
        toast.show("Um erro ocorreu", {
          customData: {
            variant: "error",
          },
          message: getErrorMessage(err),
          variant: "error",
        });
      },
    });

  const [position, setPosition] = useState(1);

  const [editCareTaskSheetOpen, setEditCareTaskSheetOpen] = useState(false);
  const [createCareTaskSheetOpen, setCreateCareTaskSheetOpen] = useState(false);
  const [currentlyEditing, setCurrentlyEditing] =
    useState<CareTaskOrCalendarTask["id"]>(null);
  const currentlyEditingCareTask = useMemo(() => {
    if (!careTasksQuery.data?.length) return;
    return careTasksQuery.data.find(
      (x) => x.id === currentlyEditing,
    ) as CareTask;
  }, [currentlyEditing, careTasksQuery.data]);

  // const canSyncShift = true;

  return (
    <>
      <Button
        bottom={"$5"}
        circular
        icon={<Plus size={"$2"} />}
        onPress={() => {
          void Haptics.selectionAsync();
          setCreateCareTaskSheetOpen(true);
        }}
        position="absolute"
        right={"$5"}
        size={"$6"}
        theme={"orange_active"}
        zIndex={100_000}
      />
      <CreateCareTaskSheet
        open={createCareTaskSheetOpen}
        setOpen={setCreateCareTaskSheetOpen}
      />
      {currentlyEditingCareTask && (
        <EditCareTaskSheet
          mutation={editCareTaskMutation}
          open={editCareTaskSheetOpen}
          setOpen={setEditCareTaskSheetOpen}
          task={currentlyEditingCareTask}
        />
      )}
      <SheetModal
        dismissOnSnapToBottom={false}
        modal={false}
        onPositionChange={setPosition}
        open
        position={position}
        sheetFrameProps={{
          ai: "center",
          backgroundColor: "$color3",
          borderBottomWidth: 0,
          borderColor: "$color6",
          borderWidth: 1,
          px: "0",
        }}
        snapPoints={[100, 65]}
        withHandle={false}
        withOverlay={false}
        zIndex={9999}
      >
        {careTasksQuery.isLoading || !careTasksQuery.data ? (
          <Spinner mt="$20" />
        ) : (
          <>
            <XStack
              justifyContent="flex-end"
              px={defaultPadding}
              py={"$2"}
              w="100%"
            >
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
                        onPress: () =>
                          syncCareTasksFromCalendarMutation.mutate(),
                        text: "Ok",
                      },
                    ],
                  );
                }}
              >
                <ArrowRightLeft size={"$2"} />
              </TouchableOpacity>
            </XStack>
            <View f={1} w="100%">
              <FlatList
                data={careTasksQuery.data}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                renderItem={({ item }) => (
                  <CareTaskOrCalendarTaskItem
                    mutation={editCareTaskMutation}
                    setCurrentlyEditing={setCurrentlyEditing}
                    setEditCareTaskSheetOpen={setEditCareTaskSheetOpen}
                    task={item}
                  />
                )}
              />
            </View>
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
  const t = useTranslations();
  const form = useForm({
    defaultValues: {
      type: "NORMAL",
    },
    schema: ZCreateCareTaskInputSchema(t),
  });
  const utils = api.useUtils();
  const toast = useToastController();
  const createCareTaskMutation =
    api.app.kodixCare.careTask.createCareTask.useMutation({
      onError: (err) => {
        toast.show("Um erro ocorreu", {
          customData: {
            variant: "error",
          },
          message: getErrorMessage(err),
          variant: "error",
        });
      },
      onSettled: () => {
        void utils.app.kodixCare.invalidate();
      },
      onSuccess: () => {
        setOpen(false);
      },
    });

  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to reset form when sheet is opened
  useEffect(() => {
    form.reset();
  }, [form, open]);

  return (
    <SheetModal
      open={open}
      setOpen={setOpen}
      snapPoints={[75]}
      withHandle={false}
    >
      <Form {...form}>
        <View gap="$4" mt="$4">
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
                <XStack ai="center" alignContent="center" gap="$2">
                  <FormLabel>Data</FormLabel>
                </XStack>
                <FormControl>
                  <XStack gap={"$3"}>
                    {/* TODO: MAKE IT HAVE NOT ALLOWED DATES LOL */}
                    <DateTimePicker
                      {...field}
                      date={field.value}
                      minimumDate={new Date()}
                      onConfirm={field.onChange}
                      type="date"
                    />
                    <DateTimePicker
                      {...field}
                      date={field.value}
                      minimumDate={new Date()}
                      onConfirm={field.onChange}
                      type="time"
                    />
                  </XStack>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <XStack ai={"center"}>
                  <FormControl>
                    <Checkbox
                      checked={field.value === "CRITICAL"}
                      onCheckedChange={() =>
                        field.onChange(
                          field.value === "CRITICAL" ? "NORMAL" : "CRITICAL",
                        )
                      }
                      size={"$5"}
                    >
                      <Checkbox.Indicator>
                        <CheckIcon />
                      </Checkbox.Indicator>
                    </Checkbox>
                  </FormControl>
                  <AlertCircle
                    color={
                      field.value === "CRITICAL"
                        ? "$orange11Dark"
                        : "$gray11Dark"
                    }
                    ml="$3"
                  />
                  <FormLabel f={1} gap={"$1"} ml={"$2"}>
                    Tarefa crítica?
                  </FormLabel>
                </XStack>
                <SizableText color="$gray11Dark" size={"$2"}>
                  Se esta tarefa é considerada crítica ou não
                </SizableText>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <XStack ai="center" alignContent="center" gap="$2">
                  <FormLabel>Descrição</FormLabel>
                </XStack>
                <FormControl>
                  <TextArea
                    {...field}
                    onChangeText={field.onChange}
                    placeholder={"Qualquer informação..."}
                    value={field.value}
                    verticalAlign="top"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={createCareTaskMutation.isPending}
            onPress={form.handleSubmit((values) => {
              createCareTaskMutation.mutate(values);
            })}
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
  task: RouterOutputs["app"]["kodixCare"]["careTask"]["getCareTasks"][number];
  mutation: ReturnType<
    typeof api.app.kodixCare.careTask.editCareTask.useMutation
  >;
  setEditCareTaskSheetOpen: (open: boolean) => void;
  setCurrentlyEditing: (id: string) => void;
}) {
  const format = useFormatter();
  const isCareTaskItem = (
    task: RouterOutputs["app"]["kodixCare"]["careTask"]["getCareTasks"][number],
  ): task is CareTask => !!task.id;

  const utils = api.useUtils();
  const toast = useToastController();
  const deleteCareTaskMutation =
    api.app.kodixCare.careTask.deleteCareTask.useMutation({
      onError: (err) => {
        toast.show("Um erro ocorreu", {
          customData: {
            variant: "error",
          },
          message: getErrorMessage(err),
          variant: "error",
        });
      },
      onSettled: () => {
        void utils.app.kodixCare.careTask.invalidate();
      },
    });

  const theme = useTheme();

  return (
    <Swipeable
      enabled={isCareTaskItem(props.task)}
      renderRightActions={() => {
        if (!isCareTaskItem(props.task)) return null;
        return (
          <TouchableOpacity
            disabled={deleteCareTaskMutation.isPending}
            onPress={() => {
              if (isCareTaskItem(props.task)) {
                deleteCareTaskMutation.mutate({
                  id: props.task.id,
                });
              }
            }}
            style={{
              alignItems: "center",
              backgroundColor: theme.red5Dark.val,
              height: "100%",
              justifyContent: "center",
              width: 62,
            }}
          >
            <Trash2 size={"$2"} />
          </TouchableOpacity>
        );
      }}
    >
      <TouchableOpacity
        activeOpacity={isCareTaskItem(props.task) ? 0.2 : 1}
        onPress={() => {
          if (!props.task.id) return;
          void Haptics.selectionAsync();
          props.setCurrentlyEditing(props.task.id);
          props.setEditCareTaskSheetOpen(true);
        }}
      >
        <XStack
          ai={"center"}
          backgroundColor={"$blue3Dark"}
          gap="$3"
          maxWidth={"100%"}
          pb="$2"
          px="$4"
        >
          {isCareTaskItem(props.task) ? (
            <Checkbox
              checked={!!props.task.doneAt}
              onCheckedChange={() => {
                void Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success,
                );
                if (!props.task.id) return; //Will never happen. its just to make ts happy
                props.setCurrentlyEditing(props.task.id);

                props.mutation.mutate({
                  doneAt: props.task.doneAt ? null : new Date(),
                  id: props.task.id,
                });
              }}
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
            <XStack>
              <Text numberOfLines={1}>{props.task.title}</Text>
              {props.task.type === "CRITICAL" && (
                <AlertCircle color={"$orange11Dark"} ml={"$2"} size="$1" />
              )}
            </XStack>
            <SizableText color="$gray11Dark" numberOfLines={1} size="$2">
              {props.task.description}
            </SizableText>
          </YStack>

          <XStack ai="center" ml="auto">
            <YStack mr={"$2"}>
              {props.task.details && (
                <TextIcon color={"$orange11Dark"} size={16} />
              )}
            </YStack>
            <YStack>
              <SizableText color="$gray11Dark" size="$2" textAlign="right">
                {format.dateTime(props.task.date, {
                  day: "numeric",
                  month: "short",
                })}
              </SizableText>
              <SizableText color="$gray11Dark" size="$2" textAlign="right">
                {format.dateTime(props.task.date, {
                  hour: "numeric",
                  minute: "numeric",
                })}
              </SizableText>
            </YStack>
          </XStack>
        </XStack>
      </TouchableOpacity>
    </Swipeable>
  );
}

function EditCareTaskSheet(props: {
  task: CareTask;
  mutation: ReturnType<
    typeof api.app.kodixCare.careTask.editCareTask.useMutation
  >;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const positionDefault = 1;
  const [position, setPosition] = useState(positionDefault);

  const defaultValues = useMemo(
    () => ({
      details: props.task.details,
      doneAt: props.task.doneAt,
      id: props.task.id,
    }),
    [props.task],
  );
  const t = useTranslations();
  const form = useForm({
    defaultValues: {
      details: props.task.details,
      doneAt: props.task.doneAt,
      id: props.task.id,
    },
    schema: ZEditCareTaskInputSchema(t).pick({
      details: true,
      doneAt: true,
      id: true,
    }),
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: Fix me
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
  const format = useFormatter();

  return (
    <SheetModal
      onPositionChange={setPosition}
      open={props.open}
      position={position}
      setOpen={(open) => {
        setPosition(positionDefault);
        props.setOpen(open);
      }}
      snapPoints={[100, 50]}
      withHandle={false}
    >
      <SafeAreaView>
        <View>
          <XStack ai="center" gap="$2">
            <H4>{props.task.title}</H4>
            <AlertCircle color={"$orange11Dark"} size="$1" />
          </XStack>
          <Paragraph>{props.task.description}</Paragraph>
          <XStack gap="$2">
            <Calendar color="$gray11Dark" size={"$1"} />
            <Text color="$gray11Dark">
              {format.dateTime(props.task.date, {
                day: "2-digit",
                hour: "numeric",
                minute: "numeric",
                month: "short",
              })}
            </Text>
          </XStack>
        </View>
        <Form {...form}>
          <View gap="$4" mt="$4">
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
                        date={field.value ?? undefined}
                        minimumDate={new Date()}
                        onConfirm={field.onChange}
                        type="date"
                      />
                      <DateTimePicker
                        {...field}
                        date={field.value ?? undefined}
                        minimumDate={new Date()}
                        onConfirm={field.onChange}
                        type="time"
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
                  <XStack ai="center" alignContent="center" gap="$2">
                    <FormLabel>Detalhes</FormLabel>
                    <TextIcon color={"$orange11Dark"} size={16} />
                  </XStack>
                  <FormControl>
                    <TextArea
                      {...field}
                      onChangeText={field.onChange}
                      placeholder={"Alguma informação adicional?"}
                      value={field.value ?? undefined}
                      verticalAlign="top"
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
