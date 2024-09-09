import React, { useState } from "react";
import { Alert } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useToastController } from "@tamagui/toast";
import { Button, H3, Paragraph, Sheet, Text } from "tamagui";

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
      Iniciar turno
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

  const form = useForm({
    schema: ZDoCheckoutForShiftInputSchema,
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

  return (
    <>
      <Button onPress={() => setOpen(true)} bordered theme={"red"}>
        <Text fontWeight={"$14"}>Check-out</Text>
      </Button>

      <Sheet
        open={open}
        forceRemoveScrollEnabled={open}
        modal
        onOpenChange={setOpen}
        snapPoints={[85]}
        snapPointsMode={"percent"}
        dismissOnSnapToBottom
        zIndex={100_000}
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              width={"100%"}
              bordered
              theme="red"
              onPress={form.handleSubmit((values) => {
                void mutation.mutate(values);
              })}
            >
              Check-out
            </Button>
          </Form>
        </Sheet.Frame>
      </Sheet>
    </>
    // <Dialog
    //   open={open}
    //   onOpenChange={(open) => {
    //     form.setValue("date", new Date());
    //     setOpen(open);
    //   }}
    // >
    //   <DialogTrigger asChild>
    //     <Button size={"sm"} variant={"destructive"}>
    //       {t("apps.kodixCare.Checkout")}
    //     </Button>
    //   </DialogTrigger>
    //   <DialogContent>
    //     <DialogHeader>
    //       <DialogTitle>{t("apps.kodixCare.Checkout shift")}</DialogTitle>
    //     </DialogHeader>
    //     <Form {...form}>
    //       <form
    //         className="base"
    //         onSubmit={form.handleSubmit((values) => {
    //           mutation.mutate(values);
    //         })}
    //       >
    //         <DialogDescription className="mb-4">
    //           {t(
    //             "You are about to finish your shift and checkout Are you sure",
    //           )}
    //         </DialogDescription>
    //         <FormField
    //           control={form.control}
    //           name="date"
    //           render={({ field }) => (
    //             <FormItem>
    //               <FormControl>
    //                 <div className="flex flex-row gap-2">
    //                   <div className="flex items-center gap-1 pl-4">
    //                     <DateTimePicker
    //                       disabledDate={(date) =>
    //                         dayjs(date).startOf("day") >
    //                         dayjs(currentShift.checkIn).startOf("day")
    //                       }
    //                       date={field.value}
    //                       setDate={(date) =>
    //                         form.setValue("date", date ?? field.value)
    //                       }
    //                     />
    //                   </div>
    //                 </div>
    //               </FormControl>
    //               <FormMessage className="w-full" />
    //             </FormItem>
    //           )}
    //         />
    //         <DialogFooter className="mt-6 justify-end">
    //           <Button
    //             type="submit"
    //             disabled={mutation.isPending}
    //             variant={"destructive"}
    //           >
    //             {mutation.isPending ? (
    //               <LuLoader2 className="mx-2 size-4 animate-spin" />
    //             ) : (
    //               t("apps.kodixCare.Checkout")
    //             )}
    //           </Button>
    //         </DialogFooter>
    //       </form>
    //     </Form>
    //   </DialogContent>
    // </Dialog>
  );
}
