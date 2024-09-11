import React, { useState } from "react";
import { Alert, Platform, TouchableOpacity } from "react-native";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useToastController } from "@tamagui/toast";
import {
  Button,
  H3,
  Paragraph,
  Sheet,
  SizableText,
  Spinner,
  XStack,
} from "tamagui";

import { useFormatter, useTranslations } from "@kdx/locales/use-intl";
import { ZDoCheckoutForShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";

import type { RouterOutputs } from "~/utils/api";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  useForm,
} from "~/components/form";
import { api } from "~/utils/api";
import { useAuth } from "~/utils/auth";

export function ToggleShiftButton() {
  const query = api.app.kodixCare.getCurrentShift.useQuery();
  const user = useAuth();
  if (!user.session) return null;

  if (!(query.data && !query.data.checkOut)) return <StartShiftDialogButton />;
  if (query.data.Caregiver.id === user.session.userId)
    return <DoCheckoutDialogButton currentShift={query.data} />;
  // return <StartShiftWarnPreviousPersonDialog />;
}

function StartShiftDialogButton() {
  // const t = useTranslations();
  const utils = api.useUtils();
  const mutation = api.app.kodixCare.toggleShift.useMutation({
    onSuccess: () => {
      void utils.app.kodixCare.getCareTasks.invalidate();
      void utils.app.kodixCare.getCurrentShift.invalidate();
    },
    onError: () => {
      //TODO: make onError for this
      return;
    },
  });

  return (
    <Button
      opacity={mutation.isPending ? 0.5 : 1}
      disabled={mutation.isPending}
      w={"$18"}
      bordered
      onPress={() =>
        Alert.alert(
          "Iniciar turno",
          "Você tem certeza que gostaria de iniciar um novo turno?",
          [
            {
              text: "Cancelar",
            },
            {
              text: "Ok",
              onPress: () => mutation.mutate(),
            },
          ],
        )
      }
    >
      {mutation.isPending ? <Spinner /> : "Iniciar turno"}
    </Button>
  );
}

function DoCheckoutDialogButton({
  currentShift,
}: {
  currentShift: NonNullable<
    RouterOutputs["app"]["kodixCare"]["getCurrentShift"]
  >;
}) {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();
  const toast = useToastController();
  const t = useTranslations();
  const form = useForm({
    schema: ZDoCheckoutForShiftInputSchema(t),
    defaultValues: {
      date: new Date(),
    },
  });

  const mutation = api.app.kodixCare.doCheckoutForShift.useMutation({
    onSuccess: () => {
      setOpen(false);
      toast.show("Turno finalizado!");

      void utils.app.kodixCare.getCurrentShift.invalidate();
    },
    onError: () => {
      toast.show("Um erro ocorreu", {
        message: "Não foi possível finalizar o turno",
        variant: "error",
        customData: {
          variant: "error",
        },
      });
    },
  });
  const format = useFormatter();

  return (
    <>
      <Button
        onPress={() => setOpen(true)}
        bordered
        theme={"red"}
        w={"$18"}
        opacity={mutation.isPending ? 0.5 : 1}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? <Spinner /> : "Check-out"}
      </Button>
      <Sheet
        animationConfig={{
          type: "spring",
          damping: 10,
          mass: 0.3,
        }}
        open={open}
        forceRemoveScrollEnabled={open}
        modal
        onOpenChange={setOpen}
        snapPoints={[85]}
        snapPointsMode={"percent"}
        dismissOnSnapToBottom
        zIndex={100_000}
        native
      >
        <Sheet.Overlay enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        <Sheet.Handle backgroundColor={"$blue5Dark"} />
        <Sheet.Frame padding="$4" ai="center" gap="$3">
          <H3>Realizar check-out</H3>
          <Paragraph>
            Você está prestes a terminar seu turno e realizar check-out. Tem
            certeza?
          </Paragraph>
          <Form {...form}>
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem ai="center">
                  <FormControl>
                    {Platform.OS === "ios" ? (
                      <DateTimePicker
                        {...field}
                        minimumDate={currentShift.checkIn}
                        onChange={(_, date) => {
                          field.onChange(date);
                        }}
                        value={field.value}
                        mode="datetime"
                        display="spinner"
                      />
                    ) : (
                      <XStack jc="center" gap="$5">
                        <TouchableOpacity
                          onPress={() => {
                            DateTimePickerAndroid.open({
                              value: field.value,
                              onChange: (_, date) => {
                                field.onChange(date);
                              },
                              minimumDate: currentShift.checkIn,
                              mode: "date",
                              display: "spinner",
                            });
                          }}
                        >
                          <SizableText size={"$8"}>
                            {format.dateTime(field.value)}
                          </SizableText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            DateTimePickerAndroid.open({
                              value: field.value,
                              onChange: (_, date) => {
                                field.onChange(date);
                              },
                              minimumDate: currentShift.checkIn,
                              mode: "time",
                              display: "spinner",
                            });
                          }}
                        >
                          <SizableText size={"$8"}>
                            {format.dateTime(field.value, {
                              timeStyle: "short",
                            })}
                          </SizableText>
                        </TouchableOpacity>
                      </XStack>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              opacity={mutation.isPending ? 0.5 : 1}
              disabled={mutation.isPending}
              width={"100%"}
              bordered
              theme="red"
              onPress={form.handleSubmit((values) => {
                void mutation.mutate(values);
              })}
            >
              {mutation.isPending ? <Spinner /> : "Finalizar turno"}
            </Button>
          </Form>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}
