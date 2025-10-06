"use client";

import { useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { cn } from "@kodix/ui";
import { Button } from "@kodix/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@kodix/ui/card";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@kodix/ui/credenza";
import { Input } from "@kodix/ui/input";
import { Label } from "@kodix/ui/label";
import { Separator } from "@kodix/ui/separator";
import { toast } from "@kodix/ui/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { LuMail } from "react-icons/lu";
import { RxMinusCircled, RxPlusCircled } from "react-icons/rx";

import type { User } from "@kdx/auth";
import { useTRPC } from "@kdx/api/trpc/react/client";
import { ZInviteInputSchema } from "@kdx/validators/trpc/team/invitation";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";

export default function TeamInviteCardClient({
  user,
  canEditPage,
}: {
  user: User;
  canEditPage: boolean;
}) {
  const trpc = useTRPC();
  const t = useTranslations();
  const queryClient = useQueryClient();

  const [emails, setEmails] = useState([{ key: 0, value: "" }]); //key is used to work with formkit
  const [successes, setSuccesses] = useState<string[]>([]);
  const [parent] = useAutoAnimate();
  const [open, setOpen] = useState(false);

  const mutation = useMutation(
    trpc.team.invitation.invite.mutationOptions({
      onError: (e) => trpcErrorToastDefault(e),
      onSettled: () => {
        void queryClient.invalidateQueries(
          trpc.team.invitation.getAll.pathFilter(),
        );
      },
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
    }),
  );

  const closeDialog = () => {
    //TODO: Keep the emails that were unsuccessful
    // setEmails([{ key: 0, value: "" }]);
    setSuccesses([]);
    setOpen(false);
  };

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
                      "fade-in-0 text-green-600",
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
                  return toast.error(parsed.error.message);
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
              <Label className="mb-1 text-muted-foreground" htmlFor="email-0">
                {t("Email address")}
              </Label>
              <div className="space-y-2" ref={parent}>
                {emails.map((email, index) => (
                  <div className="flex flex-row space-x-1" key={email.key}>
                    <Input
                      disabled={!canEditPage}
                      id={`email-${index}`}
                      onChange={(e) => {
                        const newEmails = [...emails];
                        newEmails[index] = {
                          key: email.key,
                          value: e.target.value,
                        };
                        setEmails(newEmails);
                      }}
                      placeholder={"layla@example.com"}
                      type="email"
                      value={email.value}
                    />
                    <Button
                      className={cn(
                        "items-center justify-center",
                        emails.length === 1 && "hidden",
                      )}
                      disabled={emails.length === 1}
                      onClick={() => {
                        const newEmails = [...emails];
                        newEmails.splice(index, 1);
                        setEmails(newEmails);
                      }}
                      size={"sm"}
                      type="button"
                      variant={"outline"}
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
              className="h-8 p-2 text-xs"
              disabled={!emails.some((x) => x.value.length) || !canEditPage}
              onClick={() => {
                const newEmails = [...emails];
                newEmails.push({ key: Math.random(), value: "" });
                setEmails(newEmails);
              }}
              size={"sm"}
              type="button"
              variant={"secondary"}
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
            disabled={!emails.some((x) => x.value.length) || !canEditPage}
            onClick={() => {
              if (
                emails.length > 0 &&
                emails.filter((x) => Boolean(x)).length > 0
              )
                setOpen(true);
            }}
            type="button"
          >
            {t("Invite")}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
