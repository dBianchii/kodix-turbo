import type { CareTask } from "node_modules/@kdx/api/dist/api/src/internal/calendarAndCareTaskCentral";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Keyboard, TouchableOpacity } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { SafeAreaView } from "react-native-safe-area-context";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
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
import { useToastController } from "@tamagui/toast";
import {
  Button,
  Checkbox,
  H4,
  Input,
  Paragraph,
  SizableText,
  Spinner,
  Text,
  TextArea,
  useTheme,
  View,
  XStack,
  YStack,
} from "tamagui";
import { useFormatter, useTranslations } from "use-intl";

import dayjs from "@kdx/dayjs";
import { getErrorMessage } from "@kdx/shared";
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
import { api } from "~/utils/api";

type CareTaskOrCalendarTask =
  RouterOutputs["app"]["kodixCare"]["careTask"]["getCareTasks"][number];

export function CareTasksLists() {
  const input = {
    dateStart: dayjs().startOf("day").toDate(),
    dateEnd: dayjs().endOf("day").toDate(),
  };
  const utils = api.useUtils();

  const careTasksQuery =
    api.app.kodixCare.careTask.getCareTasks.useQuery(input);
  const currentShift = api.app.kodixCare.getCurrentShift.useQuery();
  const syncCareTasksFromCalendarMutation =
    api.app.kodixCare.careTask.syncCareTasksFromCalendar.useMutation({
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
  const editCareTaskMutation =
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-require-imports
            require("../../../../../assets/taskDone.mp3"),
          );
          void sound.playAsync();
        }

        // Cancel any outgoing refetches
        // (so they don't overwrite our optimistic update)
        await utils.app.kodixCare.careTask.getCareTasks.cancel();

        // Optimistically update to the new value
        utils.app.kodixCare.careTask.getCareTasks.setData(input, (prev) => {
          return prev?.map((x) => {
            if (x.id === editedCareTask.id) {
              if (editedCareTask.doneAt !== undefined)
                x.doneAt = editedCareTask.doneAt;
              if (editedCareTask.details !== undefined)
                x.details = editedCareTask.details;
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
        utils.app.kodixCare.careTask.getCareTasks.setData(
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
            mutation={editCareTaskMutation}
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
          px: "0",
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
            <View f={1} w="100%">
              <FlatList
                data={careTasksQuery.data}
                renderItem={({ item }) => (
                  <CareTaskOrCalendarTaskItem
                    task={item}
                    mutation={editCareTaskMutation}
                    setCurrentlyEditing={setCurrentlyEditing}
                    setEditCareTaskSheetOpen={setEditCareTaskSheetOpen}
                  />
                )}
                keyExtractor={(item, index) => `${item.id}-${index}`}
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
    schema: ZCreateCareTaskInputSchema(t),
    defaultValues: {
      type: "NORMAL",
    },
  });
  const utils = api.useUtils();
  const toast = useToastController();
  const createCareTaskMutation =
    api.app.kodixCare.careTask.createCareTask.useMutation({
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
      snapPoints={[75]}
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
                    {/* TODO: MAKE IT HAVE NOT ALLOWED DATES LOL */}
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
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <XStack ai={"center"}>
                  <FormControl>
                    <Checkbox
                      size={"$5"}
                      checked={field.value === "CRITICAL"}
                      onCheckedChange={() =>
                        field.onChange(
                          field.value === "CRITICAL" ? "NORMAL" : "CRITICAL",
                        )
                      }
                    >
                      <Checkbox.Indicator>
                        <CheckIcon />
                      </Checkbox.Indicator>
                    </Checkbox>
                  </FormControl>
                  <AlertCircle
                    ml="$3"
                    color={
                      field.value === "CRITICAL"
                        ? "$orange11Dark"
                        : "$gray11Dark"
                    }
                  />
                  <FormLabel gap={"$1"} f={1} ml={"$2"}>
                    Tarefa crítica?
                  </FormLabel>
                </XStack>
                <SizableText size={"$2"} color="$gray11Dark">
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
                <XStack gap="$2" ai="center" alignContent="center">
                  <FormLabel>Descrição</FormLabel>
                </XStack>
                <FormControl>
                  <TextArea
                    {...field}
                    verticalAlign="top"
                    onChangeText={field.onChange}
                    value={field.value}
                    placeholder={"Qualquer informação..."}
                  />
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
      onSettled: () => {
        void utils.app.kodixCare.careTask.invalidate();
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
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              backgroundColor: theme.red5Dark.val,
              height: "100%",
              width: 62,
              justifyContent: "center",
              alignItems: "center",
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
          px="$4"
          pb="$2"
          ai={"center"}
          gap="$3"
          maxWidth={"100%"}
          backgroundColor={"$blue3Dark"}
        >
          {isCareTaskItem(props.task) ? (
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
            <XStack>
              <Text numberOfLines={1}>{props.task.title}</Text>
              {props.task.type === "CRITICAL" && (
                <AlertCircle color={"$orange11Dark"} size="$1" ml={"$2"} />
              )}
            </XStack>
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
      id: props.task.id,
      details: props.task.details,
      doneAt: props.task.doneAt,
    }),
    [props.task],
  );
  const t = useTranslations();
  const form = useForm({
    schema: ZEditCareTaskInputSchema(t).pick({
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
  const format = useFormatter();

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
          <XStack gap="$2" ai="center">
            <H4>{props.task.title}</H4>
            <AlertCircle color={"$orange11Dark"} size="$1" />
          </XStack>
          <Paragraph>{props.task.description}</Paragraph>
          <XStack gap="$2">
            <Calendar size={"$1"} color="$gray11Dark" />
            <Text color="$gray11Dark">
              {format.dateTime(props.task.date, {
                day: "2-digit",
                month: "short",
                hour: "numeric",
                minute: "numeric",
              })}
            </Text>
          </XStack>
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
