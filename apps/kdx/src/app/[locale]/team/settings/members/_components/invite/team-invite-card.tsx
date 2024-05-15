"use client";

import { useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { LuLoader2 } from "react-icons/lu";
import {
  RxEnvelopeClosed,
  RxMinusCircled,
  RxPlusCircled,
} from "react-icons/rx";

import type { Session } from "@kdx/auth";
import { useI18n } from "@kdx/locales/client";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@kdx/ui/dialog";
import { Input } from "@kdx/ui/input";
import { Label } from "@kdx/ui/label";
import { Separator } from "@kdx/ui/separator";
import { toast } from "@kdx/ui/toast";
import { ZInviteInputSchema } from "@kdx/validators/trpc/invitation";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

export default function TeamInviteCardClient({
  session,
}: {
  session: Session;
}) {
  const utils = api.useUtils();
  const [emails, setEmails] = useState([{ key: 0, value: "" }]); //key is used to work with formkit
  const [successes, setSuccesses] = useState<string[]>([]);

  const t = useI18n();

  const mutation = api.team.invitation.invite.useMutation({
    onSuccess: ({ successes, failures }) => {
      if (successes.length > 0) {
        toast.success(
          successes.length
            ? t("Invitations sent to people", { people: successes.join(", ") })
            : t("Invitations sent"),
        );
      }
      if (failures.length > 0)
        toast.error(
          t("Failed to send invitation to people", {
            people: failures.join(", "),
          }),
          {
            important: false,
          },
        );
      setSuccesses(successes);

      setTimeout(() => {
        closeDialog();
      }, 2000);
    },
    onError: (e) => trpcErrorToastDefault(e),
    onSettled: () => {
      void utils.team.invitation.getAll.invalidate();
    },
  });

  const closeDialog = () => {
    const failures = emails.filter((x) => !successes.includes(x.value));
    setEmails(failures.length > 0 ? failures : [{ key: 0, value: "" }]); // Keep the failed to send emails
    setSuccesses([]);
    setOpen(false);
  };

  const [parent] = useAutoAnimate();

  const [open, setOpen] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        emails.length > 0 &&
          emails.filter((x) => Boolean(x)).length > 0 &&
          setOpen(true);
      }}
    >
      <Card className="w-full text-left">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardDescription>
            {t("Invite new members by email address")}
          </CardDescription>
          <Dialog>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("Edit Event")}</DialogTitle>
              </DialogHeader>
            </DialogContent>
          </Dialog>
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
                      <RxMinusCircled className="size-4 " />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-2">
            <Button
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
        <CardFooter className="flex justify-end border-t px-6 py-4">
          <Dialog
            onOpenChange={(open) => {
              if (!open) return closeDialog();
              setOpen(open);
            }}
            open={open}
          >
            <Button
              type="submit"
              disabled={!emails.some((x) => x.value.length)}
            >
              {t("Invite")}
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("Invite to team")}</DialogTitle>
                <DialogDescription>
                  {t(
                    "You are about to invite the following Team members are you sure you want to continue",
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="my-4 flex flex-col space-y-2">
                {emails
                  .filter((x) => Boolean(x))
                  .map((email) => (
                    <div
                      className="m-0 flex justify-between rounded-md border p-3"
                      key={Math.random()}
                    >
                      {email.value}

                      <RxEnvelopeClosed
                        className={cn(
                          "text-green-600 fade-in-0",
                          !successes.includes(email.value) && "hidden",
                        )}
                      />
                    </div>
                  ))}
              </div>
              <DialogFooter className="justify-end">
                <Button
                  disabled={mutation.isPending}
                  onClick={() => {
                    const values = {
                      teamId: session.user.activeTeamId,
                      to: emails.map((x) => x.value).filter((x) => Boolean(x)),
                    };
                    const parsed = ZInviteInputSchema.safeParse(values);
                    if (!parsed.success) {
                      return toast.error(parsed.error.errors[0]?.message);
                    }
                    mutation.mutate(values);
                  }}
                >
                  {mutation.isPending ? (
                    <>
                      <LuLoader2 className="mr-2 size-4 animate-spin" />{" "}
                      {t("Sending")}
                    </>
                  ) : (
                    t("Confirm")
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </form>
  );
}
