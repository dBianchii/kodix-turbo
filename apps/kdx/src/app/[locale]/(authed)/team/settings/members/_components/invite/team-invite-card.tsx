"use client";

import { useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { LuMail } from "react-icons/lu";
import { RxMinusCircled, RxPlusCircled } from "react-icons/rx";

import type { User } from "@kdx/auth";
import { cn } from "@kdx/ui";
import { Button } from "@kdx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@kdx/ui/card";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@kdx/ui/credenza";
import { Input } from "@kdx/ui/input";
import { Label } from "@kdx/ui/label";
import { Separator } from "@kdx/ui/separator";
import { toast } from "@kdx/ui/toast";
import { ZInviteInputSchema } from "@kdx/validators/trpc/team/invitation";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { useTRPC } from "~/trpc/react";

export default function TeamInviteCardClient({
  user,
  canEditPage,
}: {
  user: User;
  canEditPage: boolean;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [emails, setEmails] = useState([{ key: 0, value: "" }]); //key is used to work with formkit
  const [successes, setSuccesses] = useState<string[]>([]);

  const t = useTranslations();

  const mutation = useMutation(
    trpc.team.invitation.invite.mutationOptions({
      onSuccess: ({ successes, failures }) => {
        if (successes.length > 0) {
          toast.success(
            successes.length
              ? t("Invitations sent to people", {
                  people: successes.join(", "),
                })
              : t("Invitations sent"),
          );
        }
        if (failures.length > 0)
          toast.error(
            t("Failed to send invitation to people", {
              people: failures.join(", "),
            }),
          );
        setSuccesses(successes);
        setEmails([{ key: 0, value: "" }]);

        setTimeout(() => {
          closeDialog();
        }, 2000);
      },
      onError: (e) => trpcErrorToastDefault(e),
      onSettled: () => {
        void queryClient.invalidateQueries(
          trpc.team.invitation.getAll.pathFilter(),
        );
      },
    }),
  );

  const closeDialog = () => {
    //TODO: Keep the emails that were unsuccessful
    // setEmails([{ key: 0, value: "" }]);
    setSuccesses([]);
    setOpen(false);
  };

  const [parent] = useAutoAnimate();

  const [open, setOpen] = useState(false);

  return (
    <>
      <Credenza
        onOpenChange={(open) => {
          if (!open) return closeDialog();
          setOpen(open);
        }}
        open={open}
      >
        <CredenzaContent>
          <CredenzaHeader>
            <CredenzaTitle>{t("Invite to team")}</CredenzaTitle>
            <CredenzaDescription>
              {t(
                "You are about to invite the following Team members are you sure you want to continue",
              )}
            </CredenzaDescription>
          </CredenzaHeader>
          <CredenzaBody className="my-4 flex flex-col space-y-2">
            {emails
              .filter((x) => Boolean(x))
              .map((email) => (
                <div
                  className="m-0 flex justify-between rounded-md border p-3"
                  key={email.key}
                >
                  {email.value}

                  <LuMail
                    className={cn(
                      "text-green-600 fade-in-0",
                      !successes.includes(email.value) && "hidden",
                    )}
                  />
                </div>
              ))}
          </CredenzaBody>
          <CredenzaFooter className="justify-end">
            <Button
              disabled={mutation.isPending || successes.length > 0}
              loading={mutation.isPending}
              onClick={() => {
                const values = {
                  teamId: user.activeTeamId,
                  to: emails.map((x) => x.value).filter((x) => Boolean(x)),
                };
                const parsed = ZInviteInputSchema.safeParse(values);
                if (!parsed.success) {
                  return toast.error(parsed.error.errors[0]?.message);
                }
                mutation.mutate(values);
              }}
            >
              {mutation.isPending ? t("Sending") : t("Confirm")}
            </Button>
          </CredenzaFooter>
        </CredenzaContent>
      </Credenza>
      <Card className="w-full text-left">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardDescription>
            {t("Invite new members by email address")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-6" />
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email-0" className="mb-1 text-muted-foreground">
                {t("Email address")}
              </Label>
              <div ref={parent} className="space-y-2">
                {emails.map((email, index) => (
                  <div key={email.key} className="flex flex-row space-x-1">
                    <Input
                      id={`email-${index}`}
                      type="email"
                      disabled={!canEditPage}
                      value={email.value}
                      onChange={(e) => {
                        const newEmails = [...emails];
                        newEmails[index] = {
                          key: email.key,
                          value: e.target.value,
                        };
                        setEmails(newEmails);
                      }}
                      placeholder={"layla@example.com"}
                    />
                    <Button
                      type="button"
                      variant={"outline"}
                      size={"sm"}
                      disabled={emails.length === 1}
                      className={cn(
                        "items-center justify-center",
                        emails.length === 1 && "hidden",
                      )}
                      onClick={() => {
                        const newEmails = [...emails];
                        newEmails.splice(index, 1);
                        setEmails(newEmails);
                      }}
                    >
                      <RxMinusCircled className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-2">
            <Button
              disabled={!emails.some((x) => x.value.length) || !canEditPage}
              type="button"
              variant={"secondary"}
              size={"sm"}
              className="h-8 p-2 text-xs"
              onClick={() => {
                const newEmails = [...emails];
                newEmails.push({ key: Math.random(), value: "" });
                setEmails(newEmails);
              }}
            >
              <RxPlusCircled className="mr-2 size-4" />
              {t("Add more")}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <CardDescription className="text-xs italic">
            {t("Only the owner of the team can invite new members")}
          </CardDescription>
          <Button
            type="button"
            disabled={!emails.some((x) => x.value.length) || !canEditPage}
            onClick={() => {
              if (
                emails.length > 0 &&
                emails.filter((x) => Boolean(x)).length > 0
              )
                setOpen(true);
            }}
          >
            {t("Invite")}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
