"use client";

import { useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { LuLoader2, LuMailCheck } from "react-icons/lu";
import { RxMinusCircled, RxPlusCircled } from "react-icons/rx";

import type { Session } from "@kdx/auth";
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
  DialogClose,
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
import { cn } from "@kdx/ui/utils";
import { inviteUserSchema } from "@kdx/validators";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

export default function TeamInviteCardClient({
  session,
}: {
  session: Session;
}) {
  const utils = api.useUtils();
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState([{ key: 0, value: "" }]); //key is used to work with formkit
  const [successes, setSuccesses] = useState<string[]>([]);

  const { mutate } = api.team.invitation.invite.useMutation({
    onSuccess: ({ successes, failures }) => {
      if (successes.length > 0)
        toast.success(
          `Invitation(s) sent${
            failures.length ? ` to ${successes.join(", ")}` : "!"
          }`,
        );
      if (failures.length > 0)
        toast.error(`Failed to send invitation(s) to ${failures.join(", ")}`, {
          important: true,
        });
      setSuccesses(successes);
      void utils.team.invitation.getAll.invalidate();

      setTimeout(() => {
        closeDialog();
      }, 2000);
    },
    onError: (e) => trpcErrorToastDefault(e),
    onSettled: () => {
      setLoading(false);
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
          <CardDescription>Invite new members by email address</CardDescription>
          <Dialog>
            {/* <DialogTrigger asChild>
            <Button variant={"outline"} size={"sm"}>
              <Link className="mr-2 h-4 w-4" />
              Invite Link
            </Button>
          </DialogTrigger> */}
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Event</DialogTitle>
              </DialogHeader>
              <DialogDescription></DialogDescription>
              <DialogFooter></DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Separator className="mb-6" />
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email-0" className="mb-1 text-muted-foreground">
                Email Address
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
                      placeholder={"layla@gmail.com"}
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
                      <RxMinusCircled className="h-4 w-4 " />
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
              <RxPlusCircled className="mr-2 h-4 w-4" />
              Add more
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
              Invite
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite to Team</DialogTitle>
                <DialogDescription>
                  You are about to invite the following Team members, are you
                  sure you want to continue?
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

                      <LuMailCheck
                        className={cn(
                          "text-green-600 fade-in-0",
                          !successes.includes(email.value) && "hidden",
                        )}
                      />
                    </div>
                  ))}
              </div>
              <DialogFooter className="flex flex-row">
                <DialogClose asChild>
                  <Button
                    className="mr-auto"
                    variant={"outline"}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  className="mx-auto"
                  disabled={loading}
                  onClick={() => {
                    setLoading(true);
                    const values = {
                      teamId: session.user.activeTeamId,
                      to: emails.map((x) => x.value).filter((x) => Boolean(x)),
                    };
                    const parsed = inviteUserSchema.safeParse(values);
                    if (!parsed.success) {
                      return toast.error(parsed.error.errors[0]?.message);
                    }
                    mutate(values);
                  }}
                >
                  {loading ? (
                    <>
                      <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Sending
                    </>
                  ) : (
                    "Confirm"
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
