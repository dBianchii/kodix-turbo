import React, { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useToastController } from "@tamagui/toast";
import { Button, H3, Paragraph, Spinner, XStack } from "tamagui";
import { useTranslations } from "use-intl";

import { ZDoCheckoutForShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";

import type { RouterOutputs } from "~/utils/api";
import { DateTimePicker } from "~/components/date-time-picker";
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
import { useAuth } from "~/utils/auth";

export function ToggleShiftButton() {
  const query = api.app.kodixCare.getCurrentShift.useQuery();
  const { user } = useAuth();
  const router = useRouter();
  if (!user) {
    router.replace("/");
    return null;
  }

  if (!(query.data && !query.data.checkOut)) return <StartShiftDialogButton />;
  if (query.data.Caregiver.id === user.id)
    return <DoCheckoutDialogButton currentShift={query.data} />;
  // return <StartShiftWarnPreviousPersonDialog />;
}

function StartShiftDialogButton() {
  // const t = useTranslations();
  const utils = api.useUtils();
  const toast = useToastController();
  const mutation = api.app.kodixCare.toggleShift.useMutation({
    onSuccess: () => {
      void utils.app.kodixCare.careTask.invalidate();
      void utils.app.kodixCare.getCurrentShift.invalidate();
    },
    onError: () => {
      toast.show("Um erro ocorreu", {
        message: "Não foi possível iniciar o turno",
        variant: "error",
        customData: {
          variant: "error",
        },
      });
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
      void utils.app.kodixCare.careTask.invalidate();
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
      <SheetModal
        open={open}
        forceRemoveScrollEnabled={open}
        onOpenChange={setOpen}
        sheetFrameProps={{
          padding: "$4",
          ai: "center",
          gap: "$3",
        }}
        native
      >
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
                  <XStack gap="$4">
                    <DateTimePicker
                      {...field}
                      date={field.value}
                      onConfirm={field.onChange}
                      minimumDate={currentShift.checkIn}
                    />
                    <DateTimePicker
                      {...field}
                      type="time"
                      date={field.value}
                      onConfirm={field.onChange}
                      minimumDate={currentShift.checkIn}
                    />
                  </XStack>
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
      </SheetModal>
    </>
  );
}
