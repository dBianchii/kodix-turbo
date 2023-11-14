"use client";

import { useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Loader2, MinusCircle, PlusCircle } from "lucide-react";

import { inviteUserSchema } from "@kdx/api/src/shared";
import type { Session } from "@kdx/auth";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  cn,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Separator,
  toast,
} from "@kdx/ui";

import { api } from "~/trpc/react";

export default function WorkspaceInviteCardClient({
  session,
}: {
  session: Session;
}) {
  const utils = api.useUtils();
  const [loading, setLoading] = useState(false);
  const { mutate } = api.workspace.invitation.invite.useMutation({
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors;
      if (errorMessage?.workspaceUrl)
        return toast.error(errorMessage?.workspaceUrl?.[0]);

      toast.error(
        error.message || "Oops, something went wrong. Please try again later",
      );
    },
    onSuccess: () => {
      toast.success(`Invitation(s) sent!`);
      setOpen(false);
      setEmails([""]);
      void utils.workspace.invitation.getAll.invalidate();
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const [emails, setEmails] = useState([""]);
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
              <Label htmlFor="email-0" className="text-muted-foreground mb-1">
                Email Address
              </Label>
              <div ref={parent} className="space-y-2">
                {emails.map((email, index) => (
                  <div
                    key={"email" + index}
                    className="flex flex-row space-x-1"
                  >
                    <Input
                      id={`email-${index}`}
                      type="email"
                      value={email}
                      onChange={(e) => {
                        const newEmails = [...emails];
                        newEmails[index] = e.target.value;
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
                      <MinusCircle className="h-4 w-4 " />
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
                newEmails.push("");
                setEmails(newEmails);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add more
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t px-6 py-4">
          <Dialog onOpenChange={setOpen} open={open}>
            <Button type="submit">Invite</Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite to Workspace</DialogTitle>
                <DialogDescription>
                  You are about to invite the following Workspace members, are
                  you sure you want to continue?
                </DialogDescription>
              </DialogHeader>
              <div className="my-4 flex flex-col space-y-2">
                {emails
                  .filter((x) => Boolean(x))
                  .map((email) => (
                    <div
                      className="m-0 rounded-md border p-3"
                      key={Math.random()}
                    >
                      {email}
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
                      workspaceId: session.user.activeWorkspaceId,
                      to: emails.filter((x) => Boolean(x)),
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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending
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
